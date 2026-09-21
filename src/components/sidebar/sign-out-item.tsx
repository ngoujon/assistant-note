"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutMenuItem() {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
    >
      <LogOut className="size-4" />
      Se déconnecter
    </DropdownMenuItem>
  );
}
