import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { redeemOwnerPromo } from "@/lib/db/promocodes";
import { ChatbotError } from "@/lib/errors";

const requestSchema = z.object({
  code: z.string().trim().min(4).max(128),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const result = await redeemOwnerPromo({
    code: parsed.data.code,
    userId: session.user.id,
  });

  if (!result.ok) {
    return Response.json({ error: "Invalid promo code" }, { status: 400 });
  }

  return Response.json({ plan: result.plan, redeemed: true });
}
