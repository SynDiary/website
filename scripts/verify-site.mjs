import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publishDirectory = path.join(repositoryRoot, "www");
const requiredPages = new Map([
  ["index.html", "https://www.syndiary.com/"],
  ["privacy-policy.html", "https://www.syndiary.com/privacy-policy.html"],
  ["terms-of-service.html", "https://www.syndiary.com/terms-of-service.html"],
  ["support.html", "https://www.syndiary.com/support"],
  ["news/index.html", "https://www.syndiary.com/news/"],
  ["news/we-can-download-our-data-but-can-we-actually-use-it/index.html", "https://www.syndiary.com/news/we-can-download-our-data-but-can-we-actually-use-it/"],
  ["news/welcome-to-syndiary-news/index.html", "https://www.syndiary.com/news/welcome-to-syndiary-news/"],
]);

const pageEntries = await Promise.all(
  [...requiredPages].map(async ([file, canonical]) => {
    const html = await readFile(path.join(publishDirectory, file), "utf8");
    return [file, canonical, html];
  }),
);

for (const [file, canonical, html] of pageEntries) {
  assert.match(html, /<html\s+lang="en"/i, `${file}: missing language`);
  assert.match(
    html,
    /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1(?:\.0)?"/i,
    `${file}: missing responsive viewport`,
  );
  assert.ok(
    html.includes(`<link rel="canonical" href="${canonical}">`),
    `${file}: canonical URL must be ${canonical}`,
  );
  assert.equal(
    (html.match(/<h1(?:\s|>)/gi) ?? []).length,
    1,
    `${file}: expected exactly one h1`,
  );
}

// News metadata must stay consistent with visible content and canonical URLs.
const newsPages = pageEntries.filter(([file]) => file.startsWith("news/"));
const sitemap = await readFile(path.join(publishDirectory, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.deepEqual(new Set(sitemapUrls), new Set(requiredPages.values()), "sitemap must list every canonical page exactly once");
assert.equal(sitemapUrls.length, requiredPages.size, "sitemap has duplicate URLs");
const robots = await readFile(path.join(publishDirectory, "robots.txt"), "utf8");
assert.match(robots, /^Sitemap: https:\/\/www\.syndiary\.com\/sitemap\.xml$/m);
assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, "public pages must be crawlable");

for (const [file, canonical, html] of newsPages) {
  const metadata = new Map();
  for (const match of html.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)">/g)) {
    assert.ok(!metadata.has(match[1]), `${file}: duplicate ${match[1]}`);
    metadata.set(match[1], match[2]);
  }
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title, `${file}: missing page title`);
  assert.equal(metadata.get("og:title"), title);
  assert.equal(metadata.get("twitter:title"), title);
  assert.ok(metadata.get("description"), `${file}: missing description`);
  assert.equal(metadata.get("og:description"), metadata.get("description"));
  assert.equal(metadata.get("twitter:description"), metadata.get("description"));
  assert.equal(metadata.get("og:url"), canonical);
  assert.equal(metadata.get("twitter:url"), canonical);
  assert.equal(metadata.get("twitter:card"), "summary_large_image");
  assert.equal(metadata.get("robots"), "index, follow, max-image-preview:large");
  for (const key of ["og:locale", "og:site_name", "og:image:alt", "twitter:image:alt", "author"]) {
    assert.ok(metadata.get(key), `${file}: missing ${key}`);
  }
  const imageUrl = new URL(metadata.get("og:image"));
  assert.equal(imageUrl.origin, new URL(canonical).origin);
  assert.equal(metadata.get("twitter:image"), imageUrl.href);
  const imageBytes = await readFile(path.join(publishDirectory, imageUrl.pathname));
  assert.equal(imageBytes.subarray(1, 4).toString(), "PNG");
  assert.equal(metadata.get("og:image:type"), "image/png");
  assert.equal(Number(metadata.get("og:image:width")), imageBytes.readUInt32BE(16));
  assert.equal(Number(metadata.get("og:image:height")), imageBytes.readUInt32BE(20));

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, `${file}: expected one structured-data graph`);
  const schema = JSON.parse(scripts[0][1]);
  assert.equal(schema["@context"], "https://schema.org");
  const article = file !== "news/index.html";
  const entity = schema["@graph"].find((node) => node["@type"] === (article ? "NewsArticle" : "CollectionPage"));
  assert.ok(entity, `${file}: missing page schema`);
  assert.equal(entity.url, canonical);
  assert.equal(entity.description, metadata.get("description"));
  assert.equal(entity.inLanguage, "en");
  const breadcrumb = schema["@graph"].find((node) => node["@type"] === "BreadcrumbList");
  assert.equal(breadcrumb.itemListElement.at(-1).item, canonical);
  assert.deepEqual(breadcrumb.itemListElement.map((item) => item.position), breadcrumb.itemListElement.map((_, index) => index + 1));
  if (article) {
    const headline = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<br\s*\/?\s*>/g, " ").replace(/<[^>]+>/g, "").trim();
    assert.equal(entity.headline, headline);
    assert.equal(entity.image.url, imageUrl.href);
    assert.equal(entity.author.name, metadata.get("author"));
    assert.equal(entity.author.url, metadata.get("article:author"));
    assert.ok(schema["@graph"].some((node) => node["@id"] === entity.publisher["@id"]), "publisher reference must resolve");
    assert.equal(entity.datePublished, metadata.get("article:published_time"));
    assert.equal(entity.dateModified, metadata.get("article:modified_time"));
    assert.ok(Number.isFinite(Date.parse(entity.datePublished)));
    assert.ok(Date.parse(entity.dateModified) >= Date.parse(entity.datePublished));
    assert.ok(html.includes(`datetime="${entity.datePublished.slice(0, 10)}"`), "visible publication date must match schema");
    assert.equal(entity.mainEntityOfPage["@id"], canonical);
  } else {
    assert.equal(entity.mainEntity.numberOfItems, entity.mainEntity.itemListElement.length);
    for (const item of entity.mainEntity.itemListElement) {
      assert.ok(sitemapUrls.includes(item.url), "listed articles must appear in sitemap");
    }
  }
}

