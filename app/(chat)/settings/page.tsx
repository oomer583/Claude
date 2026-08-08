import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { UsageAndPromo } from "@/components/settings/usage-and-promo";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <UsageAndPromo />;
}
