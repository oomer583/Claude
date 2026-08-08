import "server-only";

import { onyxRequest } from "./client";
import {
  createOnyxProject,
  deleteOnyxProject,
  uploadOnyxProjectFiles,
} from "./projects";
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
    throw new Error("Onyx Code Interpreter is unavailable");
  }
  cachedPythonToolId = pythonTool.id;
  return pythonTool.id;
}

export async function editOnyxOfficeFile({
  bearerToken,
  file,
  instructions,
}: {
  bearerToken: string;
  file: File;
  instructions: string;
}) {
  const pythonToolId = await getPythonToolId(bearerToken);
  const temporaryProject = await createOnyxProject({
    bearerToken,
    name: `Temporary file edit ${Date.now()}`,
  });

  try {
    await uploadOnyxProjectFiles({
      bearerToken,
      files: [file],
      projectId: temporaryProject.id,
    });

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "file";
    const outputName = file.name.replace(
      /^(.*?)(\.[^.]+)?$/,
      (_match, base: string, suffix: string | undefined) =>
        `${base || "edited"}-edited${suffix ?? `.${extension}`}`
    );

    return await onyxRequest<OnyxChatResponse>({
      bearerToken,
      init: {
        body: JSON.stringify({
          allowed_tool_ids: [pythonToolId],
          chat_session_info: {
            description: "Product Office/PDF editing",
            persona_id: 0,
            project_id: temporaryProject.id,
          },
          forced_tool_id: pythonToolId,
          include_citations: false,
          message: [
            `Edit the uploaded file ${file.name} and save the result as ${outputName}.`,
            "Use the real uploaded file as input. Preserve the original file type and as much existing formatting/layout as practical.",
            "Use mature Python libraries available in the sandbox: python-docx for DOCX, openpyxl for XLSX, python-pptx for PPTX, and pypdf/reportlab or another reliable PDF library for PDF.",
            "Do not return a text-only imitation. Create a valid non-empty edited file and return the downloadable file link exposed by Code Interpreter.",
            "Requested edits:",
            instructions,
          ].join("\n\n"),
          stream: false,
        }),
        method: "POST",
      },
      path: "/chat/send-chat-message",
      timeoutMs: 180_000,
    });
  } finally {
    await deleteOnyxProject({
      bearerToken,
      projectId: temporaryProject.id,
    }).catch(() => undefined);
  }
}
