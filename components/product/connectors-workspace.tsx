"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Connector = {
  auth_performer?: "ADMIN" | "PER_USER";
  auth_template?: {
    headers: Record<string, string>;
    required_fields: string[];
  } | null;
  auth_type?: "NONE" | "API_TOKEN" | "OAUTH" | "PT_OAUTH";
  description?: string | null;
  id: number;
  is_authenticated: boolean;
  name: string;
  status: string;
  tool_count: number;
  user_authenticated?: boolean;
};

type ConnectorCardProps = {
  busy: boolean;
  connector: Connector;
  onRefresh: () => Promise<void>;
};

function ConnectorCard({ busy, connector, onRefresh }: ConnectorCardProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const connected = connector.user_authenticated ?? connector.is_authenticated;
  const fields = connector.auth_template?.required_fields ?? [];
  const oauth =
    connector.auth_type === "OAUTH" || connector.auth_type === "PT_OAUTH";

  const handleCredentialChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const field = event.currentTarget.name;
      setCredentials((current) => ({
        ...current,
        [field]: event.currentTarget.value,
      }));
    },
    []
  );

  const startOAuth = useCallback(async () => {
    const response = await fetch(`/api/connectors/${connector.id}/oauth`, {
      body: JSON.stringify({ returnPath: "/connectors" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      toast.error("Could not start connector authorization");
      return;
    }
    const result = (await response.json()) as { oauth_url: string };
    window.location.assign(result.oauth_url);
  }, [connector.id]);

  const saveCredentials = useCallback(async () => {
    if (
      fields.some((field) => !credentials[field]?.trim()) ||
      fields.length === 0
    ) {
      toast.error("Fill every required credential field");
      return;
    }
    const response = await fetch(`/api/connectors/${connector.id}/credentials`, {
      body: JSON.stringify({ credentials }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      toast.error("Could not save connector credentials");
      return;
    }
    await onRefresh();
    toast.success("Connector connected");
  }, [connector.id, credentials, fields, onRefresh]);

  const disconnect = useCallback(async () => {
    const response = await fetch(`/api/connectors/${connector.id}/credentials`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Could not disconnect connector");
      return;
    }
    await onRefresh();
    toast.success("Connector disconnected");
  }, [connector.id, onRefresh]);

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium text-sm">{connector.name}</h2>
          <p className="mt-1 text-muted-foreground text-xs">
            {connector.description ||
              `${connector.tool_count} available tools`}
          </p>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-xs">
          {connected ? "Connected" : connector.status}
        </span>
      </div>

      {!connected && !oauth && fields.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {fields.map((field) => (
            <input
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none"
              key={field}
              name={field}
              onChange={handleCredentialChange}
              placeholder={field}
              type="password"
              value={credentials[field] ?? ""}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        {connected ? (
          <Button disabled={busy} onClick={disconnect} variant="outline">
            Disconnect
          </Button>
        ) : oauth ? (
          <Button disabled={busy} onClick={startOAuth}>
            Connect with OAuth
          </Button>
        ) : fields.length > 0 ? (
          <Button disabled={busy} onClick={saveCredentials}>
            Save credentials
          </Button>
        ) : (
          <p className="text-muted-foreground text-xs">
            No per-user authentication is required.
          </p>
        )}
      </div>
    </article>
  );
}

export function ConnectorsWorkspace() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/connectors", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load connectors");
    }
    setConnectors((await response.json()) as Connector[]);
  }, []);

  const refresh = useCallback(async () => {
    setIsBusy(true);
    try {
      await load();
    } finally {
      setIsBusy(false);
    }
  }, [load]);

  useEffect(() => {
    load().catch(() => toast.error("Could not load connectors"));
  }, [load]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">Workspace</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">
          Connectors
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Connect MCP services so chat can use external tools through the
          server-side Onyx integration.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {connectors.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card p-5 text-muted-foreground text-sm shadow-sm">
            No MCP connectors are currently exposed by Onyx.
          </div>
        ) : (
          connectors.map((connector) => (
            <ConnectorCard
              busy={isBusy}
              connector={connector}
              key={connector.id}
              onRefresh={refresh}
            />
          ))
        )}
      </section>
    </main>
  );
}
