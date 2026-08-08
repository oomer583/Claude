import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { listOnyxMcpServers } from "@/lib/integrations/onyx/mcp";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await listOnyxMcpServers({
    bearerToken: credential.bearerToken,
  });

  return Response.json(result.mcp_servers);
}