const allHtml = pageEntries.map(([, , html]) => html).join("\n");
const requiredPolicyFacts = [
  "free",
  "accountless",
  "local-first",
  "no ads or tracking",
  "SynDiary operates no backend that stores or syncs the personal data you keep in the app",
  "Nothing is uploaded automatically",
  "Optional BYOK cloud AI is off by default",
  "exact assistant response shown in the confirmation preview",
  "one allowed report category",
  "stable random <code>AIR-…</code> report reference",
  "client submission time",
  "prompt, conversation history, app AI memories, API key, email, account, device identifier, or location",
  "GDPR Article 6(1)(a)",
  "Article 9(2)(a)",
  "89 days after server receipt",
  "info@syndiary.com",
  "aged 13 and over",
];
for (const fact of requiredPolicyFacts) {
  assert.ok(allHtml.includes(fact), `missing required public fact: ${fact}`);
}

assert.ok(
  pageEntries
    .find(([file]) => file === "index.html")[2]
    .includes(
      "Take control of your digital life. Consolidate your scattered data from social media, calendars, and more into a secure, personal hub. Unlock personal insights with reports and AI-powered analysis, all while keeping your data local-first, private and safe.",
    ),
  "homepage hero description must match the approved copy",
);
assert.ok(allHtml.includes("Your Personal Data Hub"), "homepage must position SynDiary as a personal data hub");
assert.ok(allHtml.includes("calendar access is used for events you choose to import locally"), "calendar import must be described as available");

// Editorial discussions may mention health apps without claiming SynDiary imports them.
const productHtml = pageEntries.filter(([file]) => !file.startsWith("news/")).map(([, , html]) => html).join("\n");
assert.doesNotMatch(productHtml, /health apps/i, "product pages must not claim health-app support");

