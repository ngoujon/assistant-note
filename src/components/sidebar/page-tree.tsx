"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { createPage, deletePage } from "@/actions/pages";
import type { PageTreeNode } from "@/lib/pages";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type OptimisticAction =
  | { type: "add"; node: PageTreeNode }
  | { type: "remove"; ids: string[] };

function reducer(state: PageTreeNode[], action: OptimisticAction) {
  if (action.type === "add") return [...state, action.node];
  if (action.type === "remove") {
    const removed = new Set(action.ids);
    return state.filter((n) => !removed.has(n.id));
  }
  return state;
}

function collectDescendantIds(nodes: PageTreeNode[], rootId: string) {
  const byParent = new Map<string | null, PageTreeNode[]>();
  for (const n of nodes) {
    const list = byParent.get(n.parentId) ?? [];
    list.push(n);
    byParent.set(n.parentId, list);
  }
  const ids: string[] = [rootId];
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop()!;
    for (const child of byParent.get(current) ?? []) {
      ids.push(child.id);
      stack.push(child.id);
    }
  }
  return ids;
}

export function PageTree({
  workspaceId,
  nodes,
}: {
  workspaceId: string;
  nodes: PageTreeNode[];
}) {
  const [optimisticNodes, applyOptimistic] = useOptimistic(nodes, reducer);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const params = useParams<{ pageId?: string }>();
  const activePageId = params?.pageId;

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, PageTreeNode[]>();
    for (const n of optimisticNodes) {
      const list = map.get(n.parentId) ?? [];
      list.push(n);
      map.set(n.parentId, list);
    }
    return map;
  }, [optimisticNodes]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCreate(parentId: string | null) {
    startTransition(async () => {
      const tempId = `temp-${Math.random().toString(36).slice(2)}`;
      applyOptimistic({
        type: "add",
        node: { id: tempId, title: "Sans titre", icon: null, parentId, position: "~" },
      });
      if (parentId) setExpanded((prev) => new Set(prev).add(parentId));
      const created = await createPage({ workspaceId, parentId });
      router.push(`/w/${workspaceId}/p/${created.id}`);
      router.refresh();
    });
  }

  function handleDelete(node: PageTreeNode) {
    startTransition(async () => {
      const ids = collectDescendantIds(optimisticNodes, node.id);
      applyOptimistic({ type: "remove", ids });
      await deletePage({ pageId: node.id });
      if (activePageId && ids.includes(activePageId)) {
        router.push(`/w/${workspaceId}`);
      }
      router.refresh();
    });
  }

  function renderNodes(parentId: string | null, depth: number) {
    const children = (childrenByParent.get(parentId) ?? []).slice().sort((a, b) =>
      a.position < b.position ? -1 : 1,
    );

    return children.map((node) => {
      const hasChildren = (childrenByParent.get(node.id) ?? []).length > 0;
      const isExpanded = expanded.has(node.id);
      const isActive = node.id === activePageId;

      return (
        <SidebarMenuItem key={node.id}>
          <div className="group/item flex items-center">
            <button
              type="button"
              onClick={() => toggle(node.id)}
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent",
                !hasChildren && "invisible",
              )}
              style={{ marginLeft: depth * 12 }}
              aria-label={isExpanded ? "Réduire" : "Développer"}
            >
              <ChevronRight
                className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
              />
            </button>
            <SidebarMenuButton
              render={<Link href={`/w/${workspaceId}/p/${node.id}`} />}
              isActive={isActive}
              className="flex-1"
            >
              <span aria-hidden>{node.icon ?? <FileText className="size-4" />}</span>
              <span className="truncate">{node.title || "Sans titre"}</span>
            </SidebarMenuButton>
            <SidebarMenuAction
              className="peer-hover/menu-button:opacity-100 opacity-0 group-hover/item:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                handleCreate(node.id);
              }}
              aria-label="Ajouter une sous-page"
            >
              <Plus />
            </SidebarMenuAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    className="right-6 opacity-0 group-hover/item:opacity-100"
                    aria-label="Plus d'options"
                  />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(node)}
                  disabled={isPending}
                >
                  <Trash2 />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasChildren && isExpanded && (
            <SidebarMenu>{renderNodes(node.id, depth + 1)}</SidebarMenu>
          )}
        </SidebarMenuItem>
      );
    });
  }

  return (
    <div>
      <SidebarMenu>{renderNodes(null, 0)}</SidebarMenu>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 w-full justify-start text-muted-foreground"
        onClick={() => handleCreate(null)}
      >
        <Plus className="size-4" />
        Nouvelle page
      </Button>
    </div>
  );
}
