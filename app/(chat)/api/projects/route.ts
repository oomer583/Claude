import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createProjectForUser, listProjectsByUserId } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";

const createProjectSchema = z.object({
  instructions: z.string().max(20_000).optional(),
  name: z.string().trim().min(1).max(120),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const projects = await listProjectsByUserId(session.user.id);
  return Response.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = createProjectSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid project payload" }, { status: 400 });
  }

  const created = await createProjectForUser({
    instructions: parsed.data.instructions,
    name: parsed.data.name,
    userId: session.user.id,
  });

  return Response.json(created, { status: 201 });
}
