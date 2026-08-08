import { tool } from "ai";
import { z } from "zod";
import { rememberUserFact } from "@/lib/orchestration/memory";

export function memoryTool({ userId }: { userId: string }) {
  return tool({
    description:
      "Save a durable user preference, stable personal fact, or long-term working preference for future conversations. Use only when the user explicitly asks to remember something or when a clearly durable preference is important for future help. Never store passwords, API keys, secrets, payment details, or temporary one-off requests.",
    execute: async ({ memory }) => {
      const result = await rememberUserFact({ memory, userId });
      return {
        saved: !result.error_msg,
        status: result.error_msg ?? "Memory processed by Onyx",
      };
    },
    inputSchema: z.object({
      memory: z
        .string()
        .trim()
        .min(1)
        .max(1000)
        .describe(
          "A concise standalone statement describing what to remember."
        ),
    }),
  });
}
