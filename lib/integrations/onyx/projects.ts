import "server-only";

import { onyxRequest } from "./client";
import type { OnyxProject, OnyxUploadResult, OnyxUserFile } from "./types";

export async function listOnyxProjects(bearerToken: string) {
  return onyxRequest<OnyxProject[]>({
    path: "/user/projects",
    bearerToken,
  });
}

export async function createOnyxProject({
  bearerToken,
  name,
}: {
  bearerToken: string;
  name: string;
}) {
  const params = new URLSearchParams({ name });
  return onyxRequest<OnyxProject>({
    path: `/user/projects/create?${params.toString()}`,
    bearerToken,
    init: { method: "POST" },
  });
}

export async function getOnyxProject({
  bearerToken,
  projectId,
}: {
  bearerToken: string;
  projectId: number;
}) {
  return onyxRequest<OnyxProject>({
    path: `/user/projects/${projectId}`,
    bearerToken,
  });
}

export async function listOnyxProjectFiles({
  bearerToken,
  projectId,
}: {
  bearerToken: string;
  projectId: number;
}) {
  return onyxRequest<OnyxUserFile[]>({
    path: `/user/projects/files/${projectId}`,
    bearerToken,
  });
}

export async function uploadOnyxProjectFiles({
  bearerToken,
  projectId,
  files,
}: {
  bearerToken: string;
  projectId: number;
  files: File[];
}) {
  const form = new FormData();
  form.set("project_id", String(projectId));
  for (const file of files) {
    form.append("files", file, file.name);
  }

  return onyxRequest<OnyxUploadResult>({
    path: "/user/projects/file/upload",
    bearerToken,
    init: {
      method: "POST",
      body: form,
    },
    timeoutMs: 60_000,
  });
}

export async function linkOnyxFileToProject({
  bearerToken,
  projectId,
  fileId,
}: {
  bearerToken: string;
  projectId: number;
  fileId: string;
}) {
  return onyxRequest<OnyxUserFile>({
    path: `/user/projects/${projectId}/files/${fileId}`,
    bearerToken,
    init: { method: "POST" },
  });
}

export async function unlinkOnyxFileFromProject({
  bearerToken,
  projectId,
  fileId,
}: {
  bearerToken: string;
  projectId: number;
  fileId: string;
}) {
  return onyxRequest<void>({
    path: `/user/projects/${projectId}/files/${fileId}`,
    bearerToken,
    init: { method: "DELETE" },
  });
}
