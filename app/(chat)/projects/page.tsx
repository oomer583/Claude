import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ProjectsWorkspace } from "@/components/product/projects-workspace";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <ProjectsWorkspace />;
}
