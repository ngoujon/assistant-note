"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { createPage } from "@/actions/pages";
import { Button } from "@/components/ui/button";

export function EmptyWorkspaceState({ workspaceId }: { workspaceId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    startTransition(async () => {
      const page = await createPage({ workspaceId, parentId: null });
      router.push(`/w/${workspaceId}/p/${page.id}`);
    });
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <FileText className="size-10 text-muted-foreground" />
      <p className="text-muted-foreground">Aucune page sélectionnée.</p>
      <Button onClick={handleCreate} disabled={isPending}>
        Créer une page
      </Button>
    </div>
  );
}
