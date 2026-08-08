import "server-only";

import { onyxRequest } from "./client";
import type { OnyxApiKeyDescriptor, OnyxCredential } from "./types";

/**
 * Provision a BASIC Onyx service account for one product user.
 * The API key is returned by Onyx only once and must be persisted encrypted.
 */
export async function provisionOnyxCredential(
  productUserId: string
): Promise<OnyxCredential & { apiKeyId: number; display: string }> {
  const adminKey = process.env.ONYX_ADMIN_API_KEY?.trim();
  if (!adminKey) {
    throw new Error(
      "ONYX_ADMIN_API_KEY is required to provision Onyx identities"
    );
  }

  const descriptor = await onyxRequest<OnyxApiKeyDescriptor>({
    bearerToken: adminKey,
    init: {
      body: JSON.stringify({
        name: `product-user-${productUserId}`,
        role: "basic",
      }),
      method: "POST",
    },
    path: "/admin/api-key",
  });

  if (!descriptor.api_key) {
    throw new Error("Onyx did not return the newly-created API key");
  }

  return {
    apiKeyId: descriptor.api_key_id,
    bearerToken: descriptor.api_key,
    display: descriptor.api_key_display,
    onyxUserId: descriptor.user_id,
  };
}

export async function revokeOnyxCredential(apiKeyId: number) {
  const adminKey = process.env.ONYX_ADMIN_API_KEY?.trim();
  if (!adminKey) {
    throw new Error("ONYX_ADMIN_API_KEY is required to revoke Onyx identities");
  }

  await onyxRequest<void>({
    bearerToken: adminKey,
    init: { method: "DELETE" },
    path: `/admin/api-key/${apiKeyId}`,
  });
}
