import "server-only";

import { onyxRequest } from "./client";
import type { OnyxChatResponse } from "./types";

export async function getOnyxProjectContext({
  bearerToken,
  message,
  onyxChatSessionId,
  onyxProjectId,
}: {
  bearerToken: string;
  message: string;
  onyxChatSessionId?: string | null;
  onyxProjectId: number;
}) {
  const retrievalPrompt = [
    "Use the project knowledge to retrieve and summarize only information relevant to the user's query.",
    "Do not invent facts. Keep the result compact but include concrete details that the final assistant should use.",
    `User query: ${message}`,
  ].join("\n\n");

  const body = onyxChatSessionId
    ? {
        chat_session_id: onyxChatSessionId,
        include_citations: true,
        message: retrievalPrompt,
        stream: false,
      }
    : {
        chat_session_info: {
          description: "Product project context",
          persona_id: 0,
          project_id: onyxProjectId,
        },
        include_citations: true,
        message: retrievalPrompt,
        stream: false,
      };

  return onyxRequest<OnyxChatResponse>({
    bearerToken,
    init: {
      body: JSON.stringify(body),
      method: "POST",
    },
    path: "/chat/send-chat-message",
    timeoutMs: 90_000,
  });
}
