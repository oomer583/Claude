import "server-only";

import { onyxRequest } from "./client";
import type { OnyxChatResponse } from "./types";

type OnyxToolSnapshot = {
  id: number;
  in_code_tool_id: string | null;
  name: string;
};

export type GeneratedFileFormat = "docx" | "xlsx" | "pptx" | "pdf";

let cachedPythonToolId: number | null = null;

async function getPythonToolId(bearerToken: string) {
  if (cachedPythonToolId !== null) {
    return cachedPythonToolId;
  }

  const tools = await onyxRequest<OnyxToolSnapshot[]>({
    bearerToken,
    path: "/tool",
  });

  const pythonTool = tools.find(
    (tool) =>
      tool.in_code_tool_id === "PythonTool" || tool.name === "PythonTool"
  );

  if (!pythonTool) {
    throw new Error(
      "Onyx Code Interpreter is unavailable. Configure and enable PythonTool before generating files."
    );
  }

  cachedPythonToolId = pythonTool.id;
  return pythonTool.id;
}

export async function generateOnyxFile({
  bearerToken,
  filename,
  format,
  instructions,
}: {
  bearerToken: string;
  filename: string;
  format: GeneratedFileFormat;
  instructions: string;
}) {
  const pythonToolId = await getPythonToolId(bearerToken);
  const normalizedFilename = filename.toLowerCase().endsWith(`.${format}`)
    ? filename
    : `${filename}.${format}`;

  return onyxRequest<OnyxChatResponse>({
    bearerToken,
    init: {
      body: JSON.stringify({
        allowed_tool_ids: [pythonToolId],
        chat_session_info: {
          description: `Product ${format.toUpperCase()} file generation`,
          persona_id: 0,
        },
        forced_tool_id: pythonToolId,
        include_citations: false,
        message: [
          `Create a real ${format.toUpperCase()} file named ${normalizedFilename} in the Code Interpreter workspace.`,
          "Use Python and mature document libraries available in the sandbox. Prefer python-docx for DOCX, openpyxl for XLSX, python-pptx for PPTX, and reportlab for PDF when available.",
          "If a preferred package is unavailable, use another reliable method in the sandbox rather than returning plain text only.",
          "The final artifact must be a valid downloadable file, not markdown pretending to be a file.",
          "After creating it, verify that the file exists and is non-empty. Return the generated file link exposed by Code Interpreter.",
          "Content and formatting requirements:",
          instructions,
        ].join("\n\n"),
        stream: false,
      }),
      method: "POST",
    },
    path: "/chat/send-chat-message",
    timeoutMs: 180_000,
  });
}
