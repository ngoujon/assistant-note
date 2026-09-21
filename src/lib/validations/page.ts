import { z } from "zod";

export const createPageSchema = z.object({
  workspaceId: z.string().cuid(),
  parentId: z.string().cuid().nullable(),
});

export const renamePageSchema = z.object({
  pageId: z.string().cuid(),
  title: z.string().trim().max(500),
});

export const setPageIconSchema = z.object({
  pageId: z.string().cuid(),
  icon: z.string().max(16).nullable(),
});

export const deletePageSchema = z.object({
  pageId: z.string().cuid(),
});

const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const saveContentSchema = z.object({
  pageId: z.string().cuid(),
  content: tiptapDocSchema,
  plainText: z.string().max(1_000_000),
});
