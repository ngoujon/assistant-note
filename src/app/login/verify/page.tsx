export default function VerifyRequestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-2 rounded-lg border bg-background p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Vérifiez vos e-mails</h1>
        <p className="text-sm text-muted-foreground">
          Un lien de connexion vous a été envoyé. En développement, sans SMTP
          configuré, il est aussi affiché dans la console du serveur.
        </p>
      </div>
    </main>
  );
}
