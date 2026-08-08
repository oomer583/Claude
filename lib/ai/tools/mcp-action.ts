import { tool } from "ai";
import { z } from "zod";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { runOnyxMcpAction } from "@/lib/integrations/onyx/mcp";

export function mcpAction({ userId }: { userId: string }) {
  return tool({
    description:
      "Use one of the user's connected MCP apps/actions when the request requires interacting with an external service. Do not use this for ordinary web search or local reasoning.",
    execute: async ({ instruction }) => {
      const credential = await getOrCreateOnyxCredential(userId);
      const result = await runOnyxMcpAction({
        bearerToken: credential.bearerToken,
        instruction,
      });

      return {
        result: result.answer_citationless || result.answer,
      };
    },
    inputSchema: z.object({
      instruction: z
        .string()
        .trim()
        .min(1)
        .max(4000)
        .describe(
          "A precise instruction describing the external app action to perform and the information needed back."
        ),
    }),
  });
}
