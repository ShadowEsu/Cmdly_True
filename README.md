# Cmdly

A fast, offline command reference for AI dev tools — Claude, ChatGPT, Cursor, Gemini, Lovable, Perplexity, Copilot, Mistral, DeepSeek, Grok.

No accounts. No backend. No telemetry. Your saves and preferences stay on your device.

---

## Highlights

- **10 platforms, one search.** Every command in memory, instant filter, no network call.
- **Save what you use.** Bookmarked commands persist in `localStorage` (web) or `SharedPreferences` (Android).
- **Backup & restore.** Export your saves + preferences as a JSON file, import on a new device.
- **Hot-updateable.** The app ships with bundled data and also fetches a versioned `commands.json`. Bump the version on your CDN and clients pick up new commands on next launch — no app-store release required.
- **What's new badge.** Surfaces commands added since your last visit.
- **Search history.** Recent queries and recently viewed commands surface on the home screen.
- **Tunable.** Live font scale, accent color, and haptics — applied across the whole app.

---

## Stack

| Surface | Tech |
|---|---|
| Web app (`src/`) | React 18 · Vite 5 · TypeScript · Tailwind · Framer Motion · React Router |
| Android app (`android/`) | Kotlin · Jetpack Compose · Material 3 (separate native project) |
| Optional API (`server/`) | Express · Zod · Helmet · rate-limit (not required by the app) |

The core product is the web app. The Android module is a parallel native build of the same reference data. `server/` is optional plumbing for any future HTTP surface and is **not** used by the clients.

---

## Run the web app

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc --noEmit && vite build → dist/
npm run preview      # serve the production build
```

Static output is plain HTML/JS/CSS in `dist/` — deploy to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static host.

## Run the Android app

```bash
cd android
./gradlew :app:installDebug
```

Release builds expect a keystore at `android/keystore.properties` (template provided) or env vars `CMDLY_RELEASE_STORE_FILE`, `CMDLY_RELEASE_STORE_PASSWORD`, `CMDLY_RELEASE_KEY_ALIAS`, `CMDLY_RELEASE_KEY_PASSWORD`.

---

## Architecture

### Data flow
```
src/data/commands.ts  ──► bundled fallback (ships in the app)
                  │
                  ▼
        CommandsContext (React)
                  │
        ▲         │ on launch
        │         ▼
        │   fetch /commands.json  ──► localStorage cache
        │         │
        └─────────┘  if remote.version > bundled.version
```

- `src/context/CommandsContext.tsx` orchestrates bundled vs. remote vs. cached data.
- `public/commands.json` is the **hot-update channel** — replace it on your CDN, bump `version`, and every client will swap in the new data on next launch.
- The "What's new" UI compares the current command-ID set against a snapshot in `localStorage` (`cmdly:last-seen-bundle`).

### Local storage keys (web)

| Key | Holds |
|---|---|
| `ai-command-vault:saved` | Saved command IDs |
| `ai-command-vault:prefs` | Font size, accent, haptics |
| `cmdly:commands-bundle` | Cached remote command bundle |
| `cmdly:last-seen-bundle` | Snapshot for "What's new" diffing |
| `cmdly:history` | Recent queries + recently viewed IDs |

### Storage keys (Android)

| `SharedPreferences` file | Key |
|---|---|
| `vault_saved` | `command_ids` |
| `vault_settings` | `font_scale`, `haptics`, `accent` |

---

## Updating commands

You don't need to redeploy the app to add or change commands.

1. Edit `public/commands.json` on whatever static host serves the web app.
2. Bump `"version"` to a number greater than `BUNDLED_BUNDLE_VERSION` in `src/context/CommandsContext.tsx`.
3. Add or replace entries in the `commands` array. Schema is the same as the bundled `Command` type:

```jsonc
{
  "version": 2,
  "generatedAt": "2026-05-12T22:00:00Z",
  "commands": [
    {
      "id": "claude-new-thing",
      "platform": "claude",
      "name": "/new-thing",
      "short": "One-line summary.",
      "detail": "Longer description with usage tips.",
      "category": "Workflow",
      "weight": 2
    }
  ]
}
```

Clients fetch this file on launch (max once every 6 hours), validate every field, cache it locally, and fall back to the bundled list if anything fails.

Validation rules live in `CommandsContext.tsx`:
- `version` is a finite number.
- `commands` is an array with ≤ 5000 entries.
- Every entry has the right shape and field lengths.
- Unknown `platform` values are rejected.

---

## Backup & restore

Settings → **Backup** → **Export backup** downloads `cmdly-backup-<timestamp>.json`:

```json
{
  "app": "cmdly",
  "kind": "saves-backup",
  "version": 1,
  "exportedAt": "2026-05-12T23:30:00.000Z",
  "savedIds": ["claude-plan", "cr-1"],
  "prefs": { "fontSize": "lg", "accent": "cyan", "haptics": true }
}
```

Import accepts either a paste or a file upload. Choose **Merge** to keep existing saves and add the imported ones, or **Replace** to overwrite.

---

## Project layout

```
.
├── public/
│   ├── commands.json          # hot-update bundle (placeholder)
│   └── cmdly-logo.png         # home-screen logo (add yours)
├── src/
│   ├── components/            # UI primitives
│   ├── context/               # CommandsContext, CollectionsContext, HistoryContext, SettingsContext
│   ├── data/
│   │   ├── commands.ts        # bundled fallback dataset
│   │   └── platforms.ts       # platform metadata (colors, taglines)
│   ├── lib/                   # shuffle, backup
│   └── pages/                 # Home, Search, Platform, Collections, Settings
├── android/                   # Separate Kotlin Compose app
├── server/                    # Optional Express API (unused by clients)
├── marketing/                 # Video scripts and copy
└── index.html
```

---

## Privacy

Cmdly does not collect, transmit, or store any personal data on any server. Everything (saved IDs, settings, search history) is kept in `localStorage` / `SharedPreferences` on the device. The optional remote bundle fetch is a `GET` of a static JSON file with no headers identifying the user.

A public privacy policy URL is still required for App Store / Play Store submission — host one alongside the web app at `/privacy`.

---

## Disclaimer

Cmdly is an independent reference tool. It is not affiliated with, endorsed by, or sponsored by Anthropic, OpenAI, Google, GitHub, Perplexity, Mistral, DeepSeek, xAI, Lovable, or any other platform listed in the app. All product names, logos, and brands are property of their respective owners. Reference data is illustrative; always confirm shortcuts against each vendor's current documentation.

---

## License

See [`LICENSE`](./LICENSE). If absent at the time you're reading this, the code is unlicensed (all rights reserved by the author) and may not be redistributed without permission.
