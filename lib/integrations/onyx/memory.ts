import "server-only";

import { onyxRequest } from "./client";
import type { OnyxChatResponse } from "./types";

export type OnyxMemoryItem = {
  content: string;
  id: number | null;
};

export type OnyxPersonalization = {
  enable_memory_tool: boolean;
  memories: OnyxMemoryItem[];
  name: string;
  role: string;
  use_memories: boolean;
  user_preferences: string;
};

type OnyxMeResponse = {
  personalization: OnyxPersonalization;
};

export async function getOnyxPersonalization(bearerToken: string) {
  const response = await onyxRequest<OnyxMeResponse>({
    bearerToken,
    path: "/me",
  });

  return response.personalization;
}

export function updateOnyxPersonalization({
  bearerToken,
  personalization,
}: {
  bearerToken: string;
  personalization: Partial<OnyxPersonalization>;
}) {
  return onyxRequest<void>({
    bearerToken,
    init: {
      body: JSON.stringify(personalization),
      method: "PATCH",
    },
    path: "/user/personalization",
  });
}

/**
 * Ask Onyx's native MemoryTool to persist a durable fact. The tool performs
 * its own add-vs-update decision using existing memories and chat history.
 */
export function captureOnyxMemory({
  bearerToken,
  memory,
}: {
  bearerToken: string;
  memory: string;
}) {
  return onyxRequest<OnyxChatResponse>({
    bearerToken,
    init: {
      body: JSON.stringify({
        chat_session_info: {
          description: "Product memory capture",
          persona_id: 0,
        },
        include_citations: false,
        message: [
          "Store the following durable user information using the add_memory tool.",
          "Do not treat temporary requests, one-off tasks, secrets, or sensitive credentials as memories.",
          `Memory candidate: ${memory}`,
        ].join("\n\n"),
        stream: false,
      }),
      method: "POST",
    },
    path: "/chat/send-chat-message",
    timeoutMs: 90_000,
  });
}
