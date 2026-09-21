import "server-only";
import { db } from "@/lib/db";
import { positionAtEnd } from "@/lib/fractional";

const WELCOME_DOC = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Bienvenue dans votre espace de travail !" }],
    },
  ],
};

/** Every user gets a personal workspace on first sign-in. */
export async function getOrCreateDefaultWorkspace(userId: string, userName: string | null) {
  const existing = await db.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { workspaceId: true },
  });
  if (existing) return existing.workspaceId;

  const workspace = await db.workspace.create({
    data: {
      name: userName ? `Espace de ${userName}` : "Mon espace",
      members: { create: { userId, role: "OWNER" } },
      pages: {
        create: {
          title: "Bienvenue",
          icon: "👋",
          content: WELCOME_DOC,
          plainText: "Bienvenue dans votre espace de travail !",
          position: positionAtEnd([]),
          createdById: userId,
        },
      },
    },
    select: { id: true },
  });
  return workspace.id;
}
