import "server-only";
import { db } from "@/lib/db";

export type PageTreeNode = {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  position: string;
};

/** Flat list of non-trashed pages for a workspace; nest client-side by parentId. */
export async function getPageTree(workspaceId: string): Promise<PageTreeNode[]> {
  return db.page.findMany({
    where: { workspaceId, trashedAt: null },
    select: { id: true, title: true, icon: true, parentId: true, position: true },
    orderBy: { position: "asc" },
  });
}

/**
 * Fetches a page, scoping the lookup to the given workspace so a caller can
 * never read another workspace's page by guessing an id.
 */
export async function getPageInWorkspace(workspaceId: string, pageId: string) {
  return db.page.findFirst({
    where: { id: pageId, workspaceId, trashedAt: null },
  });
}

export async function getWorkspaceForUser(workspaceId: string) {
  return db.workspace.findUnique({ where: { id: workspaceId } });
}
