"use server";

import { revalidatePath } from "next/cache";
import { requireUser, assertWorkspaceMember } from "@/lib/dal";
import { db } from "@/lib/db";
import { positionAtEnd } from "@/lib/fractional";
import {
  createPageSchema,
  renamePageSchema,
  setPageIconSchema,
  deletePageSchema,
  saveContentSchema,
} from "@/lib/validations/page";

async function assertPageAccess(pageId: string, userId: string) {
  const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
  await assertWorkspaceMember(page.workspaceId, userId, "EDITOR");
  return page;
}

export async function createPage(input: { workspaceId: string; parentId: string | null }) {
  const user = await requireUser();
  const { workspaceId, parentId } = createPageSchema.parse(input);
  await assertWorkspaceMember(workspaceId, user.id, "EDITOR");

  if (parentId) {
    // parentId must itself belong to this workspace — otherwise a member of
    // workspace A could nest a page under a page id borrowed from workspace B.
    await db.page.findFirstOrThrow({ where: { id: parentId, workspaceId } });
  }

  const siblings = await db.page.findMany({
    where: { workspaceId, parentId },
    select: { position: true },
  });

  const page = await db.page.create({
    data: {
      workspaceId,
      parentId,
      title: "Sans titre",
      position: positionAtEnd(siblings.map((s) => s.position)),
      createdById: user.id,
    },
    select: { id: true },
  });

  revalidatePath(`/w/${workspaceId}`);
  return page;
}

export async function renamePage(input: { pageId: string; title: string }) {
  const user = await requireUser();
  const { pageId, title } = renamePageSchema.parse(input);
  const page = await assertPageAccess(pageId, user.id);

  await db.page.update({
    where: { id: pageId },
    data: { title: title || "Sans titre" },
  });

  revalidatePath(`/w/${page.workspaceId}`);
}

export async function setPageIcon(input: { pageId: string; icon: string | null }) {
  const user = await requireUser();
  const { pageId, icon } = setPageIconSchema.parse(input);
  const page = await assertPageAccess(pageId, user.id);

  await db.page.update({ where: { id: pageId }, data: { icon } });
  revalidatePath(`/w/${page.workspaceId}`);
}

export async function saveContent(input: {
  pageId: string;
  content: unknown;
  plainText: string;
}) {
  const user = await requireUser();
  const { pageId, content, plainText } = saveContentSchema.parse(input);
  await assertPageAccess(pageId, user.id);

  await db.page.update({
    where: { id: pageId },
    data: { content: content as object, plainText },
  });
}

async function collectDescendantIds(pageId: string): Promise<string[]> {
  const children = await db.page.findMany({
    where: { parentId: pageId },
    select: { id: true },
  });
  const nested = await Promise.all(children.map((c) => collectDescendantIds(c.id)));
  return [pageId, ...nested.flat()];
}

export async function deletePage(input: { pageId: string }) {
  const user = await requireUser();
  const { pageId } = deletePageSchema.parse(input);
  const page = await assertPageAccess(pageId, user.id);

  const ids = await collectDescendantIds(pageId);
  await db.page.updateMany({
    where: { id: { in: ids } },
    data: { trashedAt: new Date() },
  });

  revalidatePath(`/w/${page.workspaceId}`);
  return { workspaceId: page.workspaceId };
}
