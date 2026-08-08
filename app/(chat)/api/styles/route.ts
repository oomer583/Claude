import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  activateUserStyle,
  createUserStyle,
  deleteUserStyle,
  listUserStyles,
} from "@/lib/db/styles";

const createSchema = z.object({
  instructions: z.string().trim().min(1).max(8000),
  name: z.string().trim().min(1).max(80),
});

const mutateSchema = z.object({
  id: z.string().uuid(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(await listUserStyles(session.user.id));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid style payload" }, { status: 400 });
  }
  const created = await createUserStyle({
    ...parsed.data,
    userId: session.user.id,
  });
  return Response.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = mutateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid style id" }, { status: 400 });
  }
  const activated = await activateUserStyle({
    id: parsed.data.id,
    userId: session.user.id,
  });
  if (!activated) {
    return Response.json({ error: "Style not found" }, { status: 404 });
  }
  return Response.json(activated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = mutateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid style id" }, { status: 400 });
  }
  const deleted = await deleteUserStyle({
    id: parsed.data.id,
    userId: session.user.id,
  });
  if (!deleted) {
    return Response.json({ error: "Style not found" }, { status: 404 });
  }
  return Response.json({ deleted: true });
}
