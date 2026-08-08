import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ConnectorsWorkspace } from "@/components/product/connectors-workspace";

export default async function ConnectorsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ConnectorsWorkspace />;
}
