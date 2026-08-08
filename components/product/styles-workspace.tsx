"use client";

import type { ChangeEvent, MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Style = {
  id: string;
  instructions: string;
  isActive: boolean;
  name: string;
};

export function StylesWorkspace() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStyles = useCallback(async () => {
    const response = await fetch("/api/styles", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Could not load styles");
    }
    setStyles((await response.json()) as Style[]);
  }, []);

  useEffect(() => {
    loadStyles().catch(() => toast.error("Could not load custom styles"));
  }, [loadStyles]);

  const createStyle = useCallback(async () => {
    if (!(name.trim() && instructions.trim())) {
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/styles", {
        body: JSON.stringify({ instructions, name }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        toast.error("Could not create style");
        return;
      }
      setName("");
      setInstructions("");
      await loadStyles();
      toast.success("Style created");
    } finally {
      setBusy(false);
    }
  }, [instructions, loadStyles, name]);

  const mutateStyle = useCallback(
    async (id: string, method: "PATCH" | "DELETE") => {
      setBusy(true);
      try {
        const response = await fetch("/api/styles", {
          body: JSON.stringify({ id }),
          headers: { "content-type": "application/json" },
          method,
        });
        if (!response.ok) {
          toast.error(
            method === "PATCH"
              ? "Could not activate style"
              : "Could not delete style"
          );
          return;
        }
        await loadStyles();
      } finally {
        setBusy(false);
      }
    },
    [loadStyles]
  );

  const handleStyleAction = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const { action, id } = event.currentTarget.dataset;
      if (!(id && (action === "activate" || action === "delete"))) {
        return;
      }
      mutateStyle(id, action === "activate" ? "PATCH" : "DELETE").catch(() => {
        toast.error("Style action failed");
      });
    },
    [mutateStyle]
  );

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    []
  );

  const handleInstructionsChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setInstructions(event.target.value);
    },
    []
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">Customize</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">
          Custom styles
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Create named response personalities and make one active. The active
          style is injected server-side into normal chats.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-medium text-sm">New style</h2>
          <input
            className="mt-4 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
            onChange={handleNameChange}
            placeholder="Style name"
            value={name}
          />
          <textarea
            className="mt-3 min-h-48 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none"
            onChange={handleInstructionsChange}
            placeholder="Example: Be concise, practical, and use short headings only when useful."
            value={instructions}
          />
          <Button
            className="mt-3"
            disabled={busy || !name.trim() || !instructions.trim()}
            onClick={createStyle}
          >
            Create style
          </Button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-medium text-sm">Saved styles</h2>
          <div className="mt-4 flex flex-col gap-3">
            {styles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No custom styles yet.
              </p>
            ) : (
              styles.map((style) => (
                <div
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  key={style.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{style.name}</p>
                      <p className="mt-1 line-clamp-3 text-muted-foreground text-xs">
                        {style.instructions}
                      </p>
                    </div>
                    {style.isActive ? (
                      <span className="rounded-full border px-2 py-1 text-[11px]">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {style.isActive ? null : (
                      <Button
                        data-action="activate"
                        data-id={style.id}
                        disabled={busy}
                        onClick={handleStyleAction}
                        size="sm"
                        variant="outline"
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      data-action="delete"
                      data-id={style.id}
                      disabled={busy}
                      onClick={handleStyleAction}
                      size="sm"
                      variant="ghost"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
