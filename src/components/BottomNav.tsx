import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

type Tab = { to: string; label: "Browse" | "Search" | "Saved" | "Settings"; end?: boolean };

const tabs: Tab[] = [
  { to: "/", label: "Browse", end: true },
  { to: "/search", label: "Search" },
  { to: "/collections", label: "Saved" },
  { to: "/settings", label: "Settings" },
];

function Icon({ name }: { name: (typeof tabs)[number]["label"] }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    className: "text-current",
    stroke: "currentColor",
  };
  if (name === "Browse") {
    return (
      <svg {...common} aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeWidth="1.6" />
      </svg>
    );
  }
  if (name === "Search") {
    return (
      <svg {...common} aria-hidden>
        <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" strokeWidth="1.6" />
        <path d="M16.5 16.5 21 21" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "Saved") {
    return (
      <svg {...common} aria-hidden>
        <path
          d="M6 3h12a1 1 0 0 1 1 1v16.5L12 15.5 5 20.5V4a1 1 0 0 1 1-1Z"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "Settings") {
    return (
      <svg {...common} aria-hidden>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" strokeWidth="1.6" />
        <path
          d="M19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7.6 7.6 0 0 0-1.7-1L15 4h-6l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.5a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7.6 7.6 0 0 0 1.7 1L9 20h6l.4-2.5a7.6 7.6 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5Z"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-vault-border bg-vault-nav pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-[backdrop-filter]:bg-vault-nav/80"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 py-1.5">
        {tabs.map((t) => {
          const active = t.end ? pathname === "/" : pathname.startsWith(t.to);
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={`group relative flex flex-1 items-center justify-center text-[11px] font-medium transition-colors ${
                active ? "text-vault-fg" : "text-vault-muted hover:text-vault-fg"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    backgroundColor: "rgb(var(--accent) / 0.18)",
                    boxShadow: "0 0 0 1px rgb(var(--accent) / 0.3) inset",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : (
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                  style={{ backgroundColor: "rgb(var(--accent) / 0.10)" }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5 px-2 py-2">
                <Icon name={t.label} />
                <span className={active ? "font-semibold text-vault-pill-fg" : ""}>{t.label}</span>
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
