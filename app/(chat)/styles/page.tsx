import { auth } from "@/app/(auth)/auth";
import { StylesWorkspace } from "@/components/product/styles-workspace";

export default async function StylesPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return <StylesWorkspace />;
}
