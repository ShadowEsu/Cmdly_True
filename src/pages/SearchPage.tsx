import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CommandRow } from "../components/CommandRow";
import { useCommands } from "../context/CommandsContext";
import { useHistory } from "../context/HistoryContext";
import { PLATFORMS } from "../data/platforms";
import type { Command, PlatformId } from "../types";

const PLATFORM_FILTERS: Array<PlatformId | "all"> = ["all", ...PLATFORMS.map((p) => p.id)];

const SYNONYMS: Record<string, string[]> = {
  permissions: ["sandbox", "security", "access"],
  sandbox: ["permissions", "security", "isolated"],
  review: ["diff", "audit", "check"],
  diff: ["review", "changes", "patch"],
  plan: ["ultraplan", "strategy", "workflow"],
  mcp: ["plugin", "tool", "connector"],
  debug: ["fix", "doctor", "troubleshoot"],
};

function score(cmd: Command, q: string): number {
  const needle = q.trim().toLowerCase();
  if (!needle) return 1;

  const hay = `${cmd.name} ${cmd.short} ${cmd.detail} ${cmd.category}`.toLowerCase();
  let sc = 0;

  if (cmd.name.toLowerCase().includes(needle)) sc += 6;
  if (cmd.short.toLowerCase().includes(needle)) sc += 3;
  if (cmd.detail.toLowerCase().includes(needle)) sc += 1;
  if (cmd.category.toLowerCase().includes(needle)) sc += 2;

  // Synonym matching
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if (needle.includes(key)) {
      for (const syn of syns) {
        if (hay.includes(syn)) sc += 2;
      }
    }
    // Also reverse match: if needle is a synonym, match the key
    for (const syn of syns) {
      if (needle.includes(syn) && hay.includes(key)) {
        sc += 2;
      }
    }
  }

  if (sc === 0 && hay.includes(needle)) sc = 1;
  return sc;
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [platform, setPlatform] = useState<PlatformId | "all">("all");

  const { commands } = useCommands();
  const { queries: recentQueries, pushQuery, removeQuery, clearQueries } = useHistory();

  const results = useMemo(() => {
    const needle = q.trim();
    const ranked = commands
      .map((c) => ({ c, sc: score(c, needle) }))
      .filter(({ c, sc }) => (platform === "all" ? true : c.platform === platform) && (needle ? sc > 0 : true))
      .sort((a, b) => b.sc - a.sc || (b.c.weight ?? 1) - (a.c.weight ?? 1));
    return ranked.map((r) => r.c);
  }, [q, platform, commands]);

  useEffect(() => {
    const needle = q.trim();
    if (needle.length < 2) return;
    const t = window.setTimeout(() => pushQuery(needle), 700);
    return () => window.clearTimeout(t);
  }, [q, pushQuery]);

  const showRecents = q.trim().length === 0 && recentQueries.length > 0;

  return (
    <div className="min-h-0 flex-1 px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-lg space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-vault-fg">Search</h1>
          <p className="text-sm text-vault-muted">All decks at once — filters narrow the list as you type.</p>
        </header>

        <div className="rounded-2xl border border-vault-border bg-vault-surface p-2 backdrop-blur-xl">
          <input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              setParams(v.trim() ? { q: v } : {});
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const needle = q.trim();
                if (needle) pushQuery(needle);
              }
            }}
            placeholder="Filter instantly…"
            className="w-full rounded-xl bg-transparent px-3 py-3 text-sm text-vault-fg outline-none placeholder:text-vault-subtle"
            aria-label="Search query"
          />
        </div>

        {showRecents ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-vault-muted">Recent searches</h2>
              <button
                type="button"
                onClick={clearQueries}
                className="text-[11px] font-semibold text-vault-subtle hover:text-vault-fg"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentQueries.map((rq) => (
                <span
                  key={rq}
                  className="group flex items-center gap-1 rounded-full bg-vault-pill-bg ring-1 ring-vault-border"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQ(rq);
                      setParams({ q: rq });
                    }}
                    className="rounded-full py-1.5 pl-3 pr-1 text-xs font-semibold text-vault-fg hover:bg-vault-muted/15"
                  >
                    {rq}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuery(rq)}
                    aria-label={`Remove ${rq} from history`}
                    className="rounded-full p-1 pr-2 text-vault-subtle hover:text-vault-fg"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {PLATFORM_FILTERS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-vault-border transition ${
                platform === p
                  ? "text-vault-fg shadow-sm"
                  : "bg-vault-pill-bg text-vault-muted hover:bg-vault-scrim"
              }`}
              style={
                platform === p
                  ? {
                      backgroundColor: "rgb(var(--accent) / 0.22)",
                      boxShadow: "0 0 0 1px rgb(var(--accent) / 0.35) inset",
                    }
                  : undefined
              }
            >
              {p === "all" ? "All" : PLATFORMS.find((x) => x.id === p)?.label ?? p}
            </button>
          ))}
        </div>

        <div className="text-xs text-vault-muted">{results.length} results</div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {results.map((cmd, i) => (
              <motion.div
                key={cmd.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: Math.min(i * 0.02, 0.18) }}
              >
                <CommandRow cmd={cmd} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 text-sm text-vault-muted">
              No matches. Try a shorter query or set the platform filter to All.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
