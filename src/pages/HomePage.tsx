import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ParticleGrid } from "../components/ParticleGrid";
import { GlowSearch } from "../components/GlowSearch";
import { PlatformRail } from "../components/PlatformRail";
import { CommandDetailSheet } from "../components/CommandDetailSheet";
import { useCommands } from "../context/CommandsContext";
import { useHistory } from "../context/HistoryContext";
import { useCollections } from "../context/CollectionsContext";
import { PLATFORMS, platformById } from "../data/platforms";
import { pickWeightedUnique, shuffle } from "../lib/shuffle";
import type { Command } from "../types";

const GREETING = "Hello, Coder!" as const;

function MiniCommandCard({
  cmd,
  delay,
  onSelect,
}: {
  cmd: Command;
  delay: number;
  onSelect: (cmd: Command) => void;
}) {
  const p = platformById(cmd.platform);
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 420, damping: 28 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(cmd)}
      className="group relative w-[220px] shrink-0 overflow-hidden rounded-2xl border border-vault-border bg-vault-surface p-3 text-left backdrop-blur-xl"
      style={{ boxShadow: `0 0 0 1px ${p.accentSoft} inset, var(--card-elev-shadow)` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-60"
        style={{ background: p.accentSoft }}
      />
      <div className="relative space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-vault-pill-bg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-vault-muted ring-1 ring-vault-border">
            {p.label}
          </span>
          <span className="text-[11px] text-vault-subtle">Tap</span>
        </div>
        <div className="font-mono text-base font-semibold text-vault-fg">{cmd.name}</div>
        <p className="line-clamp-2 text-sm leading-relaxed text-vault-muted">{cmd.short}</p>
      </div>
    </motion.button>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-1">
      <div>
        <h2 className="text-base font-semibold tracking-wide text-vault-fg">{title}</h2>
        <p className="text-sm text-vault-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-vault-border bg-vault-surface px-3 py-2 backdrop-blur-md"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide text-vault-muted">{label}</div>
      <div className="text-lg font-semibold tabular-nums text-vault-fg">{value}</div>
    </motion.div>
  );
}

export function HomePage() {
  const [focusCmd, setFocusCmd] = useState<Command | null>(null);
  const { commands, newCommands, hasNew, markSeen } = useCommands();
  const { views } = useHistory();
  const { savedIds } = useCollections();

  const picks = useMemo<Command[]>(() => {
    const featured = pickWeightedUnique(commands, 8);
    const seen = new Set(featured.map((c) => c.id));
    const extras = pickWeightedUnique(shuffle(commands), 4).filter((c) => !seen.has(c.id));
    return [...featured, ...extras].slice(0, 10);
  }, [commands]);

  const recentlyViewed = useMemo<Command[]>(() => {
    if (views.length === 0) return [];
    const byId = new Map(commands.map((c) => [c.id, c]));
    const out: Command[] = [];
    for (const id of views) {
      const cmd = byId.get(id);
      if (cmd) out.push(cmd);
    }
    return out;
  }, [views, commands]);

  return (
    <div className="relative min-h-0 flex-1">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <ParticleGrid />
      </div>

      <div className="relative space-y-7 px-4 pb-28 pt-6">
        <header className="space-y-2">
          <div className="text-center">
            <div className="inline-flex items-baseline gap-1.5">
              <span className="text-[clamp(28px,7vw,42px)] font-semibold tracking-[0.18em] text-white">
                CMDLY
              </span>
              <span className="text-[clamp(18px,5vw,26px)] font-light tracking-tight text-white/70">.</span>
            </div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="font-display text-center font-light tracking-tight text-white text-[clamp(38px,9vw,48px)]"
            style={{ fontFamily: '"Crimson Pro", system-ui, serif' }}
          >
            {GREETING}
          </motion.h1>
        </header>

        <GlowSearch />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          <StatChip label="Commands" value={String(commands.length)} />
          <StatChip label="Platforms" value={String(PLATFORMS.length)} />
          <StatChip label="Saved" value={String(savedIds.size)} />
        </motion.div>

        <PlatformRail />

        {hasNew ? (
          <section>
            <div className="mb-3 flex items-end justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  New
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-wide text-vault-fg">What&apos;s new</h2>
                  <p className="text-sm text-vault-muted">
                    {newCommands.length > 0
                      ? `${newCommands.length} new command${newCommands.length === 1 ? "" : "s"} since your last visit`
                      : "Updated command bundle"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={markSeen}
                className="rounded-full bg-vault-pill-bg px-3 py-1.5 text-[11px] font-semibold text-vault-muted ring-1 ring-vault-border hover:bg-vault-muted/15 hover:text-vault-fg"
              >
                Mark seen
              </button>
            </div>
            {newCommands.length > 0 ? (
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 pt-1">
                {newCommands.slice(0, 8).map((cmd, i) => (
                  <MiniCommandCard key={`n-${cmd.id}`} cmd={cmd} delay={0.04 * i} onSelect={setFocusCmd} />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {recentlyViewed.length > 0 ? (
          <section>
            <SectionHeader title="Recently viewed" subtitle="The last few commands you opened" />
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 pt-1">
              {recentlyViewed.map((cmd, i) => (
                <MiniCommandCard key={`r-${cmd.id}`} cmd={cmd} delay={0.04 * i} onSelect={setFocusCmd} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeader title="Picks for you" subtitle="A handful to start with — refreshes each visit." />
          <div className="grid grid-cols-2 gap-3">
            {picks.map((cmd, i) => (
              <motion.button
                key={cmd.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, type: "spring", stiffness: 380, damping: 26 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFocusCmd(cmd)}
                className="rounded-2xl border border-vault-border bg-vault-surface p-3 text-left backdrop-blur-xl"
                style={{
                  boxShadow: `0 0 0 1px ${platformById(cmd.platform).accentSoft} inset, var(--card-elev-shadow)`,
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-vault-muted">
                  {platformById(cmd.platform).label}
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-vault-fg">{cmd.name}</div>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-vault-muted">{cmd.short}</p>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      <CommandDetailSheet cmd={focusCmd} onClose={() => setFocusCmd(null)} />
    </div>
  );
}
