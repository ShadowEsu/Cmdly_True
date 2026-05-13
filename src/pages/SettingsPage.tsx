import { useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useSettings, type Accent, type FontSize } from "../context/SettingsContext";
import { useCollections } from "../context/CollectionsContext";
import { buildBackup, downloadBackupFile, parseBackup } from "../lib/backup";

const APP_VERSION = "0.1.0";

const DISCLAIMER =
  "Cmdly is an independent reference tool. It is not affiliated with, endorsed by, or sponsored by Anthropic, OpenAI, Google, GitHub, Perplexity, Mistral, DeepSeek, xAI, Lovable, or any other platform listed in the app.";

type ImportMode = "merge" | "replace";

type Toast = { kind: "ok" | "err"; msg: string } | null;

const ACCENT_PREVIEW: Record<Accent, string> = {
  violet: "rgb(139 92 246)",
  cyan: "rgb(34 211 238)",
  amber: "rgb(251 191 36)",
};

const ACCENT_SOFT: Record<Accent, string> = {
  violet: "rgba(139, 92, 246, 0.22)",
  cyan: "rgba(34, 211, 238, 0.22)",
  amber: "rgba(251, 191, 36, 0.22)",
};

const FONT_PREVIEW_PX: Record<FontSize, number> = { sm: 13, md: 15, lg: 18 };

