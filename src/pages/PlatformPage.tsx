import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CommandRow } from "../components/CommandRow";
import { useCommands } from "../context/CommandsContext";
import { PLATFORMS, platformById } from "../data/platforms";
import type { Command, PlatformId } from "../types";

const VALID_PLATFORM_IDS = new Set(PLATFORMS.map((p) => p.id));

export function PlatformPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const focusId = (location.state as { focusId?: string } | null)?.focusId;

  const platform = id && VALID_PLATFORM_IDS.has(id as PlatformId) ? (id as PlatformId) : null;
  const meta = platform ? platformById(platform) : null;
  const { commandsForPlatform } = useCommands();
  const cmds = useMemo(() => (platform ? commandsForPlatform(platform) : []), [platform, commandsForPlatform]);

  const [category, setCategory] = useState<string>("all");

  const categories = useMemo<string[]>(() => {
    const counts = new Map<string, number>();
    for (const c of cmds) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([cat]) => cat);
  }, [cmds]);

  const grouped = useMemo<Array<{ category: string; items: Command[] }>>(() => {
    const filtered = category === "all" ? cmds : cmds.filter((c) => c.category === category);
    const map = new Map<string, Command[]>();
    for (const c of filtered) {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([cat, items]) => ({ category: cat, items }));
  }, [cmds, category]);

  useEffect(() => {
    if (!focusId) return;
    setCategory("all");
    const el = document.getElementById(focusId);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusId, platform]);

  useEffect(() => {
    setCategory("all");
  }, [platform]);

  if (!platform || !meta) {
    return (
      <div className="p-6">
        <p className="text-vault-muted">Unknown platform.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-violet-600 dark:text-violet-300">
          Back home
        </Link>
      </div>
    );
  }

  const idx = PLATFORMS.findIndex((p) => p.id === platform);
  const prev = PLATFORMS[(idx - 1 + PLATFORMS.length) % PLATFORMS.length]!;
  const next = PLATFORMS[(idx + 1) % PLATFORMS.length]!;

  return (
    <div className={`min-h-0 flex-1 bg-gradient-to-b ${meta.gradient}`}>
      <div className="border-b border-white/10 bg-black/25 px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] text-zinc-100 backdrop-blur-md dark:border-white/[0.06] dark:bg-black/20">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="rounded-xl bg-white/10 p-2 ring-1 ring-white/15 hover:bg-white/15"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-zinc-100" aria-hidden>
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-300">{meta.label}</div>
            <div className="truncate text-lg font-semibold text-white">{meta.tagline}</div>
          </div>
          <div className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-zinc-100 ring-1 ring-white/15">
            {cmds.length} cmds
          </div>
        </div>

        <div className="mx-auto mt-4 flex max-w-lg items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => nav(`/platform/${prev.id}`)}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-100 ring-1 ring-white/15 hover:bg-white/15"
          >
            ← {prev.label}
          </button>
          <div className="flex items-center gap-1.5">
            {PLATFORMS.map((p) => (
              <span
                key={p.id}
                className={`h-1.5 w-1.5 rounded-full ${p.id === platform ? "bg-white" : "bg-white/25"}`}
                aria-hidden
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => nav(`/platform/${next.id}`)}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-100 ring-1 ring-white/15 hover:bg-white/15"
          >
            {next.label} →
          </button>
        </div>
      </div>

      {categories.length > 1 ? (
        <div className="sticky top-0 z-10 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                category === "all"
                  ? "bg-white/20 text-white ring-white/30"
                  : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  category === cat
                    ? "bg-white/20 text-white ring-white/30"
                    : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-lg space-y-6 px-4 py-5 pb-28">
        {grouped.map((group) => (
          <section key={group.category}>
            <header className="mb-2 flex items-baseline justify-between gap-3 px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                {group.category}
              </h2>
              <span className="text-[11px] text-zinc-400">{group.items.length}</span>
            </header>
            <div className="space-y-3">
              {group.items.map((c, i) => (
                <div
                  key={c.id}
                  id={c.id}
                  className={
                    focusId === c.id
                      ? "scroll-mt-28 rounded-2xl ring-2 ring-violet-500/55 dark:ring-white/25"
                      : ""
                  }
                >
                  <CommandRow cmd={c} index={i} />
                </div>
              ))}
            </div>
          </section>
        ))}
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-zinc-300">
            No commands in this category.
          </div>
        ) : null}
      </div>
    </div>
  );
}
