"use client";

import type { ChangeEvent, MouseEvent } from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type FileFormat = "docx" | "xlsx" | "pptx" | "pdf";

export function ToolsWorkspace() {
  const [code, setCode] = useState("print('hello')");
  const [codeResult, setCodeResult] = useState("");
  const [format, setFormat] = useState<FileFormat>("pdf");
  const [filename, setFilename] = useState("output.pdf");
  const [instructions, setInstructions] = useState("");
  const [fileResult, setFileResult] = useState("");
  const [busy, setBusy] = useState<"code" | "file" | null>(null);

  const runCode = useCallback(async () => {
    if (!code.trim()) {
      return;
    }
    setBusy("code");
    setCodeResult("");
    try {
      const response = await fetch("/api/code", {
        body: JSON.stringify({ code }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const body = (await response.json()) as {
        error?: string;
        result?: string;
      };
      if (!response.ok) {
        toast.error(body.error ?? "Code execution failed");
        return;
      }
      setCodeResult(body.result ?? "Execution completed without text output.");
    } catch {
      toast.error("Code execution service is unavailable");
    } finally {
      setBusy(null);
    }
  }, [code]);

  const generateFile = useCallback(async () => {
    if (!(filename.trim() && instructions.trim())) {
      return;
    }
    setBusy("file");
    setFileResult("");
    try {
      const response = await fetch("/api/files/generate", {
        body: JSON.stringify({ filename, format, instructions }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const body = (await response.json()) as {
        answer?: string;
        error?: string;
      };
      if (!response.ok) {
        toast.error(body.error ?? "File generation failed");
        return;
      }
      setFileResult(body.answer ?? "File generated.");
    } catch {
      toast.error("File generation service is unavailable");
    } finally {
      setBusy(null);
    }
  }, [filename, format, instructions]);

  const handleFormatClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const next = event.currentTarget.dataset.format as FileFormat | undefined;
      if (!next) {
        return;
      }
      setFormat(next);
      setFilename((current) => {
        const base =
          current.replace(/\.(docx|xlsx|pptx|pdf)$/i, "") || "output";
        return `${base}.${next}`;
      });
    },
    []
  );

  const handleCodeChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setCode(event.target.value);
    },
    []
  );

  const handleFilenameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilename(event.target.value);
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">Workspace</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">Tools</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Use the isolated Onyx Code Interpreter directly or generate real
          Office/PDF files without waiting for the model to decide which tool to
          call.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-medium text-sm">Code execution</h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Python runs in the configured isolated Code Interpreter service.
          </p>
          <textarea
            className="mt-4 min-h-64 w-full rounded-xl border border-border bg-background p-3 font-mono text-sm outline-none"
            onChange={handleCodeChange}
            spellCheck={false}
            value={code}
          />
          <Button
            className="mt-3"
            disabled={busy === "code" || !code.trim()}
            onClick={runCode}
          >
            {busy === "code" ? "Running..." : "Run Python"}
          </Button>
          {codeResult ? (
            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-xs">
              {codeResult}
            </pre>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-medium text-sm">File generation</h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Create DOCX, XLSX, PPTX, or PDF output through the same sandbox.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {(["docx", "xlsx", "pptx", "pdf"] as const).map((value) => (
              <Button
                data-format={value}
                key={value}
                onClick={handleFormatClick}
                size="sm"
                variant={format === value ? "default" : "outline"}
              >
                {value.toUpperCase()}
              </Button>
            ))}
          </div>
          <input
            className="mt-3 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
            onChange={handleFilenameChange}
            placeholder="Filename"
            value={filename}
          />
          <textarea
            className="mt-3 min-h-44 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none"
            onChange={handleInstructionsChange}
            placeholder="Describe exactly what the file should contain..."
            value={instructions}
          />
          <Button
            className="mt-3"
            disabled={
              busy === "file" || !filename.trim() || !instructions.trim()
            }
            onClick={generateFile}
          >
            {busy === "file" ? "Generating..." : "Generate file"}
          </Button>
          {fileResult ? (
            <div className="mt-4 whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm">
              {fileResult}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
