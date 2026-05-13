import { Link } from "react-router-dom";

const LAST_UPDATED = "May 12, 2026";

export function PrivacyPage() {
  return (
    <div className="min-h-0 flex-1 px-4 pb-28 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="space-y-1">
          <Link to="/settings" className="text-xs font-semibold text-vault-muted hover:text-vault-fg">
            ← Settings
          </Link>
          <h1 className="text-xl font-bold text-vault-fg">Privacy</h1>
          <p className="text-xs text-vault-subtle">Last updated {LAST_UPDATED}</p>
        </header>

        <section className="space-y-3 rounded-2xl border border-vault-border bg-vault-surface p-4 text-sm leading-relaxed text-vault-fg">
          <p>
            Cmdly is built to be useful without knowing who you are. We do not run accounts, ads, analytics, or
            crash reporting, and there is no backend that stores your information.
          </p>

          <h2 className="pt-2 text-base font-semibold">What stays on your device</h2>
          <ul className="ml-4 list-disc space-y-1 text-vault-muted">
            <li>Saved command IDs</li>
            <li>Your preferences: font size, accent color, haptics</li>
            <li>Recent search queries and recently viewed commands</li>
          </ul>
          <p className="text-vault-muted">
            On the web this lives in <code className="font-mono">localStorage</code>; on Android it lives in app{" "}
            <code className="font-mono">SharedPreferences</code>. Uninstalling the app or clearing site data
            removes it.
          </p>

          <h2 className="pt-2 text-base font-semibold">What we do not collect</h2>
          <ul className="ml-4 list-disc space-y-1 text-vault-muted">
            <li>Name, email, account, or any identifier</li>
            <li>Location, contacts, microphone, camera, or clipboard contents</li>
            <li>Usage analytics, behavioural events, or device fingerprints</li>
          </ul>

          <h2 className="pt-2 text-base font-semibold">Network requests</h2>
          <p className="text-vault-muted">
            The web app fetches a single static file (<code className="font-mono">/commands.json</code>) on launch
            to check for updates to the command catalog. The request has no identifying headers beyond what the
            browser sends to any website. We do not log, store, or share that traffic.
          </p>
          <p className="text-vault-muted">
            The Android app is fully offline and makes no network calls.
          </p>

          <h2 className="pt-2 text-base font-semibold">Children</h2>
          <p className="text-vault-muted">
            Cmdly is rated for general audiences and does not target children under 13. No personal data is
            collected from anyone, including children.
          </p>

          <h2 className="pt-2 text-base font-semibold">Third parties</h2>
          <p className="text-vault-muted">
            None. Cmdly does not embed third-party SDKs, ad networks, or trackers. The bundled command catalog
            references products from Anthropic, OpenAI, Google, GitHub, Perplexity, Mistral, DeepSeek, xAI, and
            Lovable for educational reference only; Cmdly is not affiliated with them.
          </p>

          <h2 className="pt-2 text-base font-semibold">Your control</h2>
          <p className="text-vault-muted">
            Export or wipe your data at any time from Settings → Backup. Removing the app removes every byte
            Cmdly stored about your usage.
          </p>

          <h2 className="pt-2 text-base font-semibold">Changes</h2>
          <p className="text-vault-muted">
            If this policy ever changes, the new "Last updated" date above will reflect that. Material changes
            will be surfaced in-app.
          </p>

          <h2 className="pt-2 text-base font-semibold">Contact</h2>
          <p className="text-vault-muted">
            Questions: <a className="underline" href="mailto:privacy@cmdly.app">privacy@cmdly.app</a>
          </p>
        </section>

        <p className="text-[11px] text-vault-subtle">
          This page is also available at <code className="font-mono">cmdly.app/privacy</code> for reference in
          store listings.
        </p>
      </div>
    </div>
  );
}
