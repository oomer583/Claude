import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { runOnyxDeepResearch } from "@/lib/integrations/onyx/deep-research";
import { consumeQuota } from "@/lib/usage/quotas";

export const maxDuration = 300;

const requestSchema = z.object({
  query: z.string().trim().min(1).max(20_000),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const quota = await consumeQuota({
    resource: "research",
    userId: session.user.id,
  });
  if (!quota.allowed) {
    return Response.json(
      { error: "Deep research limit reached", quota },
      { status: 429 }
    );
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await runOnyxDeepResearch({
    bearerToken: credential.bearerToken,
    query: parsed.data.query,
  });

  return Response.json({
    answer: result.answer_citationless || result.answer,
    citations: result.citation_info,
    error: result.error_msg,
    quota,
    sources: result.top_documents,
  });
}
