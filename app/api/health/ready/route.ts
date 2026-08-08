import { getReadinessSnapshot } from "@/lib/health/readiness";

export async function GET() {
  const snapshot = await getReadinessSnapshot();
  return Response.json(snapshot, { status: snapshot.ok ? 200 : 503 });
}
