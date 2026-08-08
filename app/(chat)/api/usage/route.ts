import { auth } from "@/app/(auth)/auth";
import { ChatbotError } from "@/lib/errors";
import { getQuotaSnapshot } from "@/lib/usage/quotas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const snapshot = await getQuotaSnapshot(session.user.id);
  return Response.json(snapshot);
}
