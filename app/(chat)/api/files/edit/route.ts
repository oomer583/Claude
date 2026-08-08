import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { editOnyxOfficeFile } from "@/lib/integrations/onyx/file-editing";
import { consumeQuota } from "@/lib/usage/quotas";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(["docx", "xlsx", "pptx", "pdf"]);

export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const instructions = String(form.get("instructions") ?? "").trim();
  if (!(file instanceof File) || !instructions) {
    return Response.json({ error: "File and instructions are required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return Response.json({ error: "File exceeds the 25 MB limit" }, { status: 413 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return Response.json(
      { error: "Only DOCX, XLSX, PPTX, and PDF files can be edited" },
      { status: 400 }
    );
  }

  const quota = await consumeQuota({
    resource: "fileGeneration",
    userId: session.user.id,
  });
  if (!quota.allowed) {
    return Response.json({ error: "File generation limit reached", quota }, { status: 429 });
  }

  try {
    const credential = await getOrCreateOnyxCredential(session.user.id);
    const result = await editOnyxOfficeFile({
      bearerToken: credential.bearerToken,
      file,
      instructions: instructions.slice(0, 20_000),
    });
    if (result.error_msg) {
      return Response.json({ error: result.error_msg }, { status: 502 });
    }
    return Response.json({
      answer: result.answer_citationless || result.answer,
      quota,
    });
  } catch (error) {
    console.error("Office/PDF editing failed", error);
    return Response.json({ error: "File editing service is unavailable" }, { status: 502 });
  }
}
