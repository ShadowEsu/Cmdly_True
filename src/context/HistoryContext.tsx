import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "cmdly:history";
const MAX_QUERIES = 10;
const MAX_VIEWS = 5;
const MAX_QUERY_LEN = 80;
const MAX_ID_LEN = 200;

type HistoryData = {
  queries: string[];
  views: string[];
};

type Ctx = HistoryData & {
  pushQuery: (q: string) => void;
  clearQueries: () => void;
  removeQuery: (q: string) => void;
  pushView: (id: string) => void;
  clearViews: () => void;
};

const HistoryContext = createContext<Ctx | null>(null);

function sanitizeQuery(q: string): string {
  return q.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LEN);
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

function loadHistory(): HistoryData {
  const empty: HistoryData = { queries: [], views: [] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return empty;
    const r = parsed as Record<string, unknown>;
    const queries = isStringArray(r.queries)
      ? r.queries
          .map(sanitizeQuery)
          .filter((s) => s.length > 0)
          .slice(0, MAX_QUERIES)
      : [];
    const views = isStringArray(r.views)
      ? r.views
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.length <= MAX_ID_LEN)
          .slice(0, MAX_VIEWS)
      : [];
    return { queries, views };
  } catch {
    return empty;
  }
}

function saveHistory(data: HistoryData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HistoryData>(() => ({ queries: [], views: [] }));

  useEffect(() => {
    setData(loadHistory());
  }, []);

  useEffect(() => {
    saveHistory(data);
  }, [data]);

  const pushQuery = useCallback((rawQ: string) => {
    const q = sanitizeQuery(rawQ);
    if (q.length < 2) return;
    setData((prev) => {
      const filtered = prev.queries.filter((item) => item.toLowerCase() !== q.toLowerCase());
      const next = [q, ...filtered].slice(0, MAX_QUERIES);
      return { ...prev, queries: next };
    });
  }, []);

  const removeQuery = useCallback((rawQ: string) => {
    const q = sanitizeQuery(rawQ);
    if (!q) return;
    setData((prev) => ({
      ...prev,
      queries: prev.queries.filter((item) => item.toLowerCase() !== q.toLowerCase()),
    }));
  }, []);

  const clearQueries = useCallback(() => setData((prev) => ({ ...prev, queries: [] })), []);

  const pushView = useCallback((rawId: string) => {
    const id = typeof rawId === "string" ? rawId.trim() : "";
    if (!id || id.length > MAX_ID_LEN) return;
    setData((prev) => {
      const filtered = prev.views.filter((v) => v !== id);
      const next = [id, ...filtered].slice(0, MAX_VIEWS);
      return { ...prev, views: next };
    });
  }, []);

  const clearViews = useCallback(() => setData((prev) => ({ ...prev, views: [] })), []);

  const value = useMemo<Ctx>(
    () => ({
      queries: data.queries,
      views: data.views,
      pushQuery,
      clearQueries,
      removeQuery,
      pushView,
      clearViews,
    }),
    [data, pushQuery, clearQueries, removeQuery, pushView, clearViews],
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const v = useContext(HistoryContext);
  if (!v) throw new Error("useHistory must be used within HistoryProvider");
  return v;
}
