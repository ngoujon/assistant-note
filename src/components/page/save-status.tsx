import { Loader2 } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved";

export function SaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
      {state === "saving" ? (
        <>
          <Loader2 className="size-3 animate-spin" />
          Enregistrement...
        </>
      ) : (
        "Enregistré"
      )}
    </div>
  );
}
