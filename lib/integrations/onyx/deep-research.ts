import "server-only";

import { onyxRequest } from "./client";
import type { OnyxChatResponse } from "./types";

export function runOnyxDeepResearch({
  bearerToken,
  query,
}: {
  bearerToken: string;
  query: string;
}) {
  return onyxRequest<OnyxChatResponse>({
    bearerToken,
    init: {
      body: JSON.stringify({
        chat_session_info: {
          description: "Product deep research",
          persona_id: 0,
        },
        deep_research: true,
        include_citations: true,
        message: query,
        stream: false,
      }),
      method: "POST",
    },
    path: "/chat/send-chat-message",
    timeoutMs: 240_000,
  });
}
