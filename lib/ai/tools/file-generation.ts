import { tool } from "ai";
import { z } from "zod";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { generateOnyxFile } from "@/lib/integrations/onyx/file-generation";

export function generateFile({ userId }: { userId: string }) {
  return tool({
    description:
      "Create a real downloadable Word, Excel, PowerPoint, or PDF file when the user explicitly asks for a document, spreadsheet, presentation, or PDF artifact.",
    execute: async ({ filename, format, instructions }) => {
      const credential = await getOrCreateOnyxCredential(userId);
      const result = await generateOnyxFile({
        bearerToken: credential.bearerToken,
        filename,
        format,
        instructions,
      });

      return {
        result: result.answer_citationless || result.answer,
      };
    },
    inputSchema: z.object({
      filename: z
        .string()
        .trim()
        .min(1)
        .max(120)
        .regex(/^[^\\/:*?"<>|]+$/, "Filename contains invalid characters"),
      format: z.enum(["docx", "xlsx", "pptx", "pdf"]),
      instructions: z
        .string()
        .trim()
        .min(1)
        .max(20_000)
        .describe(
          "Complete content, structure, styling, calculations, tables, charts, or layout requirements for the requested file."
        ),
    }),
  });
}
