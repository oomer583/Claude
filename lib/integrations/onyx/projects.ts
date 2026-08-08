import "server-only";

import { onyxRequest } from "./client";
import type { OnyxProject, OnyxUploadResult, OnyxUserFile } from "./types";

export function listOnyxProjects(bearerToken: string) {
  return onyxRequest<OnyxProject[]>({
    bearerToken,
    path: "/user/projects",
  });
}

export function createOnyxProject({
  bearerToken,
  name,
}: {
  bearerToken: string;
  name: string;
}) {
  const params = new URLSearchParams({ name });
  return onyxRequest<OnyxProject>({
    bearerToken,
    init: { method: "POST" },
    path: `/user/projects/create?${params.toString()}`,
  });
}

export function getOnyxProject({
  bearerToken,
  projectId,
}: {
  bearerToken: string;
  projectId: number;
}) {
  return onyxRequest<OnyxProject>({
    bearerToken,
    path: `/user/projects/${projectId}`,
  });
}

export function listOnyxProjectFiles({
  bearerToken,
  projectId,
}: {
  bearerToken: string;
  projectId: number;
}) {
  return onyxRequest<OnyxUserFile[]>({
    bearerToken,
    path: `/user/projects/files/${projectId}`,
  });
}

export function uploadOnyxProjectFiles({
  bearerToken,
  files,
  projectId,
}: {
  bearerToken: string;
  files: File[];
  projectId: number;
}) {
  const form = new FormData();
  form.set("project_id", String(projectId));
  for (const file of files) {
    form.append("files", file, file.name);
  }

  return onyxRequest<OnyxUploadResult>({
    bearerToken,
    init: {
      body: form,
      method: "POST",
    },
    path: "/user/projects/file/upload",
    timeoutMs: 60_000,
  });
}

export function linkOnyxFileToProject({
  bearerToken,
  fileId,
  projectId,
}: {
  bearerToken: string;
  fileId: string;
  projectId: number;
}) {
  return onyxRequest<OnyxUserFile>({
    bearerToken,
    init: { method: "POST" },
    path: `/user/projects/${projectId}/files/${fileId}`,
  });
}

export function unlinkOnyxFileFromProject({
  bearerToken,
  fileId,
  projectId,
}: {
  bearerToken: string;
  fileId: string;
  projectId: number;
}) {
  return onyxRequest<void>({
    bearerToken,
    init: { method: "DELETE" },
    path: `/user/projects/${projectId}/files/${fileId}`,
  });
}
