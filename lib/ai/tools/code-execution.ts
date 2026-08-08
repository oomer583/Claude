import { tool } from "ai";
import { z } from "zod";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { executeOnyxPython } from "@/lib/integrations/onyx/code-execution";
import { consumeQuota } from "@/lib/usage/quotas";

export function codeExecution({ userId }: { userId: string }) {
  return tool({
    description:
      "Execute Python in an isolated Onyx Code Interpreter sandbox for calculations, data analysis, transformations, and programmatic tasks. Use execution instead of guessing results.",
    execute: async ({ code }) => {
      const quota = await consumeQuota({ resource: "code", userId });
      if (!quota.allowed) {
        return { error: "Code execution limit reached", quota };
      }

      const credential = await getOrCreateOnyxCredential(userId);
      const result = await executeOnyxPython({
        bearerToken: credential.bearerToken,
        code,
      });

      if (result.error_msg) {
        return { error: result.error_msg, quota };
      }

      return {
        quota,
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
