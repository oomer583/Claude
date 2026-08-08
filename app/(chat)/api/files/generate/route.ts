import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { generateOnyxFile } from "@/lib/integrations/onyx/file-generation";

const requestSchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[^\\/:*?"<>|]+$/, "Filename contains invalid characters"),
  format: z.enum(["docx", "xlsx", "pptx", "pdf"]),
  instructions: z.string().trim().min(1).max(20_000),
});

export const maxDuration = 300;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid file generation request" },
      { status: 400 }
    );
  }

  try {
    const credential = await getOrCreateOnyxCredential(session.user.id);
    const result = await generateOnyxFile({
      bearerToken: credential.bearerToken,
      ...parsed.data,
    });

    return Response.json({
      answer: result.answer_citationless || result.answer,
      format: parsed.data.format,
    });
  } catch (error) {
    console.error("File generation failed", error);
    return Response.json(
      { error: "File generation service is unavailable" },
      { status: 502 }
    );
  }
}
