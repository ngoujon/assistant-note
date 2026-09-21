import { getPageTree } from "@/lib/pages";
import { PageTree } from "@/components/sidebar/page-tree";
import { SignOutMenuItem } from "@/components/sidebar/sign-out-item";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function AppSidebar({
  workspaceId,
  workspaceName,
  user,
}: {
  workspaceId: string;
  workspaceName: string;
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const nodes = await getPageTree(workspaceId);
  const label = user.name ?? user.email ?? "Utilisateur";
  const initials = label.slice(0, 2).toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-6 items-center justify-center rounded bg-primary text-xs font-semibold text-primary-foreground">
            {workspaceName.slice(0, 1).toUpperCase()}
          </div>
          <span className="truncate text-sm font-medium">{workspaceName}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <PageTree workspaceId={workspaceId} nodes={nodes} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent" />
            }
          >
            <Avatar className="size-6">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{label}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
