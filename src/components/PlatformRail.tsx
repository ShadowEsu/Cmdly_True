import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PLATFORMS } from "../data/platforms";
import { useCommands } from "../context/CommandsContext";

export function PlatformRail() {
  const nav = useNavigate();
  const { commands } = useCommands();

  const counts = new Map<string, number>();
  for (const c of commands) counts.set(c.platform, (counts.get(c.platform) ?? 0) + 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-base font-semibold tracking-wide text-vault-fg">Platforms</h2>
          <p className="text-sm text-vault-muted">Tap a deck to browse its commands.</p>
        </div>
      </div>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 pt-1">
        {PLATFORMS.map((p, i) => {
          const count = counts.get(p.id) ?? 0;
          return (
            <motion.button
              key={p.id}
              type="button"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, type: "spring", stiffness: 400, damping: 28 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => nav(`/platform/${p.id}`)}
              className={`shrink-0 w-[136px] rounded-2xl border border-vault-border bg-gradient-to-br ${p.gradient} p-[1px]`}
              aria-label={`Open ${p.label} commands (${count})`}
            >
              <div className="h-full rounded-[14px] bg-vault-elevated/95 p-3 backdrop-blur-md dark:bg-black/35">
                <div
                  className="mb-2 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.accent }}
                  aria-hidden
                />
                <div className="text-sm font-semibold text-vault-fg">{p.label}</div>
                <div className="mt-1 text-[11px] text-vault-muted">{count} commands</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
