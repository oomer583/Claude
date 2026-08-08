import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { runOnyxMcpAction } from "@/lib/integrations/onyx/mcp";

const bodySchema = z.object({
  instruction: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await runOnyxMcpAction({
    bearerToken: credential.bearerToken,
    instruction: parsed.data.instruction,
  });

  return Response.json({
    result: result.answer_citationless || result.answer,
  });
}
