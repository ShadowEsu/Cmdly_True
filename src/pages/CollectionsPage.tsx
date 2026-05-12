import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CommandRow } from "../components/CommandRow";
import { useCommands } from "../context/CommandsContext";
import { useCollections } from "../context/CollectionsContext";
import { PLATFORMS, platformById } from "../data/platforms";
import type { Command, PlatformId } from "../types";

export function CollectionsPage() {
  const { savedIds } = useCollections();
  const { commands } = useCommands();

  const groups = useMemo(() => {
    const saved = commands.filter((c) => savedIds.has(c.id));
    const byPlatform = new Map<PlatformId, Command[]>();
    for (const c of saved) {
      const list = byPlatform.get(c.platform) ?? [];
      list.push(c);
      byPlatform.set(c.platform, list);
    }
    const orderedIds = PLATFORMS.map((p) => p.id);
    return orderedIds
      .filter((pid) => byPlatform.has(pid))
      .map((pid) => ({
        platform: pid,
        meta: platformById(pid),
        items: (byPlatform.get(pid) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [savedIds, commands]);

  const totalSaved = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="min-h-0 flex-1 px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-lg space-y-5">
        <header className="space-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-xl font-bold text-vault-fg">Saved</h1>
            {totalSaved > 0 ? (
              <span className="text-xs font-semibold text-vault-muted">
                {totalSaved} item{totalSaved === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-vault-muted">Stored only on this device — use Save on any command card.</p>
        </header>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-6">
            <p className="text-sm text-vault-muted">Nothing saved yet.</p>
            <Link
              className="mt-3 inline-block text-sm font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-300"
              to="/"
            >
              Browse decks
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g.platform}>
                <header className="mb-2 flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: g.meta.accent }}
                      aria-hidden
                    />
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-vault-fg">
                      {g.meta.label}
                    </h2>
                  </div>
                  <span className="text-[11px] text-vault-muted">{g.items.length}</span>
                </header>
                <div className="space-y-3">
                  {g.items.map((cmd, i) => (
                    <CommandRow key={cmd.id} cmd={cmd} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
