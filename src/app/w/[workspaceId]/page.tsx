import { EmptyWorkspaceState } from "./empty-state";

export default async function WorkspaceHomePage({
  params,
}: PageProps<"/w/[workspaceId]">) {
  const { workspaceId } = await params;
  return <EmptyWorkspaceState workspaceId={workspaceId} />;
}
