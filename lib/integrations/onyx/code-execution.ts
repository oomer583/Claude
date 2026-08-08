import "server-only";

import { onyxRequest } from "./client";
import type { OnyxChatResponse } from "./types";

type OnyxToolSnapshot = {
  id: number;
  in_code_tool_id: string | null;
  name: string;
};

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
      "Onyx Code Interpreter is unavailable. Configure and enable the PythonTool in Onyx."
    );
  }

  cachedPythonToolId = pythonTool.id;
  return pythonTool.id;
}

export async function executeOnyxPython({
  bearerToken,
  code,
}: {
  bearerToken: string;
  code: string;
}) {
  const pythonToolId = await getPythonToolId(bearerToken);

  return onyxRequest<OnyxChatResponse>({
    bearerToken,
    init: {
      body: JSON.stringify({
        allowed_tool_ids: [pythonToolId],
        chat_session_info: {
          description: "Product isolated code execution",
          persona_id: 0,
        },
        forced_tool_id: pythonToolId,
        include_citations: false,
        message: [
          "Execute the following Python code with the Code Interpreter tool.",
          "Return the execution result faithfully. Do not replace execution with mental calculation.",
          "```python",
          code,
          "```",
        ].join("\n"),
        stream: false,
      }),
      method: "POST",
    },
    path: "/chat/send-chat-message",
    timeoutMs: 120_000,
  });
}
