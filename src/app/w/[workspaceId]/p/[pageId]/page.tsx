import { notFound } from "next/navigation";
import { requireWorkspaceMember } from "@/lib/dal";
import { getPageInWorkspace } from "@/lib/pages";
import { PageEditor } from "@/components/page/page-editor";

export default async function PageDetailPage({
  params,
}: PageProps<"/w/[workspaceId]/p/[pageId]">) {
  const { workspaceId, pageId } = await params;
  await requireWorkspaceMember(workspaceId);

  const page = await getPageInWorkspace(workspaceId, pageId);
  if (!page) notFound();

  return (
    <PageEditor
      key={page.id}
      pageId={page.id}
      initialTitle={page.title}
      initialIcon={page.icon}
      initialPlainText={page.plainText}
    />
  );
}
