import { tool } from "ai";
import { z } from "zod";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { runOnyxDeepResearch } from "@/lib/integrations/onyx/deep-research";

export function deepResearch({ userId }: { userId: string }) {
  return tool({
    description:
      "Run an extended multi-step research task with sources and citations. Use only when the user explicitly asks for deep research, extensive research, or a thorough sourced investigation.",
    execute: async ({ query }) => {
      const credential = await getOrCreateOnyxCredential(userId);
      const result = await runOnyxDeepResearch({
        bearerToken: credential.bearerToken,
        query,
      });

      return {
        answer: result.answer_citationless || result.answer,
        citations: result.citation_info,
        error: result.error_msg,
        sources: result.top_documents,
      };
    },
    inputSchema: z.object({
      query: z.string().trim().min(1).max(20_000),
    }),
  });
}
