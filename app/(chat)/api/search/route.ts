import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { searchOnyxWeb } from "@/lib/integrations/onyx/web-search";

const searchSchema = z.object({
  maxResults: z.number().int().min(1).max(10).default(5),
  queries: z.array(z.string().trim().min(1).max(512)).min(1).max(3),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = searchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await searchOnyxWeb({
    bearerToken: credential.bearerToken,
    maxResults: parsed.data.maxResults,
    queries: parsed.data.queries,
  });

  return Response.json({
    contentProvider: result.content_provider_type,
    pages: result.full_content_results,
    searchProvider: result.search_provider_type,
    sources: result.search_results,
  });
}
