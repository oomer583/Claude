import "server-only";

import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import {
  captureOnyxMemory,
  getOnyxPersonalization,
} from "@/lib/integrations/onyx/memory";

export async function getUserMemoryContext(userId: string) {
  const credential = await getOrCreateOnyxCredential(userId);
  const personalization = await getOnyxPersonalization(credential.bearerToken);

  if (!personalization.use_memories || personalization.memories.length === 0) {
    return {
      enabled: personalization.use_memories,
      memories: [],
      prompt: null,
    };
  }

  const memories = personalization.memories
    .map((memory) => memory.content.trim())
    .filter(Boolean);

  return {
    enabled: true,
    memories,
    prompt:
      memories.length > 0
        ? [
            "Persistent user memories from prior conversations:",
            ...memories.map((memory) => `- ${memory}`),
            "Use these only when relevant. Do not mention that a memory system exists unless the user asks.",
          ].join("\n")
        : null,
  };
}

export async function rememberUserFact({
  memory,
  userId,
}: {
  memory: string;
  userId: string;
}) {
  const credential = await getOrCreateOnyxCredential(userId);
  return captureOnyxMemory({
    bearerToken: credential.bearerToken,
    memory,
  });
}
