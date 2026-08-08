import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { runOnyxMcpAction } from "@/lib/integrations/onyx/mcp";
import { consumeQuota } from "@/lib/usage/quotas";

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

  const quota = await consumeQuota({
    resource: "mcp",
    userId: session.user.id,
  });
  if (!quota.allowed) {
    return Response.json(
      { error: "Connector action limit reached", quota },
      { status: 429 }
    );
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await runOnyxMcpAction({
    bearerToken: credential.bearerToken,
    instruction: parsed.data.instruction,
  });

  return Response.json({
    quota,
    result: result.answer_citationless || result.answer,
  });
}
