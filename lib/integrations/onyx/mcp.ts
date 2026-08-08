import "server-only";

import { onyxRequest } from "./client";

export type OnyxMcpServer = {
  auth_performer?: "ADMIN" | "PER_USER";
  auth_template?: {
    headers: Record<string, string>;
    required_fields: string[];
  } | null;
  auth_type?: "NONE" | "API_TOKEN" | "OAUTH" | "PT_OAUTH";
  description?: string | null;
  id: number;
  is_authenticated: boolean;
  name: string;
  server_url: string;
  status: string;
  tool_count: number;
  user_authenticated?: boolean;
};

type OnyxMcpServersResponse = {
  assistant_id?: string | null;
  mcp_servers: OnyxMcpServer[];
};

export function listOnyxMcpServers({
  bearerToken,
  personaId = 0,
}: {
  bearerToken: string;
  personaId?: number;
}) {
  return onyxRequest<OnyxMcpServersResponse>({
    bearerToken,
    path: `/mcp/servers/persona/${personaId}`,
  });
}

export function saveOnyxMcpCredentials({
  bearerToken,
  credentials,
  serverId,
  transport = "STREAMABLE_HTTP",
}: {
  bearerToken: string;
  credentials: Record<string, string>;
  serverId: number;
  transport?: "STREAMABLE_HTTP" | "SSE";
}) {
  return onyxRequest<void>({
    bearerToken,
    init: {
      body: JSON.stringify({
        credentials,
        server_id: serverId,
        transport,
      }),
      method: "POST",
    },
    path: "/mcp/user-credentials",
  });
}

export function disconnectOnyxMcpServer({
  bearerToken,
  serverId,
}: {
  bearerToken: string;
  serverId: number;
}) {
  return onyxRequest<void>({
    bearerToken,
    init: { method: "DELETE" },
    path: `/mcp/user-credentials/${serverId}`,
  });
}

export function startOnyxMcpOAuth({
  bearerToken,
  returnPath,
  serverId,
}: {
  bearerToken: string;
  returnPath: string;
  serverId: number;
}) {
  return onyxRequest<{ oauth_url: string }>({
    bearerToken,
    init: {
      body: JSON.stringify({
        include_resource_param: true,
        return_path: returnPath,
        server_id: serverId,
      }),
      method: "POST",
    },
    path: "/mcp/oauth/connect",
  });
}
