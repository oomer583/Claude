import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getOrCreateOnyxCredential } from "@/lib/db/projects";
import { ChatbotError } from "@/lib/errors";
import {
  disconnectOnyxMcpServer,
  saveOnyxMcpCredentials,
} from "@/lib/integrations/onyx/mcp";

const bodySchema = z.object({
  credentials: z
    .record(z.string(), z.string().min(1))
    .refine(
      (value) => Object.keys(value).length > 0,
      "At least one credential is required"
    ),
  transport: z.enum(["STREAMABLE_HTTP", "SSE"]).default("STREAMABLE_HTTP"),
});

function parseServerId(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const serverId = parseServerId(id);
  if (!serverId) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  await saveOnyxMcpCredentials({
    bearerToken: credential.bearerToken,
    credentials: parsed.data.credentials,
    serverId,
    transport: parsed.data.transport,
  });

  return new Response(null, { status: 204 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const { id } = await params;
  const serverId = parseServerId(id);
  if (!serverId) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const credential = await getOrCreateOnyxCredential(session.user.id);
  await disconnectOnyxMcpServer({
    bearerToken: credential.bearerToken,
    serverId,
  });

  return new Response(null, { status: 204 });
}
