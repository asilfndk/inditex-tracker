# Atelier

A multi-brand stock & price tracker for macOS, built as a menu-bar Electron app. Paste a product URL to check availability instantly, or add it to your watchlist to get a native desktop notification the moment it comes back in stock or drops in price.

Atelier lives in the menu bar (it never shows in the Dock — `LSUIElement`), so it keeps running in the background and checking your products on a schedule even when the window is closed. Size- and color-level filtering is supported.

## Supported stores

| | |
|---|---|
| **Inditex** | Zara · Bershka · Stradivarius |
| **Others** | Mango · SneaksUp · Tommy Hilfiger · Victoria's Secret · Boyner · Wunder · Superstep |

## Features

- **Instant check** — paste any supported product URL and see name, price, image, colors, and per-size stock.
- **Watchlist** — track a product (optionally pinned to a specific size/color) with no duplicate entries.
- **Background monitoring** — a `node-cron` job re-checks every tracked product on a configurable interval.
- **Smart notifications** — local desktop alerts on out-of-stock → in-stock transitions and on price drops, with a macOS Dock badge.
- **Size/color filtering** — track exactly the variant you care about.
- **Live "last checked" counter** and instant re-check on launch or interval change.
- **Fully local** — all data lives in a local SQLite database; no servers, no accounts, no telemetry.

## Download

Grab the latest `.dmg` from the [**Releases**](https://github.com/asilfndk/inditex-tracker/releases/latest) page:

- **Apple Silicon (M1/M2/M3…):** `Atelier-<version>-arm64.dmg`
- **Intel Macs:** `Atelier-<version>-x64.dmg`

> The app is distributed unsigned (no Apple Developer account). On first launch macOS may warn you — open **System Settings → Privacy & Security** and click **"Open Anyway"**.

## Tech stack

- **Electron 41** — desktop shell (main + preload processes)
- **Next.js 16** (App Router) — renderer only, statically exported (`output: "export"`)
- **TypeScript** · **Tailwind CSS v4** · **framer-motion** · **lucide-react**
- **SQLite** (`better-sqlite3`) + **Drizzle ORM**
- **node-cron** — scheduled checks in the main process
- **esbuild** — bundles `electron/*.ts` → `dist-electron/*.js`

## Architecture

The renderer (Next.js) never touches the database or the network directly. All data access and scraping run in the **Electron main process**; the renderer reaches them only over IPC via a `window.api` bridge exposed by `electron/preload.ts`.

```
electron/      Main process (bundled by esbuild → dist-electron/)
  main.ts        Bootstrap: single-instance lock, window, tray, scheduler
  preload.ts     contextBridge → window.api (whitelisted IPC channels)
  ipc.ts         ipcMain.handle(...) — all renderer calls
  scheduler.ts   node-cron job + checkAll/checkOne + notification triggers
  notifications.ts  Native Notification + macOS dock badge
app/           Next.js renderer (static export) — single page
components/     CheckBar, ProductResult, Watchlist, StockMatrix, SettingsPanel
lib/
  repo.ts        All DB access (Drizzle) — main process only
  scrapers/      Per-brand scrapers (hybrid: internal API → hidden BrowserWindow)
db/            Drizzle schema, migrations, better-sqlite3 connection
```

### Scraping (two-layer hybrid)

Every brand scraper extends `BaseScraper` and runs a shared `check()` flow:

1. **Layer 1 — internal REST API** (`fetchFromApi`): the fast path. Returns `null` when unsupported/blocked, falling through to layer 2.
2. **Layer 2 — hidden `BrowserWindow`**: loads the page with realistic headers, runs an in-page extraction script (JSON-LD / DOM), then validates the result with a zod schema. Concurrency is capped at 2.

All scrapers return a common shape:
`{ name, price, currency, imageUrl, colors[], sizes[{ label, inStock }], inStock }`.

## Development

> Requires Node.js and npm. `better-sqlite3` is a native module — if you change the Electron/Node ABI, run `npm run rebuild`.

```bash
npm install
npm run dev      # Next dev server (3000) + Electron together
```

Create a `.env.local` for development:

```bash
DATABASE_URL=file:./data/app.db   # SQLite path (production overrides this to userData/app.db)
CHECK_INTERVAL_CRON=*/15 * * * *  # default check interval (also stored in settings)
```

### Build & package

```bash
npm run build          # build:next (→ out/) + build:electron (→ dist-electron/)
npm run dist           # package macOS .dmg — arm64 + x64
npm run dist:arm64     # single-arch .dmg (faster / isolated)
npm run dist:x64
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next dev + Electron together (`concurrently`) |
| `npm run build` | Build renderer + main |
| `npm run dist` | Package macOS `.dmg` (arm64 + x64) |
| `npm run rebuild` | Rebuild `better-sqlite3` against the Electron ABI |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a Drizzle migration |
| `npm run db:migrate` | Apply migrations (dev) |
| `npm run db:studio` | Drizzle Studio |

### Adding a new store scraper

1. Create `lib/scrapers/<brand>.ts` extending `BaseScraper`; implement `brand`, `canHandle`, `parseUrl`, `fetchFromApi`, `pageScript`.
2. Add the layer-2 extraction script to `lib/scrapers/page-script.ts`.
3. Add the brand to `BRANDS` in `db/schema.ts` (and a label in `lib/brands.ts`).
4. Register it in the `scrapers[]` list in `lib/scrapers/index.ts`.

## License

No license file is currently included — all rights reserved by the author. This is a personal project for educational/personal use.
