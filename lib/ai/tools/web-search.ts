import { tool } from "ai";
import { z } from "zod";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { searchOnyxWeb } from "@/lib/integrations/onyx/web-search";
import { consumeQuota } from "@/lib/usage/quotas";

export function webSearch({ userId }: { userId: string }) {
  return tool({
    description:
      "Search the public web for current information and return source titles, URLs, snippets, and fetched page content. Use this for recent or externally verifiable information.",
    execute: async ({ maxResults, queries }) => {
      const quota = await consumeQuota({
        cost: queries.length,
        resource: "webSearch",
        userId,
      });
      if (!quota.allowed) {
        return { error: "Web search limit reached", quota };
      }

      const credential = await getOrCreateOnyxCredential(userId);
      const result = await searchOnyxWeb({
        bearerToken: credential.bearerToken,
        maxResults,
        queries,
      });

      return {
        contentProvider: result.content_provider_type,
        pages: result.full_content_results,
        quota,
        searchProvider: result.search_provider_type,
        sources: result.search_results,
      };
    },
    inputSchema: z.object({
      maxResults: z.number().int().min(1).max(10).default(5),
      queries: z
        .array(z.string().trim().min(1).max(512))
        .min(1)
        .max(3)
        .describe("One to three concise web search queries."),
    }),
  });
}
