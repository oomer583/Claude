"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  instructions?: string | null;
  name: string;
};

type ProjectFile = {
  chat_file_type: string;
  created_at: string;
  id: string;
  name: string;
  status: string;
};

export function ProjectsWorkspace() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const loadProjects = useCallback(async () => {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load projects");
    }
    const loaded = (await response.json()) as Project[];
    setProjects(loaded);
    setSelectedProjectId((current) => current ?? loaded[0]?.id ?? null);
  }, []);

  const loadProjectFiles = useCallback(async (projectId: string) => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load project files");
      }
      setProjectFiles((await response.json()) as ProjectFile[]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    loadProjects().catch(() => toast.error("Could not load projects"));
  }, [loadProjects]);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectFiles([]);
      return;
    }
    loadProjectFiles(selectedProjectId).catch(() => {
      setProjectFiles([]);
      toast.error("Could not load project knowledge files");
    });
  }, [loadProjectFiles, selectedProjectId]);

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
      await loadProjectFiles(selectedProjectId);
      toast.success("Files added to project knowledge");
    } finally {
      setIsBusy(false);
    }
  }, [files, loadProjectFiles, selectedProjectId]);

  const startProjectChat = useCallback(() => {
    if (!(selectedProjectId && selectedProject)) {
      return;
    }
    const params = new URLSearchParams({
      project: selectedProjectId,
      projectName: selectedProject.name,
    });
    router.push(`/?${params.toString()}`);
  }, [router, selectedProject, selectedProjectId]);

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

  const handleProjectChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedProjectId(event.target.value || null);
    },
    []
  );

  const handleFilesChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFiles(Array.from(event.target.files ?? []));
    },
    []
  );

  const handleProjectCardClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setSelectedProjectId(event.currentTarget.dataset.projectId ?? null);
    },
    []
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-10 md:px-8">
      <div>
        <p className="text-muted-foreground text-sm">Workspace</p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight">Projects</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Create reusable knowledge spaces, attach instructions, upload files,
          and launch a project-aware conversation directly from here.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="font-medium text-sm">Create project</h2>
          <div className="mt-4 flex flex-col gap-3">
            <input
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none"
              onChange={handleNameChange}
              placeholder="Project name"
              value={name}
            />
            <textarea
              className="min-h-28 rounded-lg border border-border bg-background p-3 text-sm outline-none"
              onChange={handleInstructionsChange}
              placeholder="Project instructions (optional)"
              value={instructions}
            />
            <Button disabled={isBusy || !name.trim()} onClick={createProject}>
              Create project
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium text-sm">Project knowledge</h2>
            <Button
              disabled={!selectedProjectId}
              onClick={startProjectChat}
              size="sm"
            >
              Chat in project
            </Button>
          </div>
          <select
            className="mt-4 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
            onChange={handleProjectChange}
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
            onChange={handleFilesChange}
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

          <div className="mt-5 border-border/60 border-t pt-4">
            <p className="font-medium text-xs">Knowledge files</p>
            {isLoadingFiles ? (
              <p className="mt-2 text-muted-foreground text-xs">Loading...</p>
            ) : projectFiles.length === 0 ? (
              <p className="mt-2 text-muted-foreground text-xs">
                No files in this project yet.
              </p>
            ) : (
              <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-auto">
                {projectFiles.map((file) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                    key={file.id}
                  >
                    <span className="min-w-0 truncate text-xs">{file.name}</span>
                    <span className="shrink-0 text-muted-foreground text-[11px]">
                      {file.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                data-project-id={project.id}
                key={project.id}
                onClick={handleProjectCardClick}
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
