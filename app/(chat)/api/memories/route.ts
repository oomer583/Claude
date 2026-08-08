import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import {
  forgetUserFact,
  getUserMemoryContext,
  rememberUserFact,
} from "@/lib/orchestration/memory";

const memorySchema = z.object({
  memory: z.string().trim().min(1).max(1000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const result = await getUserMemoryContext(session.user.id);
  return Response.json({
    enabled: result.enabled,
    memories: result.memories,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = memorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid memory payload" }, { status: 400 });
  }

  const result = await rememberUserFact({
    memory: parsed.data.memory,
    userId: session.user.id,
  });

  return Response.json({
    error: result.error_msg,
    saved: !result.error_msg,
  });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = memorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid memory payload" }, { status: 400 });
  }

  const deleted = await forgetUserFact({
    memory: parsed.data.memory,
    userId: session.user.id,
  });

  if (!deleted) {
    return Response.json({ error: "Memory not found" }, { status: 404 });
  }

  return Response.json({ deleted: true });
}