const forbiddenClaims = [
  /monetize (?:it|your data)/i,
  /premium (?:upgrade|support)/i,
  /desktop (?:app|release|version)/i,
  /SynDiary (?:cloud |server )?sync/i,
  /automatic analytics/i,
  /data monetization/i,
  /support for additional platforms is coming soon/i,
  /\bdiary(?:-data)?\b/i,
  /\bjournal(?:ing)?\b/i,
];
for (const pattern of forbiddenClaims) {
  assert.doesNotMatch(allHtml, pattern, `unsupported claim matched ${pattern}`);
}
assert.match(allHtml, /data-netlify-recaptcha="true"/i);
assert.match(allHtml, /<form\s+name="contact"/i);

const lockedAssets = new Map([
  ["css/style.css", "e4168a1b9415f90c1ef325f9076966dff82b8fce2249db8c007d04e80bb27bd7"],
  ["js/script.js", "438b9f2d181c3ef41702207fff4cc594a75f66545a7b9d24a715c702dca3fc2b"],
]);
for (const [file, expectedHash] of lockedAssets) {
  const contents = await readFile(path.join(publishDirectory, file));
  const actualHash = createHash("sha256").update(contents).digest("hex");
  assert.equal(
    actualHash,
    expectedHash,
    `${file}: production layout asset changed from commit 41a6709`,
  );
}

const redirects = await readFile(
  path.join(publishDirectory, "_redirects"),
  "utf8",
);
const netlifyConfig = await readFile(
  path.join(repositoryRoot, "netlify.toml"),
  "utf8",
);
assert.match(
  netlifyConfig,
  /ignore = "test \\"\$CONTEXT\\" != \\"production\\" &&/,
  "Netlify production deploys must bypass the cached-ref ignore optimization",
);
assert.match(
  redirects,
  /^\/privacy\s+\/privacy-policy\.html\s+301!\s*$/m,
  "/privacy must be a forced permanent redirect",
);
assert.match(
  redirects,
  /^\/support\s+\/support\.html\s+200\s*$/m,
  "/support must rewrite to the public support page",
);

const idsByPage = new Map(
  pageEntries.map(([file, , html]) => [
    file,
    new Set(
      [...html.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]),
    ),
  ]),
);
const redirectTargets = new Map([
  ["support", "support.html"],
  ["/support", "support.html"],
  ["/privacy", "privacy-policy.html"],
]);

for (const [sourceFile, , html] of pageEntries) {
  const links = [
    ...html.matchAll(/\s(?:href|src)="([^"]+)"/gi),
  ].map((match) => match[1]);
  for (const link of links) {
    if (
      /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(link) ||
      link === "#"
    ) {
      continue;
    }
    if (link.startsWith("#")) {
      assert.ok(
        idsByPage.get(sourceFile).has(link.slice(1)),
        `${sourceFile}: missing fragment target ${link}`,
      );
      continue;
    }

    const [relativeTarget, fragment] = link.split("#", 2);
    const redirectedTarget = redirectTargets.get(relativeTarget);
    const resolvedTarget =
      redirectedTarget ??
      path.relative(
        publishDirectory,
        path.resolve(
          publishDirectory,
          path.dirname(sourceFile),
          relativeTarget,
        ),
      );
    const fileTarget =
      resolvedTarget.endsWith("/") || resolvedTarget === ""
        ? path.join(resolvedTarget, "index.html")
        : resolvedTarget;
    await stat(path.join(publishDirectory, fileTarget));
    if (fragment) {
      const targetHtml =
        pageEntries.find(([file]) => file === fileTarget)?.[2] ??
        (await readFile(path.join(publishDirectory, fileTarget), "utf8"));
      assert.match(
        targetHtml,
        new RegExp(`\\sid="${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
        `${sourceFile}: missing target ${link}`,
      );
    }
  }
}

console.log(
  `Verified ${requiredPages.size} required pages, news metadata and structured data, sitemap, policy facts, production layout assets, redirects, and local links.`,
);
