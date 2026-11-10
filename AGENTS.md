# AGENTS.md

Kahoot-style quiz app for Colombian driving schools (Ley 769 de 2002). React 19 + TypeScript SPA built with Vite 8 and Tailwind v4, served by an Express 4 server that also provides the real-time API. UI copy and question content are in Spanish.

## Commands

- Install with `bun install` — only `bun.lock` is committed (no npm lockfile), despite the README saying `npm install`.
- `npm run dev` / `bun run dev` runs `tsx server.ts` on http://localhost:3000. This is the real dev entrypoint, not plain `vite`; Express mounts Vite in middleware mode.
- `npm run build` → `vite build` into `dist/`.
- `npm run lint` is just `tsc --noEmit`. There is no ESLint config and no test suite; use `tsc` plus a manual browser check.
- Production serving needs `NODE_ENV=production`: `NODE_ENV=production npm start`. Plain `npm start` does not set it, so it boots the Vite dev middleware even after a build.
- `node scripts/generate-icons.js` regenerates the PWA icons in `public/` (not wired to any npm script).
- `npm run clean` uses `rm -rf`, which fails in Windows `cmd`; delete `dist/` manually if needed.
- Plain `npm install` fails with ERESOLVE (`esbuild@0.25` vs `vite@8` peer); use `bun install`, or `npm install --legacy-peer-deps` only if bun is unavailable.

## Deploy

- Production: https://prueba-vial.vercel.app (Vercel project `prueba-vial`, linked in `.vercel/`). Deploy with `vercel --prod` from the repo root.
- Vercel detects `bun.lock` → `bun install`, uses Node 26, then runs `npm run build`. Only `dist/` is served; there is no backend/SSE on Vercel.
- The production alias is public; per-deployment URLs (`*-<hash>.vercel.app`) are behind Vercel SSO. Give students the alias, not the deployment URL.
- On this Windows machine Device Guard blocks bun's `.exe` shims (`node_modules/.bin/tsc.exe`, `vite.exe`) and some native binaries, so `npm run build`/`npm run lint` fail locally even though Vercel builds fine. Run `node node_modules/vite/bin/vite.js build` and `node node_modules/typescript/bin/tsc --noEmit` directly instead.

## Architecture

- `src/App.tsx` holds all host state (PIN, questions, players, stage, timer) and role switching. Role is chosen by URL (`?pin=XXXXXX&role=student`); host is the default. `dualView` renders host and student UIs side by side.
- `server.ts` keeps game sessions in an in-memory `sessions` map. Restarting the server drops all PINs/players; there is no database.
- `src/utils/syncChannel.ts` implements 4-tier sync: SSE `/api/game/events` → `BroadcastChannel` → `localStorage` `storage` events → public ntfy.sh relay. Students POST to `/api/game/join|answer`; the host pushes stage changes to `/api/game/stage`. ntfy.sh is an external dependency and the only cross-device transport for the standalone HTML export.
- `vercel.json` deploys only the static `dist/` build; the Express/SSE APIs do not exist there, so realtime degrades to BroadcastChannel/localStorage/ntfy.
- Question bank: `src/data/defaultQuestions.ts` is the app's source of truth. `src/utils/generateSingleHtml.ts` embeds a **separate, older 12-question copy** inside its template string for the downloadable single-file HTML; edits to the typed bank do not propagate. Keep both in sync if the export matters.

## Gotchas

- `generateSingleHtml.ts` returns one large JS template literal. Escape backticks and `${` when editing it, or the module stops parsing.
- The `@` alias points at the repo root, not `src/` (`vite.config.ts` + tsconfig `@/* → ./*`). No code uses it yet.
- Tailwind v4 is wired through `@tailwindcss/vite`; `src/index.css` only contains `@import "tailwindcss";`. There is no `tailwind.config.js`, so add theme tokens in CSS, not a JS config.
- Client persistence is all `localStorage` under `vialkahoot_*` keys (questions, custom base URL, mute, last sync message). Clearing it resets the question bank to defaults.
- `vite.config.ts` disables HMR/watching when `DISABLE_HMR=true` (AI Studio environment); keep that behavior.
- `/api/config` reads `APP_URL`; `GEMINI_API_KEY`, `@google/genai`, and `metadata.json`'s Gemini capability are scaffold leftovers and unused.
- `package.json` name is still `react-example`; do not use it to infer the app.
