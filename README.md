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

## Website analytics

Both sites use the existing Umami service at `https://analytics.openadviser.com`.
The `syndiary` team has separate website entries:

| Site | Umami name | Website ID | Allowed hostnames |
| --- | --- | --- | --- |
| Main site | SynDiary (website) | `2922c55d-87e3-464a-a4a5-9837676a4517` | `syndiary.com`, `www.syndiary.com` |
| Docs portal | SynDiary (docs) | `2aa8fed9-f1ef-4e2d-b12d-e63b0c47d653` | `docs.syndiary.com` |

The deferred tracker is included in every public `www/` HTML page and in the
Starlight `head` configuration in `docs/astro.config.mjs`. Website IDs are public
configuration, not credentials. No analytics package or build secret is needed.

`data-domains` excludes localhost and deployment previews. Both trackers respect
Do Not Track and remove URL query strings and fragments, including from referrers.
Only the standard tracker is installed; no recorder, heatmap, user identification,
or form-content tracking is configured. Public disclosures are in the privacy
policy and the docs privacy page.

After publishing, visit one page on each production domain with Do Not Track off
and check that its page view appears in the matching Umami Realtime dashboard.
Both hostnames must use their own website ID. Publishing `main` deploys the main
site through Netlify; the docs portal still requires the Direct Upload steps in
`docs/README.md`.

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

## News and local preview

The marketing site's news section is static HTML, using the existing theme.
The homepage links to `www/news/index.html`; each story has its own directory
with an `index.html`. The first story is `news/welcome-to-syndiary-news/`.
News-specific layouts live in `www/css/news.css`.

To preview without deploying, run from this checkout:

```sh
python3 -m http.server 8801 --bind 127.0.0.1 --directory www
```

Open `http://127.0.0.1:8801/` and follow **News**. The news listing is at
`http://127.0.0.1:8801/news/`. This serves files only on this computer.

For another story, copy the article directory, update its title, content,
date, image, description, canonical URL, and social metadata, then add its
card at the top of the list. Update the homepage card to the latest story.
Add the new page and canonical URL to `requiredPages` in
`scripts/verify-site.mjs`, then run `npm test` and `npm run build`.

The first story was drafted by email on 30 September and is dated 1 October
2026 for publication. The original email copy and image are preserved.
Each new page includes Open Graph and Twitter metadata, image descriptions,
and JSON-LD for the page and its breadcrumbs. Articles also include author,
publisher, publication date, and modification date. Keep visible dates and
metadata consistent. Add each canonical URL to `www/sitemap.xml`; `robots.txt`
advertises this sitemap. Review time-sensitive wording before publication.
