import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { executeOnyxPython } from "@/lib/integrations/onyx/code-execution";

const codeSchema = z.object({
  code: z.string().min(1).max(50_000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = codeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid code payload" }, { status: 400 });
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await executeOnyxPython({
    bearerToken: credential.bearerToken,
    code: parsed.data.code,
  });

  if (result.error_msg) {
    return Response.json({ error: result.error_msg }, { status: 502 });
  }

  return Response.json({
    result: result.answer_citationless || result.answer,
  });
}
