import type { Accent, FontSize } from "../context/SettingsContext";

export const BACKUP_APP = "cmdly";
export const BACKUP_KIND = "saves-backup";
export const BACKUP_VERSION = 1;

export type BackupPrefs = {
  fontSize?: FontSize;
  accent?: Accent;
  haptics?: boolean;
};

export type Backup = {
  app: typeof BACKUP_APP;
  kind: typeof BACKUP_KIND;
  version: number;
  exportedAt: string;
  savedIds: string[];
  prefs: BackupPrefs;
};

const FONT_SIZES: ReadonlySet<FontSize> = new Set<FontSize>(["sm", "md", "lg"]);
const ACCENTS: ReadonlySet<Accent> = new Set<Accent>(["violet", "cyan", "amber"]);

export function buildBackup(input: { savedIds: Iterable<string>; prefs: BackupPrefs }): string {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const raw of input.savedIds) {
    if (typeof raw !== "string") continue;
    const id = raw.trim();
    if (!id || id.length > 200 || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  ids.sort();

  const prefs: BackupPrefs = {};
  if (input.prefs.fontSize && FONT_SIZES.has(input.prefs.fontSize)) prefs.fontSize = input.prefs.fontSize;
  if (input.prefs.accent && ACCENTS.has(input.prefs.accent)) prefs.accent = input.prefs.accent;
  if (typeof input.prefs.haptics === "boolean") prefs.haptics = input.prefs.haptics;

  const payload: Backup = {
    app: BACKUP_APP,
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    savedIds: ids,
    prefs,
  };
  return JSON.stringify(payload, null, 2);
}

export type ParseResult =
  | { ok: true; backup: Backup }
  | { ok: false; error: string };

export function parseBackup(text: string): ParseResult {
  if (typeof text !== "string" || text.length === 0) {
    return { ok: false, error: "Empty backup." };
  }
  if (text.length > 1_000_000) {
    return { ok: false, error: "Backup too large." };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "Not valid JSON." };
  }
  if (!raw || typeof raw !== "object") return { ok: false, error: "Not a backup object." };
  const r = raw as Record<string, unknown>;
  if (r.app !== BACKUP_APP) return { ok: false, error: "Not a Cmdly backup." };
  if (r.kind !== BACKUP_KIND) return { ok: false, error: "Wrong backup kind." };
  if (typeof r.version !== "number" || r.version < 1) return { ok: false, error: "Unsupported backup version." };
  if (!Array.isArray(r.savedIds)) return { ok: false, error: "Missing savedIds list." };

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const v of r.savedIds) {
    if (typeof v !== "string") continue;
    const id = v.trim();
    if (!id || id.length > 200 || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length > 5000) break;
  }

  const prefsRaw = (r.prefs && typeof r.prefs === "object" ? r.prefs : {}) as Record<string, unknown>;
  const prefs: BackupPrefs = {};
  if (typeof prefsRaw.fontSize === "string" && FONT_SIZES.has(prefsRaw.fontSize as FontSize)) {
    prefs.fontSize = prefsRaw.fontSize as FontSize;
  }
  if (typeof prefsRaw.accent === "string" && ACCENTS.has(prefsRaw.accent as Accent)) {
    prefs.accent = prefsRaw.accent as Accent;
  }
  if (typeof prefsRaw.haptics === "boolean") prefs.haptics = prefsRaw.haptics;

  const exportedAt = typeof r.exportedAt === "string" ? r.exportedAt : new Date().toISOString();

  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      kind: BACKUP_KIND,
      version: 1,
      exportedAt,
      savedIds: ids,
      prefs,
    },
  };
}

export function downloadBackupFile(json: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cmdly-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
