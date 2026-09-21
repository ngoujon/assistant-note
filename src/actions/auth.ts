"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";

export async function signInWithGoogle() {
  await signIn("google");
}

const emailSchema = z.email({ error: "Adresse e-mail invalide." });

export async function signInWithEmail(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Adresse e-mail invalide." };
  }

  try {
    await signIn("nodemailer", { email: parsed.data, redirectTo: "/login/verify" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Impossible d'envoyer le lien de connexion." };
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
