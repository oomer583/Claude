import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import { startOnyxMcpOAuth } from "@/lib/integrations/onyx/mcp";

const bodySchema = z.object({
  returnPath: z
    .string()
    .trim()
    .startsWith("/")
    .max(500)
    .default("/settings/connectors"),
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
  const serverId = Number.parseInt(id, 10);
  if (!Number.isInteger(serverId) || serverId < 1) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  const result = await startOnyxMcpOAuth({
    bearerToken: credential.bearerToken,
    returnPath: parsed.data.returnPath,
    serverId,
  });

  return Response.json(result);
}
