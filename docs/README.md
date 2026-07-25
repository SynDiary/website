# SynDiary docs (docs.syndiary.com)

Astro [Starlight](https://starlight.astro.build/) documentation site.

## Local development

Requires **Node ≥ 22.12** (see `.nvmrc` → `22`, i.e. the latest 22.x).

```sh
cd docs
npm ci          # clean install from committed package-lock.json
npm run dev      # local dev server (http://localhost:4321)
npm run build    # production build → dist/
npm run preview  # preview the built site
```

> Always run scripts with `npm run …` (not a bare `astro …`).

## Brand tokens

Brand colors/shape/font come from `../shared/brand-tokens.css` (canonical), pulled
in through the bridge stylesheet `src/styles/tokens.css` via `@import`. Vite's dev
server is granted read access to `../shared/` via `vite.server.fs.allow` in
`astro.config.mjs`. See the root `README.md` for the sync checklist with the
marketing site.

Sora is **self-hosted** (`@fontsource-variable/sora`) — the build emits woff2 files
into `/_astro` and makes no third-party font requests.

## Content notes

The Facebook/Instagram export guide uses Meta's official illustrative screenshots
(from the internal guide document; `src/assets/meta-guide/`, captioned
"Source: Meta"). Steps 5 to 9 have no imagery yet. To add it, capture from a
SynDiary-owned test account (never showing private messages/photos, emails, phone
numbers, or real follower names): amount of information, "Download to device",
download options (date range/format/media quality), "Create files", and the
available-downloads screen.

House style for docs prose: no em dashes, straight quotes and apostrophes
(`smartypants` is disabled in `astro.config.mjs` so markdown does not re-curl
them), and no AI-tell-tale phrasing. See the design system project for the full
voice rules.

## Deployment — Cloudflare Pages

| Setting            | Value             |
| ------------------ | ----------------- |
| Production branch  | `main`            |
| Root directory     | `docs`            |
| Build command      | `npm run build`   |
| Output directory   | `dist`            |
| Node version       | `.nvmrc` → `22` (latest 22.x, must be ≥ 22.12). If you also set a `NODE_VERSION` env var in CF, keep it identical — the env var wins over `.nvmrc`. |

Build output dir is also declared in `wrangler.toml` (`pages_build_output_dir`).
Static output — no Astro Cloudflare adapter needed. `public/_headers` is copied
into `dist/` and honored by Pages. Per-PR/branch preview deployments are automatic
via the GitHub integration.

Custom domain `docs.syndiary.com`: add it in the Pages project (the `syndiary.com`
zone is already on Cloudflare, so DNS + TLS are auto-provisioned).
