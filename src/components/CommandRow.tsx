import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import type { Command } from "../types";
import { platformById } from "../data/platforms";
import { useCollections } from "../context/CollectionsContext";
import { useSettings } from "../context/SettingsContext";
import { CopyIcon } from "./CopyIcon";
import { CommandDetailSheet } from "./CommandDetailSheet";

function BookmarkIcon({ filled, className, size = 20 }: { filled: boolean; className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className={className}
      aria-hidden
    >
      <path
        d="M6 3h12a1 1 0 0 1 1 1v16.5L12 15.5 5 20.5V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommandRow({ cmd, index = 0 }: { cmd: Command; index?: number }) {
  const [showSheet, setShowSheet] = useState(false);
  const { toggleSave, isSaved } = useCollections();
  const { vibrate } = useSettings();
  const p = platformById(cmd.platform);
  const saved = isSaved(cmd.id);

  const [copied, setCopied] = useState(false);

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      vibrate(12);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 380, damping: 28 }}
      className="group relative overflow-hidden rounded-2xl border border-vault-border bg-vault-surface shadow-[var(--card-elev-shadow)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg"
      style={{ boxShadow: `0 0 0 1px ${p.accentSoft} inset, var(--card-elev-shadow)` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.06] via-transparent to-transparent opacity-60 dark:from-white/[0.04]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px]" style={{ background: p.accent }} />
      <div
        role="button"
        tabIndex={0}
        className="relative flex w-full cursor-pointer items-start gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 dark:focus-visible:ring-white/25"
        onClick={() => setShowSheet(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowSheet(true);
          }
        }}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[16px] font-semibold tracking-tight text-vault-fg dark:[text-shadow:0_0_20px_rgba(255,255,255,0.08)]">
              {cmd.name}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-vault-border"
              style={{ backgroundColor: p.accentSoft, color: "var(--color-vault-fg)" }}
            >
              {cmd.category}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-vault-muted">{cmd.short}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className={`grid h-11 w-11 place-items-center rounded-xl transition active:scale-[0.96] ${
              saved ? "" : "bg-vault-pill-bg text-vault-fg ring-1 ring-vault-border hover:bg-vault-muted/15 dark:hover:bg-white/10"
            }`}
            style={
              saved
                ? {
                    backgroundColor: "rgb(var(--accent) / 0.18)",
                    color: "rgb(var(--accent))",
                    boxShadow: "0 0 0 1px rgb(var(--accent) / 0.35) inset",
                  }
                : undefined
            }
            onClick={(e) => {
              e.stopPropagation();
              vibrate(10);
              toggleSave(cmd);
            }}
            aria-label={saved ? `Unsave ${cmd.name}` : `Save ${cmd.name}`}
          >
            <BookmarkIcon filled={saved} className="opacity-90" size={20} />
          </button>
          <div className="relative">
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 4, scale: 0.8 }}
                  animate={{ opacity: 1, y: -24, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-vault-fg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-vault-bg shadow-xl"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl bg-vault-pill-bg ring-1 ring-vault-border transition hover:bg-vault-muted/15 active:scale-[0.96] dark:hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                void copyText(cmd.name);
              }}
              aria-label={`Copy ${cmd.name}`}
            >
              <CopyIcon className="text-vault-fg opacity-85" size={20} />
            </button>
          </div>
          <span
            className="grid h-11 w-11 place-items-center rounded-xl text-vault-subtle ring-1 ring-transparent transition group-hover:bg-vault-scrim"
            aria-hidden
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
      {showSheet && typeof document !== "undefined"
        ? createPortal(<CommandDetailSheet cmd={cmd} onClose={() => setShowSheet(false)} />, document.body)
        : null}
    </motion.article>
  );
}
