import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";

export default async function RootPage() {
  const user = await requireUser();
  const workspaceId = await getOrCreateDefaultWorkspace(user.id, user.name ?? null);
  redirect(`/w/${workspaceId}`);
}
