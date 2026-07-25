// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { fileURLToPath } from 'node:url';

// Allow Vite's dev server to read the monorepo /shared token file that
// src/styles/tokens.css @imports from outside the docs/ root. Absolute paths
// (not '.') so the allowlist doesn't depend on the process working directory.
const docsRoot = fileURLToPath(new URL('./', import.meta.url));
const sharedRoot = fileURLToPath(new URL('../shared/', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.syndiary.com',
  // House style is straight apostrophes/quotes; stop SmartyPants from
  // converting them to curly ones at build time.
  markdown: { smartypants: false },
  vite: {
    server: { fs: { allow: [docsRoot, sharedRoot] } },
  },
  integrations: [
    starlight({
      title: 'SynDiary Help',
      // Wordmark logo replaces the title text; the "Help" pill is added by the
      // SiteTitle override so the header reads "SynDiary · Help".
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: true,
        // Empty alt: Starlight still renders an sr-only "SynDiary Help" title span
        // that names the home link, so a non-empty alt would double the announce.
        alt: '',
      },
      // Pinwheel mark (logo cropped to its square glyph).
      favicon: '/favicon.svg',
      // English at the site root; future translations live under /<lang>/ prefixes.
      locales: {
        root: { label: 'English', lang: 'en' },
      },
      // Explicit order. Flat links for now; each becomes a group as it grows.
      // "Developers" is intentionally absent until a public integration surface exists.
      sidebar: [
        { label: 'Start here', slug: 'start-here' },
        { label: 'Using SynDiary', slug: 'using-syndiary' },
        {
          label: 'Managing your data',
          items: [
            { label: 'Overview', slug: 'managing-your-data' },
            { label: 'Download Facebook & Instagram data', slug: 'managing-your-data/download-facebook-instagram' },
          ],
        },
        { label: 'Privacy, security & permissions', slug: 'privacy-security-permissions' },
        { label: 'Troubleshooting & support', slug: 'troubleshooting' },
        { label: 'Release notes', slug: 'release-notes' },
      ],
      head: [
        // Light-only: hint native controls before CSS loads (ThemeProvider
        // override also locks data-theme=light synchronously).
        { tag: 'meta', attrs: { name: 'color-scheme', content: 'light' } },
        // Brand color for mobile browser chrome.
        { tag: 'meta', attrs: { name: 'theme-color', content: '#f14f00' } },
      ],
      // Brand-shell overrides. Leaf components, plus a wrap-don't-fork
      // PageFrame (renders the default frame, appends the full-width footer).
      // Header/TwoColumnContent/Sidebar internals stay Starlight's.
      components: {
        PageFrame: './src/components/PageFrame.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        SocialIcons: './src/components/SocialIcons.astro',
        PageTitle: './src/components/PageTitle.astro',
        Footer: './src/components/Footer.astro',
        MobileMenuFooter: './src/components/MobileMenuFooter.astro',
      },
      customCss: [
        './src/styles/tokens.css',
        './src/styles/fonts.css',
        './src/styles/brand.css',
      ],
    }),
  ],
});
