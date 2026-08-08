"use client";

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

export function ConnectorsWorkspace() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [credentials, setCredentials] = useState<Record<number, Record<string, string>>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/connectors", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load connectors");
    }
    setConnectors((await response.json()) as Connector[]);
  }, []);

  useEffect(() => {
    load().catch(() => toast.error("Could not load connectors"));
  }, [load]);

  const startOAuth = useCallback(async (connector: Connector) => {
    setBusyId(connector.id);
    try {
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
    } finally {
      setBusyId(null);
    }
  }, []);

  const saveCredentials = useCallback(
    async (connector: Connector) => {
      const value = credentials[connector.id] ?? {};
      if (Object.values(value).some((entry) => !entry.trim())) {
        toast.error("Fill every required credential field");
        return;
      }
      setBusyId(connector.id);
      try {
        const response = await fetch(
          `/api/connectors/${connector.id}/credentials`,
          {
            body: JSON.stringify({ credentials: value }),
            headers: { "content-type": "application/json" },
            method: "POST",
          }
        );
        if (!response.ok) {
          toast.error("Could not save connector credentials");
          return;
        }
        await load();
        toast.success("Connector connected");
      } finally {
        setBusyId(null);
      }
    },
    [credentials, load]
  );

  const disconnect = useCallback(
    async (connector: Connector) => {
      setBusyId(connector.id);
      try {
        const response = await fetch(
          `/api/connectors/${connector.id}/credentials`,
          { method: "DELETE" }
        );
        if (!response.ok) {
          toast.error("Could not disconnect connector");
          return;
        }
        await load();
        toast.success("Connector disconnected");
      } finally {
        setBusyId(null);
      }
    },
    [load]
  );

  const updateCredential = useCallback(
    (connectorId: number, field: string, value: string) => {
      setCredentials((current) => ({
        ...current,
        [connectorId]: {
          ...(current[connectorId] ?? {}),
          [field]: value,
        },
      }));
    },
    []
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">Workspace</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">Connectors</h1>
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
          connectors.map((connector) => {
            const connected =
              connector.user_authenticated ?? connector.is_authenticated;
            const fields = connector.auth_template?.required_fields ?? [];
            const oauth =
              connector.auth_type === "OAUTH" || connector.auth_type === "PT_OAUTH";

            return (
              <article
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
                key={connector.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-sm">{connector.name}</h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {connector.description || `${connector.tool_count} available tools`}
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
                        onChange={(event) =>
                          updateCredential(connector.id, field, event.target.value)
                        }
                        placeholder={field}
                        type="password"
                        value={credentials[connector.id]?.[field] ?? ""}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="mt-4">
                  {connected ? (
                    <Button
                      disabled={busyId === connector.id}
                      onClick={() => disconnect(connector)}
                      variant="outline"
                    >
                      Disconnect
                    </Button>
                  ) : oauth ? (
                    <Button
                      disabled={busyId === connector.id}
                      onClick={() => startOAuth(connector)}
                    >
                      Connect with OAuth
                    </Button>
                  ) : fields.length > 0 ? (
                    <Button
                      disabled={busyId === connector.id}
                      onClick={() => saveCredentials(connector)}
                    >
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
          })
        )}
      </section>
    </main>
  );
}
