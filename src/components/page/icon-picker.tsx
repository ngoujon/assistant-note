"use client";

import { useState } from "react";
import { SmilePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJIS = [
  "📄", "📝", "📌", "📎", "📚", "💡", "🎯", "🚀", "✅", "⭐",
  "🔥", "🧠", "📅", "🗂️", "🛠️", "🎨", "🌟", "📊", "🧩", "🏷️",
];

export function IconPicker({
  icon,
  onChange,
}: {
  icon: string | null;
  onChange: (icon: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-16 w-16 rounded-lg p-0 text-5xl hover:bg-muted"
            aria-label="Choisir une icône"
          />
        }
      >
        {icon ?? <SmilePlus className="size-8 text-muted-foreground" />}
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="grid grid-cols-5 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded p-1.5 text-xl hover:bg-muted"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
        {icon && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            <X className="size-4" />
            Retirer l&apos;icône
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
