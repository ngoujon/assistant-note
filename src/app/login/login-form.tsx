"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInWithEmail, signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      Continuer avec Google
    </Button>
  );
}

function EmailSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Envoi du lien..." : "Recevoir un lien de connexion"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signInWithEmail, undefined);

  return (
    <div className="space-y-4">
      <form action={signInWithGoogle}>
        <GoogleButton />
      </form>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="vous@exemple.com"
          required
          autoComplete="email"
        />
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <EmailSubmitButton />
      </form>
    </div>
  );
}
