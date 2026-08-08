import { tool } from "ai";
import { z } from "zod";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { executeOnyxPython } from "@/lib/integrations/onyx/code-execution";

export function codeExecution({ userId }: { userId: string }) {
  return tool({
    description:
      "Execute Python in an isolated Onyx Code Interpreter sandbox for calculations, data analysis, transformations, and programmatic tasks. Use execution instead of guessing results.",
    execute: async ({ code }) => {
      const credential = await getOrCreateOnyxCredential(userId);
      const result = await executeOnyxPython({
        bearerToken: credential.bearerToken,
        code,
      });

      if (result.error_msg) {
        return { error: result.error_msg };
      }

      return {
        result: result.answer_citationless || result.answer,
      };
    },
    inputSchema: z.object({
      code: z
        .string()
        .min(1)
        .max(50_000)
        .describe("Python source code to execute in the isolated sandbox."),
    }),
  });
}
