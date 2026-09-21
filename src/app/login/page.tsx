import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Bienvenue</h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous pour accéder à votre espace de travail.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
