"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type QuotaRule = {
  limit: number;
  windowSeconds: number;
};

type QuotaSnapshot = {
  limits: Record<string, QuotaRule> | null;
  plan: "free" | "premium" | "owner";
};

const RESOURCE_LABELS: Record<string, string> = {
  code: "Code execution",
  fileGeneration: "File generation",
  mcp: "Connector actions",
  messages: "Messages",
  research: "Deep research",
  uploads: "Project uploads",
  webSearch: "Web search",
};

function formatWindow(seconds: number) {
  if (seconds % (30 * 24 * 60 * 60) === 0) {
    return `${seconds / (30 * 24 * 60 * 60)} month`;
  }
  if (seconds % (24 * 60 * 60) === 0) {
    return `${seconds / (24 * 60 * 60)} day`;
  }
  if (seconds % (60 * 60) === 0) {
    return `${seconds / (60 * 60)} hour`;
  }
  return `${seconds} seconds`;
}

export function UsageAndPromo() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [snapshot, setSnapshot] = useState<QuotaSnapshot | null>(null);

  const loadUsage = useCallback(async () => {
    const response = await fetch("/api/usage", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load usage limits");
    }
    setSnapshot((await response.json()) as QuotaSnapshot);
  }, []);

  useEffect(() => {
    loadUsage()
      .catch(() => {
        toast.error("Could not load your plan and limits");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadUsage]);

  const sortedLimits = useMemo(() => {
    if (!snapshot?.limits) {
      return [];
    }
    return Object.entries(snapshot.limits).sort(([left], [right]) =>
      left.localeCompare(right)
    );
  }, [snapshot]);

  const redeemPromo = useCallback(async () => {
    const normalizedCode = code.trim();
    if (!normalizedCode) {
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await fetch("/api/promocodes/redeem", {
        body: JSON.stringify({ code: normalizedCode }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        toast.error("Promo code is invalid or unavailable");
        return;
      }

      setCode("");
      await loadUsage();
      toast.success("Promo code applied");
    } catch {
      toast.error("Could not redeem the promo code");
    } finally {
      setIsRedeeming(false);
    }
  }, [code, loadUsage]);

  const handleCodeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCode(event.target.value);
    },
    []
  );

  const handleCodeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        redeemPromo().catch(() => {
          toast.error("Could not redeem the promo code");
        });
      }
    },
    [redeemPromo]
  );

  const handleRedeemClick = useCallback(() => {
    redeemPromo().catch(() => {
      toast.error("Could not redeem the promo code");
    });
  }, [redeemPromo]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">Account</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">
          Plan & usage
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground text-sm">
          Review your current product limits and apply a promo code to your
          account.
        </p>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Current plan</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Server-side limits are enforced for every protected feature.
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1 font-medium text-xs uppercase tracking-wide">
            {isLoading ? "Loading" : (snapshot?.plan ?? "Unknown")}
          </span>
        </div>

        {snapshot?.plan === "owner" ? (
          <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
            Owner access is active. Product quotas are unlimited for this
            account.
          </div>
        ) : (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {sortedLimits.map(([resource, rule]) => (
              <div
                className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                key={resource}
              >
                <p className="font-medium text-sm">
                  {RESOURCE_LABELS[resource] ?? resource}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {rule.limit.toLocaleString()} per{" "}
                  {formatWindow(rule.windowSeconds)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <p className="font-medium text-sm">Promo code</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Enter a private or campaign promo code. Codes are validated on the
          server.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            aria-label="Promo code"
            autoComplete="off"
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/20"
            onChange={handleCodeChange}
            onKeyDown={handleCodeKeyDown}
            placeholder="Enter promo code"
            value={code}
          />
          <Button
            disabled={!code.trim() || isRedeeming}
            onClick={handleRedeemClick}
            type="button"
          >
            {isRedeeming ? "Applying..." : "Apply code"}
          </Button>
        </div>
      </section>
    </div>
  );
}
