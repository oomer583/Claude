"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  instructions?: string | null;
  name: string;
};

export function ProjectsWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const loadProjects = useCallback(async () => {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load projects");
    }
    const loaded = (await response.json()) as Project[];
    setProjects(loaded);
    setSelectedProjectId((current) => current ?? loaded[0]?.id ?? null);
  }, []);

  useEffect(() => {
    loadProjects().catch(() => toast.error("Could not load projects"));
  }, [loadProjects]);

  const createProject = useCallback(async () => {
    if (!name.trim()) {
      return;
    }
    setIsBusy(true);
    try {
      const response = await fetch("/api/projects", {
        body: JSON.stringify({
          instructions: instructions.trim() || undefined,
          name: name.trim(),
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        toast.error("Could not create project");
        return;
      }
      setName("");
      setInstructions("");
      await loadProjects();
      toast.success("Project created");
    } finally {
      setIsBusy(false);
    }
  }, [instructions, loadProjects, name]);

  const uploadFiles = useCallback(async () => {
    if (!selectedProjectId || files.length === 0) {
      return;
    }
    setIsBusy(true);
    try {
      const form = new FormData();
      for (const file of files) {
        form.append("files", file);
      }
      const response = await fetch(`/api/projects/${selectedProjectId}/files`, {
        body: form,
        method: "POST",
      });
      if (!response.ok) {
        toast.error("Project upload failed");
        return;
      }
      setFiles([]);
      toast.success("Files added to project knowledge");
    } finally {
      setIsBusy(false);
    }
  }, [files, selectedProjectId]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">Workspace</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">Projects</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Create reusable knowledge spaces, attach instructions, and upload
          files for project-aware conversations.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-medium text-sm">Create project</h2>
          <div className="mt-4 flex flex-col gap-3">
            <input
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none"
              onChange={(event) => setName(event.target.value)}
              placeholder="Project name"
              value={name}
            />
            <textarea
              className="min-h-28 rounded-lg border border-border bg-background p-3 text-sm outline-none"
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Project instructions (optional)"
              value={instructions}
            />
            <Button disabled={isBusy || !name.trim()} onClick={createProject}>
              Create project
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-medium text-sm">Project knowledge</h2>
          <select
            className="mt-4 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
            onChange={(event) => setSelectedProjectId(event.target.value || null)}
            value={selectedProjectId ?? ""}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <input
            className="mt-3 block w-full text-sm"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            type="file"
          />
          <p className="mt-2 text-muted-foreground text-xs">
            Up to 10 files per request, 25 MB per file.
          </p>
          <Button
            className="mt-4"
            disabled={isBusy || !selectedProjectId || files.length === 0}
            onClick={uploadFiles}
          >
            Upload to project
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <h2 className="font-medium text-sm">Your projects</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-sm">No projects yet.</p>
          ) : (
            projects.map((project) => (
              <button
                className="rounded-xl border border-border/60 bg-muted/20 p-4 text-left transition hover:bg-muted/40"
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                type="button"
              >
                <p className="font-medium text-sm">{project.name}</p>
                <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                  {project.instructions || "No custom instructions"}
                </p>
              </button>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
