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

- **Host:** Netlify (used for its contact-form capture + reCAPTCHA).
- **Publish directory:** `www/` (see root `netlify.toml`).
- Serves `www/app-min-version.json` at `https://www.syndiary.com/app-min-version.json`
  (consumed by the mobile app) and `www/_headers` for cache control.

## docs/ — documentation site

Astro Starlight app. See [`docs/README.md`](docs/README.md) for local development,
build, and deployment details.

- **Host:** Cloudflare Pages.
- **Build settings:** root directory `docs`, build command `npm run build`,
  output directory `dist`, production branch `main`, **Node ≥ 22.12** (`docs/.nvmrc`).
  Config is also declared in `docs/wrangler.toml` (`pages_build_output_dir`).

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
