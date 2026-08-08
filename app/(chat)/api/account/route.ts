import { auth } from "@/app/(auth)/auth";
import {
  deleteAccountData,
  exportAccountData,
  getOnyxIdentityForDeletion,
} from "@/lib/db/account";
import { revokeOnyxCredential } from "@/lib/integrations/onyx/identity";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await exportAccountData(session.user.id);
  if (!data) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  const filename = `account-export-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-disposition": `attachment; filename="${filename}"`,
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identity = await getOnyxIdentityForDeletion(session.user.id);
  if (identity) {
    try {
      await revokeOnyxCredential(identity.apiKeyId);
    } catch {
      return Response.json(
        { error: "Could not revoke the external workspace identity" },
        { status: 502 }
      );
    }
  }

  const deleted = await deleteAccountData(session.user.id);
  if (!deleted) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  return Response.json({ deleted: true });
}
