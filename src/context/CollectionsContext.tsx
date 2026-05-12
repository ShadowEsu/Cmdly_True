import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Command } from "../types";

type Ctx = {
  savedIds: Set<string>;
  toggleSave: (cmd: Command) => void;
  isSaved: (id: string) => boolean;
  replaceSaves: (ids: Iterable<string>) => void;
  mergeSaves: (ids: Iterable<string>) => void;
  clearSaves: () => void;
};

const CollectionsContext = createContext<Ctx | null>(null);

const KEY = "ai-command-vault:saved";

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...savedIds]));
    } catch {
      /* ignore */
    }
  }, [savedIds]);

  const toggleSave = useCallback((cmd: Command) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cmd.id)) next.delete(cmd.id);
      else next.add(cmd.id);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  const replaceSaves = useCallback((ids: Iterable<string>) => {
    const next = new Set<string>();
    for (const id of ids) if (typeof id === "string" && id.length > 0 && id.length <= 200) next.add(id);
    setSavedIds(next);
  }, []);

  const mergeSaves = useCallback((ids: Iterable<string>) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) if (typeof id === "string" && id.length > 0 && id.length <= 200) next.add(id);
      return next;
    });
  }, []);

  const clearSaves = useCallback(() => setSavedIds(new Set()), []);

  const value = useMemo(
    () => ({ savedIds, toggleSave, isSaved, replaceSaves, mergeSaves, clearSaves }),
    [savedIds, toggleSave, isSaved, replaceSaves, mergeSaves, clearSaves],
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const v = useContext(CollectionsContext);
  if (!v) throw new Error("useCollections must be used within CollectionsProvider");
  return v;
}
