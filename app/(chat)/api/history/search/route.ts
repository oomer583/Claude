import { auth } from "@/app/(auth)/auth";
import { searchUserChats } from "@/lib/db/chat-search";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return Response.json([]);
  }

  return Response.json(
    await searchUserChats({
      query: query.slice(0, 200),
      userId: session.user.id,
    })
  );
}
