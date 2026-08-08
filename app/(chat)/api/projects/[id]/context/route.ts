import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { retrieveProjectContext } from "@/lib/orchestration/project-context";

const requestSchema = z.object({
  chatId: z.uuid(),
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

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const { id: projectId } = await params;
  const result = await retrieveProjectContext({
    chatId: body.chatId,
    message: body.message,
    projectId,
    userId: session.user.id,
  });

  if (!result) {
    return new ChatbotError("forbidden:chat").toResponse();
  }

  return Response.json(result);
}
