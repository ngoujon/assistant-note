import { notFound } from "next/navigation";
import { requireWorkspaceMember } from "@/lib/dal";
import { getWorkspaceForUser } from "@/lib/pages";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps<"/w/[workspaceId]">) {
  const { workspaceId } = await params;
  const { user } = await requireWorkspaceMember(workspaceId);

  const workspace = await getWorkspaceForUser(workspaceId);
  if (!workspace) notFound();

  return (
    <SidebarProvider>
      <AppSidebar workspaceId={workspaceId} workspaceName={workspace.name} user={user} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
