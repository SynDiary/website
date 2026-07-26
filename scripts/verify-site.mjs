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

const allHtml = pageEntries.map(([, , html]) => html).join("\n");
const requiredPolicyFacts = [
  "free",
  "accountless",
  "local-first",
  "no ads or tracking",
  "SynDiary operates no diary-data storage or sync backend",
  "Nothing is uploaded automatically",
  "Optional BYOK cloud AI is off by default",
  "exact assistant response shown in the confirmation preview",
  "one allowed report category",
  "stable random <code>AIR-…</code> report reference",
  "client submission time",
  "prompt, conversation history, diary memories, API key, email, account, device identifier, or location",
  "GDPR Article 6(1)(a)",
  "Article 9(2)(a)",
  "at most 89 days",
  "info@syndiary.com",
  "aged 13 and over",
];
for (const fact of requiredPolicyFacts) {
  assert.ok(allHtml.includes(fact), `missing required public fact: ${fact}`);
}

const forbiddenClaims = [
  /health apps/i,
  /monetize (?:it|your data)/i,
  /premium (?:upgrade|support)/i,
  /desktop (?:app|release|version)/i,
  /SynDiary (?:cloud |server )?sync/i,
  /automatic analytics/i,
  /data monetization/i,
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
  `Verified ${requiredPages.size} required pages, policy facts, production layout assets, redirects, and local links.`,
);
