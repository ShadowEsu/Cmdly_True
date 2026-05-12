import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const PREFS_KEY = "ai-command-vault:prefs";

export type FontSize = "sm" | "md" | "lg";
export type Accent = "violet" | "cyan" | "amber";
export type ThemeMode = "light" | "dark" | "system";

type Prefs = {
  theme: ThemeMode;
  fontSize: FontSize;
  haptics: boolean;
  accent: Accent;
};

const defaults: Prefs = {
  theme: "dark",
  fontSize: "md",
  haptics: true,
  accent: "violet",
};

const FONT_SIZES: ReadonlySet<FontSize> = new Set<FontSize>(["sm", "md", "lg"]);
const ACCENTS: ReadonlySet<Accent> = new Set<Accent>(["violet", "cyan", "amber"]);

const FONT_SCALE: Record<FontSize, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.12,
};

const ACCENT_RGB: Record<Accent, string> = {
  violet: "139 92 246",
  cyan: "34 211 238",
  amber: "251 191 36",
};

const ACCENT_SOFT_RGB: Record<Accent, string> = {
  violet: "139 92 246",
  cyan: "34 211 238",
  amber: "251 191 36",
};

export const accentRing: Record<Accent, string> = {
  violet: "rgba(139, 92, 246, 0.45)",
  cyan: "rgba(34, 211, 238, 0.45)",
  amber: "rgba(251, 191, 36, 0.45)",
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      theme: "dark",
      fontSize: FONT_SIZES.has(parsed.fontSize as FontSize) ? (parsed.fontSize as FontSize) : defaults.fontSize,
      haptics: typeof parsed.haptics === "boolean" ? parsed.haptics : defaults.haptics,
      accent: ACCENTS.has(parsed.accent as Accent) ? (parsed.accent as Accent) : defaults.accent,
    };
  } catch {
    return defaults;
  }
}

function applyDocumentTokens(prefs: Prefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("dark");
  root.style.colorScheme = "dark";
  root.style.setProperty("--font-scale", String(FONT_SCALE[prefs.fontSize]));
  root.style.setProperty("--accent", ACCENT_RGB[prefs.accent]);
  root.style.setProperty("--accent-soft", ACCENT_SOFT_RGB[prefs.accent]);
}

type Ctx = Prefs & {
  resolvedTheme: Exclude<ThemeMode, "system">;
  setTheme: (v: ThemeMode) => void;
  setFontSize: (v: FontSize) => void;
  setHaptics: (v: boolean) => void;
  setAccent: (v: Accent) => void;
  vibrate: (pattern?: number | number[]) => void;
};

const Ctx = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());

  useEffect(() => {
    applyDocumentTokens(prefs);
  }, [prefs]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  const setTheme = useCallback((theme: ThemeMode) => {
    void theme;
    setPrefs((p) => ({ ...p, theme: "dark" }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => {
    if (!FONT_SIZES.has(fontSize)) return;
    setPrefs((p) => ({ ...p, fontSize }));
  }, []);

  const setHaptics = useCallback((haptics: boolean) => setPrefs((p) => ({ ...p, haptics })), []);

  const setAccent = useCallback((accent: Accent) => {
    if (!ACCENTS.has(accent)) return;
    setPrefs((p) => ({ ...p, accent }));
  }, []);

  const vibrate = useCallback(
    (pattern: number | number[] = 12) => {
      if (!prefs.haptics) return;
      if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
      try {
        navigator.vibrate(pattern);
      } catch {
        /* ignore */
      }
    },
    [prefs.haptics],
  );

  const value = useMemo(
    () => ({
      ...prefs,
      resolvedTheme: "dark" as const,
      setTheme,
      setFontSize,
      setHaptics,
      setAccent,
      vibrate,
    }),
    [prefs, setTheme, setFontSize, setHaptics, setAccent, vibrate],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used within SettingsProvider");
  return v;
}
