import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ToolsWorkspace } from "@/components/product/tools-workspace";

export default async function ToolsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ToolsWorkspace />;
}
