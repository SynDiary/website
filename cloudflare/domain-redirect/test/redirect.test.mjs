import assert from "node:assert/strict";
import test from "node:test";

import worker, { canonicalRedirectUrl } from "../src/index.mjs";

test("redirects the root URL to the canonical origin", () => {
  assert.equal(
    canonicalRedirectUrl("https://syndiary.app/").href,
    "https://www.syndiary.com/",
  );
});

test("preserves path and query string", () => {
  assert.equal(
    canonicalRedirectUrl(
      "http://www.syndiary.info/privacy-policy.html?utm_source=domain",
    ).href,
    "https://www.syndiary.com/privacy-policy.html?utm_source=domain",
  );
});

test("returns a permanent server-side redirect", async () => {
  const response = await worker.fetch(
    new Request("https://syndiary.org/download/app?platform=android"),
  );

  assert.equal(response.status, 301);
  assert.equal(
    response.headers.get("location"),
    "https://www.syndiary.com/download/app?platform=android",
  );
});
