import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { WorkspaceRole } from "@/generated/prisma/enums";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

const ROLE_RANK: Record<WorkspaceRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

/**
 * Server-side authorization check: never trust a workspaceId/pageId supplied
 * by the client without re-verifying membership against the session user on
 * every access, so a guessed ID can never leak another workspace's data.
 */
export const getMembership = cache(
  async (workspaceId: string, userId: string) => {
    return db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  },
);

export async function requireWorkspaceMember(
  workspaceId: string,
  minRole: WorkspaceRole = "VIEWER",
) {
  const user = await requireUser();
  const membership = await getMembership(workspaceId, user.id);
  if (!membership || ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    redirect("/");
  }
  return { user, membership };
}

/** Same check for use inside Server Actions, where redirecting is not desired. */
export async function assertWorkspaceMember(
  workspaceId: string,
  userId: string,
  minRole: WorkspaceRole = "VIEWER",
) {
  const membership = await getMembership(workspaceId, userId);
  if (!membership || ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    throw new Error("Forbidden");
  }
  return membership;
}
