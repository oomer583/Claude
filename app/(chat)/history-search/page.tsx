import { auth } from "@/app/(auth)/auth";
import { HistorySearchWorkspace } from "@/components/product/history-search-workspace";

export default async function HistorySearchPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return <HistorySearchWorkspace />;
}
