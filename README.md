# SynDiary web

Monorepo for SynDiary's public websites.

```
.
├── www/     Marketing site — www.syndiary.com  (static HTML + Bootstrap; Netlify)
├── docs/    Documentation  — docs.syndiary.com  (Astro Starlight; Cloudflare Pages)
└── shared/  Cross-site design tokens (brand-tokens.css)
```

## www/ — marketing site

Hand-authored static site (Bootstrap 5, vendored). **No build step.** Edit the HTML/CSS
directly and deploy.

- **Host:** Netlify (static hosting, contact-form capture + reCAPTCHA, Functions,
  and dedicated Blobs storage).
- **Publish directory:** `www/` (see root `netlify.toml`).
- Serves `www/app-min-version.json` at `https://www.syndiary.com/app-min-version.json`
  (consumed by the mobile app) and `www/_headers` for cache control.

## docs/ — documentation site

Astro Starlight app. See [`docs/README.md`](docs/README.md) for local development,
build, and deployment details.

- **Host:** Cloudflare Pages.
- **Deployment:** Cloudflare Pages Direct Upload project `syndiary-docs` (`Git Provider: No`),
  using branch `main` for production. Build from `docs/` with `npm ci && npm run build`,
  then upload `dist/` with Wrangler and the exact `main` commit metadata.
- **Runtime:** **Node ≥ 22.12** (`docs/.nvmrc`). The output directory is declared in
  `docs/wrangler.toml` (`pages_build_output_dir`).

## shared/ — design tokens

`shared/brand-tokens.css` holds the canonical SynDiary brand tokens (colors, radii,
shadows, font) as CSS custom properties. The docs site imports it via a bridge
stylesheet (`docs/src/styles/tokens.css`).

**Design source of truth is `www/css/style.css`** — `shared/brand-tokens.css` mirrors
those values for the docs build. `www/` is intentionally build-free and does **not**
import the shared file.

### Brand-token sync checklist

When a brand color/shape/font changes, update **both**:
- [ ] `www/css/style.css` (the marketing site)
- [ ] `shared/brand-tokens.css` (consumed by docs)

## Verification

From the repository root:

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
```

The `build` script validates the required static pages, canonical URLs, public
policy contract, Netlify redirects, and local links. Netlify performs no static
asset compilation.

## AI-output-report operations

The public API is POST-only. Production lookup and early deletion require an
authenticated Netlify operator and use only the stable AIR reference as the
record key. Do not use `blobs:get`: it prints or copies the assistant response
outside the dedicated store.

After `netlify login` and linking the production site, look up an exact key
without reading its contents:

```sh
AIR_REFERENCE=AIR-0123456789abcdef0123456789abcdef
netlify blobs:list ai-output-reports --prefix "$AIR_REFERENCE" --json
```

Confirm that the result contains exactly one key equal to `$AIR_REFERENCE`.
Delete only that record, then repeat the same list to prove it is absent:

```sh
netlify blobs:delete ai-output-reports "$AIR_REFERENCE" --force
netlify blobs:list ai-output-reports --prefix "$AIR_REFERENCE" --json
```

The scheduled `purge-ai-output-reports` Function runs daily at `03:15 UTC`.
After each production deployment, verify its Scheduled badge and next run in
Netlify, invoke **Run now**, and retain invocation status plus the count-only
log as production evidence.
