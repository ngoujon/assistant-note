"use client";

import { useEffect, useRef, useState } from "react";
import { renamePage, saveContent, setPageIcon } from "@/actions/pages";
import { IconPicker } from "@/components/page/icon-picker";
import { SaveStatus, type SaveState } from "@/components/page/save-status";

const AUTOSAVE_DELAY_MS = 500;

/** Wraps plain text into a minimal valid TipTap document, one paragraph per line. */
function toTipTapDoc(text: string) {
  const lines = text.length ? text.split("\n") : [""];
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

export function PageEditor({
  pageId,
  initialTitle,
  initialIcon,
  initialPlainText,
}: {
  pageId: string;
  initialTitle: string;
  initialIcon: string | null;
  initialPlainText: string;
}) {
  const [title, setTitle] = useState(initialTitle === "Sans titre" ? "" : initialTitle);
  const [icon, setIcon] = useState(initialIcon);
  const [content, setContent] = useState(initialPlainText);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleSave(run: () => Promise<void>) {
    setSaveState("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await run();
      setSaveState("saved");
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaveState("idle"), 2000);
    }, AUTOSAVE_DELAY_MS);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  function handleTitleChange(value: string) {
    setTitle(value);
    scheduleSave(() => renamePage({ pageId, title: value }));
  }

  function handleIconChange(value: string | null) {
    setIcon(value);
    setSaveState("saving");
    void setPageIcon({ pageId, icon: value }).then(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    });
  }

  function handleContentChange(value: string) {
    setContent(value);
    scheduleSave(() =>
      saveContent({ pageId, content: toTipTapDoc(value), plainText: value }),
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-12 py-10">
      <div className="mb-4 flex items-center justify-between">
        <IconPicker icon={icon} onChange={handleIconChange} />
        <SaveStatus state={saveState} />
      </div>
      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Sans titre"
        aria-label="Titre de la page"
        className="w-full border-none bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground/50"
      />
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Écrivez quelque chose... (l'éditeur par blocs arrive au prochain jalon)"
        aria-label="Contenu de la page"
        className="mt-6 min-h-[50vh] w-full resize-none border-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
