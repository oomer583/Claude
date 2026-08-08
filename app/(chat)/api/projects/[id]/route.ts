import { auth } from "@/app/(auth)/auth";
import { deleteProjectForUser } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const deleted = await deleteProjectForUser({
    id,
    userId: session.user.id,
  });

  if (!deleted) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
