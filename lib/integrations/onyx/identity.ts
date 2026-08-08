import "server-only";

import { onyxRequest } from "./client";
import type { OnyxApiKeyDescriptor, OnyxCredential } from "./types";

/**
 * Provision a BASIC Onyx service account for one product user.
 *
 * IMPORTANT: the returned API key is only returned by Onyx on creation.
 * The caller must persist it encrypted and must never send it to the browser.
 */
export async function provisionOnyxCredential(
  productUserId: string
): Promise<OnyxCredential & { apiKeyId: number; display: string }> {
  const adminKey = process.env.ONYX_ADMIN_API_KEY?.trim();
  if (!adminKey) {
    throw new Error("ONYX_ADMIN_API_KEY is required to provision Onyx identities");
  }

  const descriptor = await onyxRequest<OnyxApiKeyDescriptor>({
    path: "/admin/api-key",
    bearerToken: adminKey,
    init: {
      method: "POST",
      body: JSON.stringify({
        name: `product-user-${productUserId}`,
        role: "basic",
      }),
    },
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
