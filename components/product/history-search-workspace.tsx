"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type SearchResult = {
  createdAt: string;
  id: string;
  projectId: string | null;
  title: string;
};

export function HistorySearchWorkspace() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);

  const search = useCallback(async () => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setResults([]);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(
        `/api/history/search?q=${encodeURIComponent(normalized)}`,
        {
          cache: "no-store",
        }
      );
      if (!response.ok) {
        toast.error("Could not search chats");
        return;
      }
      setResults((await response.json()) as SearchResult[]);
    } finally {
      setBusy(false);
    }
  }, [query]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      search().catch(() => toast.error("Chat search failed"));
    },
    [search]
  );

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    []
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">History</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">
          Search past chats
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Search your saved chat titles and message content. Results stay scoped
          to your account.
        </p>
      </div>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none"
          onChange={handleQueryChange}
          placeholder="Search previous conversations..."
          value={query}
        />
        <Button disabled={busy || query.trim().length < 2} type="submit">
          {busy ? "Searching..." : "Search"}
        </Button>
      </form>

      <section className="flex flex-col gap-3">
        {results.length === 0 ? (
          <p className="text-muted-foreground text-sm">No results yet.</p>
        ) : (
          results.map((result) => (
            <Link
              className="rounded-xl border border-border/70 bg-card p-4 transition hover:bg-muted/30"
              href={`/chat/${result.id}${result.projectId ? `?project=${encodeURIComponent(result.projectId)}` : ""}`}
              key={result.id}
            >
              <p className="font-medium text-sm">{result.title}</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {new Date(result.createdAt).toLocaleString()}
              </p>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
