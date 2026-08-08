import "server-only";

import { assignChatToProject, setChatOnyxSession } from "@/lib/db/chat-project";
import {
  getOrCreateOnyxCredential,
  getProjectByIdForUser,
} from "@/lib/db/projects";
import { getChatById } from "@/lib/db/queries";
import { getOnyxProjectContext } from "@/lib/integrations/onyx/chat";

export type ProjectContextResult = {
  citations: unknown[];
  context: string;
  instructions: string | null;
  onyxChatSessionId: string | null;
  projectId: string;
  sources: unknown[];
};

export async function retrieveProjectContext({
  chatId,
  message,
  projectId,
  userId,
}: {
  chatId: string;
  message: string;
  projectId: string;
  userId: string;
}): Promise<ProjectContextResult | null> {
  const project = await getProjectByIdForUser({ id: projectId, userId });
  if (!project) {
    return null;
  }

  const chat = await getChatById({ id: chatId });
  if (chat && chat.userId !== userId) {
    return null;
  }
  if (chat?.projectId && chat.projectId !== project.id) {
    return null;
  }

  if (chat && !chat.projectId) {
    await assignChatToProject({ chatId, projectId: project.id, userId });
  }

  const credential = await getOrCreateOnyxCredential(userId);
  const result = await getOnyxProjectContext({
    bearerToken: credential.bearerToken,
    message,
    onyxChatSessionId: chat?.onyxChatSessionId ?? null,
    onyxProjectId: project.onyxProjectId,
  });

  const onyxChatSessionId = result.chat_session_id ?? null;
  if (chat && onyxChatSessionId && !chat.onyxChatSessionId) {
    await setChatOnyxSession({ chatId, onyxChatSessionId, userId });
  }

  return {
    citations: result.citation_info ?? [],
    context: result.answer_citationless || result.answer || "",
    instructions: project.instructions,
    onyxChatSessionId,
    projectId: project.id,
    sources: result.top_documents ?? [],
  };
}

export function formatProjectContextForPrompt(result: ProjectContextResult) {
  const sections = [
    result.instructions
      ? `Project instructions:\n${result.instructions}`
      : null,
    result.context
      ? `Retrieved project knowledge:\n${result.context}`
      : "Retrieved project knowledge: no relevant content was found.",
  ].filter(Boolean);

  return sections.join("\n\n");
}