export function SettingsPage() {
  const { fontSize, haptics, accent, setFontSize, setHaptics, setAccent } = useSettings();
  const { savedIds, mergeSaves, replaceSaves } = useCollections();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [toast, setToast] = useState<Toast>(null);

  const sizes: FontSize[] = ["sm", "md", "lg"];
  const accents: Accent[] = ["violet", "cyan", "amber"];

  const chipBase = "flex-1 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition ring-vault-border";
  const chipOff = "bg-vault-surface text-vault-muted hover:bg-vault-pill-bg";
  const chipOnClass = "text-vault-fg";
  const chipOnStyle: CSSProperties = {
    backgroundColor: "rgb(var(--accent) / 0.22)",
    boxShadow: "0 0 0 1px rgb(var(--accent) / 0.35) inset",
  };

  function flash(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 2400);
  }

  function handleExport() {
    const json = buildBackup({
      savedIds,
      prefs: { fontSize, accent, haptics },
    });
    downloadBackupFile(json);
    flash("ok", "Backup downloaded.");
  }

  function applyImport(text: string) {
    const parsed = parseBackup(text);
    if (!parsed.ok) {
      flash("err", parsed.error);
      return;
    }
    if (importMode === "replace") replaceSaves(parsed.backup.savedIds);
    else mergeSaves(parsed.backup.savedIds);

    const p = parsed.backup.prefs;
    if (p.fontSize) setFontSize(p.fontSize);
    if (p.accent) setAccent(p.accent);
    if (typeof p.haptics === "boolean") setHaptics(p.haptics);

    setImportText("");
    flash("ok", `Imported ${parsed.backup.savedIds.length} saved item${parsed.backup.savedIds.length === 1 ? "" : "s"}.`);
  }

  function handleImportPaste() {
    if (!importText.trim()) {
      flash("err", "Paste a backup first.");
      return;
    }
    applyImport(importText);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) {
      flash("err", "File too large.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      applyImport(text);
    };
    reader.onerror = () => flash("err", "Could not read file.");
    reader.readAsText(file);
  }

  return (
    <div className="min-h-0 flex-1 px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-bold text-vault-fg">Settings</h1>
          <p className="text-sm text-vault-muted">Type size, accents, haptics, and on-device backup.</p>
        </header>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-vault-fg">Font size</h2>
            <span className="text-[11px] text-vault-subtle">Currently: {fontSize.toUpperCase()}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFontSize(s)}
                className={`${chipBase} ${fontSize === s ? chipOnClass : chipOff}`}
                style={fontSize === s ? chipOnStyle : undefined}
              >
                <span style={{ fontSize: `${FONT_PREVIEW_PX[s]}px` }}>{s === "sm" ? "S" : s === "md" ? "M" : "L"}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-vault-subtle">
            Scales the entire app — try one and watch the page resize.
          </p>
        </section>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-vault-fg">Accent</h2>
            <span
              className="h-3 w-3 rounded-full ring-1 ring-vault-border"
              style={{ backgroundColor: ACCENT_PREVIEW[accent] }}
              aria-hidden
            />
          </div>
          <p className="mt-1 text-xs text-vault-muted">Search focus ring, active tab, and saved highlight.</p>
          <div className="mt-3 flex gap-2">
            {accents.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAccent(a)}
                className={`${chipBase} ${accent === a ? chipOnClass : chipOff} capitalize`}
                style={
                  accent === a
                    ? {
                        backgroundColor: ACCENT_SOFT[a],
                        boxShadow: `0 0 0 1px ${ACCENT_PREVIEW[a]} inset`,
                      }
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: ACCENT_PREVIEW[a] }}
                    aria-hidden
                  />
                  {a}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-vault-fg">Haptic feedback</h2>
              <p className="mt-1 text-xs text-vault-muted">Short vibration when copy succeeds (supported devices).</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={haptics}
              onClick={() => {
                const next = !haptics;
                setHaptics(next);
                if (next) {
                  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    try {
                      navigator.vibrate(20);
                    } catch {
                      /* ignore */
                    }
                  }
                }
              }}
              className={`relative h-8 w-14 shrink-0 rounded-full ring-1 ring-vault-border transition ${
                haptics ? "" : "bg-vault-pill-bg"
              }`}
              style={
                haptics
                  ? { backgroundColor: "rgb(var(--accent) / 0.35)" }
                  : undefined
              }
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-vault-elevated shadow ring-1 ring-vault-border transition dark:bg-white ${
                  haptics ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-vault-fg">Backup</h2>
          <p className="mt-1 text-xs text-vault-muted">
            Your saves and preferences live only on this device. Export to a file you can keep, then import on a new
            device or after a reinstall.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-xl bg-vault-fg px-3 py-2 text-xs font-semibold text-vault-bg transition active:scale-[0.98]"
            >
              Export backup
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-vault-pill-bg px-3 py-2 text-xs font-semibold text-vault-fg ring-1 ring-vault-border transition hover:bg-vault-muted/15 active:scale-[0.98]"
            >
              Import from file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
            <span className="text-[11px] text-vault-subtle">{savedIds.size} saved on this device</span>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-vault-muted" htmlFor="import-text">
              Or paste a backup
            </label>
            <textarea
              id="import-text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='Paste JSON from a previous "Export backup"…'
              rows={4}
              className="w-full resize-y rounded-xl bg-vault-bg/40 px-3 py-2 font-mono text-xs text-vault-fg outline-none ring-1 ring-vault-border placeholder:text-vault-subtle focus:ring-violet-400/40"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setImportMode("merge")}
                  className={`${chipBase} ${importMode === "merge" ? chipOnClass : chipOff}`}
                  style={importMode === "merge" ? chipOnStyle : undefined}
                >
                  Merge
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("replace")}
                  className={`${chipBase} ${importMode === "replace" ? chipOnClass : chipOff}`}
                  style={importMode === "replace" ? chipOnStyle : undefined}
                >
                  Replace
                </button>
              </div>
              <button
                type="button"
                onClick={handleImportPaste}
                className="rounded-xl bg-vault-pill-bg px-3 py-2 text-xs font-semibold text-vault-fg ring-1 ring-vault-border transition hover:bg-vault-muted/15 active:scale-[0.98]"
              >
                Apply import
              </button>
            </div>
            <p className="text-[11px] text-vault-subtle">
              Merge keeps existing saves and adds imported ones. Replace clears current saves first.
            </p>
          </div>

          {toast ? (
            <div
              className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${
                toast.kind === "ok"
                  ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30"
                  : "bg-rose-500/15 text-rose-200 ring-rose-400/30"
              }`}
              role="status"
            >
              {toast.msg}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-vault-border bg-vault-surface p-4 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-vault-fg">About</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-vault-muted">App</dt>
            <dd className="text-vault-fg">Cmdly</dd>
            <dt className="text-vault-muted">Version</dt>
            <dd className="text-vault-fg">{APP_VERSION}</dd>
            <dt className="text-vault-muted">License</dt>
            <dd className="text-vault-fg">MIT</dd>
            <dt className="text-vault-muted">Privacy</dt>
            <dd>
              <Link to="/privacy" className="text-vault-fg underline-offset-4 hover:underline">
                Privacy policy
              </Link>
            </dd>
            <dt className="text-vault-muted">Contact</dt>
            <dd>
              <a className="text-vault-fg underline-offset-4 hover:underline" href="mailto:privacy@cmdly.app">
                privacy@cmdly.app
              </a>
            </dd>
          </dl>
        </section>

        <section className="rounded-2xl border border-vault-border bg-vault-surface/60 p-4 backdrop-blur-xl">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-vault-muted">Disclaimer</h2>
          <p className="mt-2 text-xs leading-relaxed text-vault-muted">{DISCLAIMER}</p>
          <p className="mt-2 text-[11px] text-vault-subtle">
            Reference data is illustrative — always confirm shortcuts against each vendor&apos;s current documentation.
          </p>
        </section>
      </div>
    </div>
  );
}
