import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { setChatOnyxSession } from "@/lib/db/chat-project";
import { getChatById } from "@/lib/db/queries";
import {
  getOrCreateOnyxCredential,
  getProjectByIdForUser,
} from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { getOnyxProjectContext } from "@/lib/integrations/onyx/chat";

const requestSchema = z.object({
  chatId: z.uuid().optional(),
  message: z.string().trim().min(1).max(20_000),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const project = await getProjectByIdForUser({
    id,
    userId: session.user.id,
  });

  if (!project) {
    return new ChatbotError("forbidden:chat").toResponse();
  }

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }

  let onyxChatSessionId: string | null = null;
  if (body.chatId) {
    const chat = await getChatById({ id: body.chatId });
    if (!chat || chat.userId !== session.user.id) {
      return new ChatbotError("forbidden:chat").toResponse();
    }
    if (chat.projectId && chat.projectId !== project.id) {
      return new ChatbotError("forbidden:chat").toResponse();
    }
    onyxChatSessionId = chat.onyxChatSessionId;
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await getOnyxProjectContext({
    bearerToken: credential.bearerToken,
    message: body.message,
    onyxChatSessionId,
    onyxProjectId: project.onyxProjectId,
  });

  if (body.chatId && result.chat_session_id && !onyxChatSessionId) {
    await setChatOnyxSession({
      chatId: body.chatId,
      onyxChatSessionId: result.chat_session_id,
      userId: session.user.id,
    });
  }

  return Response.json({
    citations: result.citation_info,
    context: result.answer_citationless || result.answer,
    onyxChatSessionId: result.chat_session_id,
    projectId: project.id,
    sources: result.top_documents,
  });
}
