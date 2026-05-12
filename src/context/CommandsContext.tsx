import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Command, PlatformId } from "../types";
import { ALL_COMMANDS } from "../data/commands";

export const BUNDLED_BUNDLE_VERSION = 1;
const STORAGE_KEY = "cmdly:commands-bundle";
const SEEN_KEY = "cmdly:last-seen-bundle";
const REMOTE_URL = "/commands.json";
const FETCH_TIMEOUT_MS = 5000;
const REFRESH_THROTTLE_MS = 6 * 60 * 60 * 1000;
const MAX_COMMANDS = 5000;

type BundleSource = "bundled" | "cache" | "remote";

type RawBundle = {
  version: number;
  generatedAt?: string;
  commands: Command[];
};

type CachedBundle = RawBundle & { fetchedAt: number };

type Seen = {
  version: number;
  ids: string[];
  markedAt: string;
};

type Ctx = {
  commands: Command[];
  version: number;
  source: BundleSource;
  refreshing: boolean;
  lastFetchedAt: number | null;
  refresh: () => Promise<void>;
  commandsForPlatform: (platform: PlatformId) => Command[];
  newCommands: Command[];
  hasNew: boolean;
  lastSeenVersion: number | null;
  markSeen: () => void;
};

const CommandsContext = createContext<Ctx | null>(null);

const PLATFORM_IDS: ReadonlySet<PlatformId> = new Set<PlatformId>([
  "claude",
  "chatgpt",
  "cursor",
  "gemini",
  "lovable",
  "perplexity",
  "copilot",
  "mistral",
  "deepseek",
  "grok",
]);

function isCommand(x: unknown): x is Command {
  if (!x || typeof x !== "object") return false;
  const c = x as Record<string, unknown>;
  if (typeof c.id !== "string" || c.id.length === 0 || c.id.length > 200) return false;
  if (typeof c.platform !== "string" || !PLATFORM_IDS.has(c.platform as PlatformId)) return false;
  if (typeof c.name !== "string" || c.name.length === 0 || c.name.length > 200) return false;
  if (typeof c.short !== "string" || c.short.length > 1000) return false;
  if (typeof c.detail !== "string" || c.detail.length > 5000) return false;
  if (typeof c.category !== "string" || c.category.length > 80) return false;
  if (c.weight !== undefined && typeof c.weight !== "number") return false;
  return true;
}

function isRawBundle(x: unknown): x is RawBundle {
  if (!x || typeof x !== "object") return false;
  const b = x as Record<string, unknown>;
  if (typeof b.version !== "number" || !Number.isFinite(b.version)) return false;
  if (!Array.isArray(b.commands)) return false;
  if (b.commands.length > MAX_COMMANDS) return false;
  return b.commands.every(isCommand);
}

function readCache(): CachedBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRawBundle(parsed)) return null;
    const fetchedAt = (parsed as { fetchedAt?: unknown }).fetchedAt;
    if (typeof fetchedAt !== "number") return null;
    return { ...(parsed as RawBundle), fetchedAt };
  } catch {
    return null;
  }
}

function writeCache(bundle: CachedBundle) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
  } catch {
    /* ignore quota errors */
  }
}

function readSeen(): Seen | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Record<string, unknown>;
    if (typeof p.version !== "number" || !Array.isArray(p.ids)) return null;
    const ids = p.ids.filter((s): s is string => typeof s === "string" && s.length > 0 && s.length <= 200);
    return {
      version: p.version,
      ids,
      markedAt: typeof p.markedAt === "string" ? p.markedAt : "",
    };
  } catch {
    return null;
  }
}

function writeSeen(seen: Seen) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    /* ignore */
  }
}

function dedupeById(list: Command[]): Command[] {
  const seen = new Set<string>();
  const out: Command[] = [];
  for (const c of list) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

export function CommandsProvider({ children }: { children: ReactNode }) {
  const [commands, setCommands] = useState<Command[]>(() => dedupeById(ALL_COMMANDS));
  const [version, setVersion] = useState<number>(BUNDLED_BUNDLE_VERSION);
  const [source, setSource] = useState<BundleSource>("bundled");
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [seen, setSeen] = useState<Seen | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    const cache = readCache();
    if (cache && cache.version > BUNDLED_BUNDLE_VERSION) {
      setCommands(dedupeById(cache.commands));
      setVersion(cache.version);
      setSource("cache");
      setLastFetchedAt(cache.fetchedAt);
    } else if (cache) {
      setLastFetchedAt(cache.fetchedAt);
    }

    const existingSeen = readSeen();
    if (existingSeen) {
      setSeen(existingSeen);
    } else {
      const initialCommands = cache && cache.version > BUNDLED_BUNDLE_VERSION ? cache.commands : ALL_COMMANDS;
      const initialVersion = cache && cache.version > BUNDLED_BUNDLE_VERSION ? cache.version : BUNDLED_BUNDLE_VERSION;
      const initial: Seen = {
        version: initialVersion,
        ids: initialCommands.map((c) => c.id),
        markedAt: new Date().toISOString(),
      };
      writeSeen(initial);
      setSeen(initial);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`${REMOTE_URL}?t=${Date.now()}`, {
        signal: ctrl.signal,
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = (await res.json()) as unknown;
      if (!isRawBundle(raw)) throw new Error("invalid bundle");

      const fetchedAt = Date.now();
      if (raw.version > version) {
        const next: CachedBundle = {
          version: raw.version,
          generatedAt: raw.generatedAt,
          commands: dedupeById(raw.commands),
          fetchedAt,
        };
        writeCache(next);
        setCommands(next.commands);
        setVersion(next.version);
        setSource("remote");
      }
      setLastFetchedAt(fetchedAt);
    } catch {
      /* offline or invalid: keep current */
    } finally {
      clearTimeout(timer);
      inFlight.current = false;
      setRefreshing(false);
    }
  }, [version]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cache = readCache();
    const last = cache?.fetchedAt ?? 0;
    if (Date.now() - last < REFRESH_THROTTLE_MS) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commandsForPlatform = useCallback(
    (platform: PlatformId) => commands.filter((c) => c.platform === platform),
    [commands],
  );

  const newCommands = useMemo<Command[]>(() => {
    if (!seen) return [];
    const seenIds = new Set(seen.ids);
    return commands.filter((c) => !seenIds.has(c.id));
  }, [commands, seen]);

  const hasNew = newCommands.length > 0 || (seen ? version > seen.version : false);

  const markSeen = useCallback(() => {
    const next: Seen = {
      version,
      ids: commands.map((c) => c.id),
      markedAt: new Date().toISOString(),
    };
    writeSeen(next);
    setSeen(next);
  }, [commands, version]);

  const value = useMemo<Ctx>(
    () => ({
      commands,
      version,
      source,
      refreshing,
      lastFetchedAt,
      refresh,
      commandsForPlatform,
      newCommands,
      hasNew,
      lastSeenVersion: seen?.version ?? null,
      markSeen,
    }),
    [
      commands,
      version,
      source,
      refreshing,
      lastFetchedAt,
      refresh,
      commandsForPlatform,
      newCommands,
      hasNew,
      seen,
      markSeen,
    ],
  );

  return <CommandsContext.Provider value={value}>{children}</CommandsContext.Provider>;
}

export function useCommands() {
  const v = useContext(CommandsContext);
  if (!v) throw new Error("useCommands must be used within CommandsProvider");
  return v;
}
