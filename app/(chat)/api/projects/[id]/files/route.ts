import { auth } from "@/app/(auth)/auth";
import {
  getOrCreateOnyxCredential,
  getProjectByIdForUser,
} from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import {
  listOnyxProjectFiles,
  uploadOnyxProjectFiles,
} from "@/lib/integrations/onyx/projects";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 10;

async function resolveProject(id: string, userId: string) {
  return getProjectByIdForUser({ id, userId });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const productProject = await resolveProject(id, session.user.id);
  if (!productProject) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const files = await listOnyxProjectFiles({
    bearerToken: credential.bearerToken,
    projectId: productProject.onyxProjectId,
  });

  return Response.json(files);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const productProject = await resolveProject(id, session.user.id);
  if (!productProject) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const form = await request.formData();
  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (files.length < 1 || files.length > MAX_FILES_PER_REQUEST) {
    return Response.json(
      { error: `Upload between 1 and ${MAX_FILES_PER_REQUEST} files` },
      { status: 400 }
    );
  }

  if (files.some((file) => file.size > MAX_FILE_BYTES)) {
    return Response.json(
      { error: "A file exceeds the 25 MB request limit" },
      { status: 413 }
    );
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await uploadOnyxProjectFiles({
    bearerToken: credential.bearerToken,
    files,
    projectId: productProject.onyxProjectId,
  });

  return Response.json(result, { status: 201 });
}
