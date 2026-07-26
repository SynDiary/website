import assert from "node:assert/strict";
import test from "node:test";

import {
  aiOutputReportContract,
  createAiOutputReportHandler,
  purgeExpiredAiOutputReports,
} from "./ai-output-report.mjs";
import { config as routeConfig } from "../ai-output-report.mjs";

const reference = "AIR-0123456789abcdef0123456789abcdef";
const endpoint = "https://www.syndiary.com/api/ai-output-reports";

test("dedicated route applies the server-side per-IP rate limit", () => {
  assert.deepEqual(routeConfig, {
    path: "/api/ai-output-reports",
    method: "POST",
    rateLimit: {
      windowLimit: 6,
      windowSize: 60,
      aggregateBy: ["ip", "domain"],
    },
  });
});

function validBody(overrides = {}) {
  return {
    category: "harmful",
    assistant_response: "Synthetic assistant response.",
    report_reference: reference,
    reported_at: "2026-07-26T12:00:00.000Z",
    ...overrides,
  };
}

function request(body, options = {}) {
  return new Request(endpoint, {
    method: options.method ?? "POST",
    headers: {
      "content-type": options.contentType ?? "application/json",
    },
    body: options.method === "GET" ? undefined : JSON.stringify(body),
  });
}

class MemoryStore {
  values = new Map();
  metadata = new Map();

  async get(key) {
    const value = this.values.get(key);
    return value === undefined ? null : JSON.parse(value);
  }

  async set(key, value, options) {
    if (options.onlyIfNew && this.values.has(key)) {
      return { modified: false };
    }
    this.values.set(key, value);
    this.metadata.set(key, options.metadata);
    return { modified: true, etag: `"${key}"` };
  }

  async list() {
    return {
      blobs: [...this.values.keys()].map((key) => ({
        key,
        etag: `"${key}"`,
      })),
      directories: [],
    };
  }

  async getMetadata(key) {
    if (!this.values.has(key)) return null;
    return {
      etag: `"${key}"`,
      metadata: this.metadata.get(key) ?? {},
    };
  }

  async delete(key) {
    this.values.delete(key);
    this.metadata.delete(key);
  }
}

test("stores a bounded report and returns an exact acceptance receipt", async () => {
  const store = new MemoryStore();
  const now = Date.UTC(2026, 6, 26, 12);
  const handler = createAiOutputReportHandler({
    getReportStore: () => store,
    now: () => now,
  });

  const response = await handler(request(validBody()));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    status: "accepted",
    reference,
    duplicate: false,
  });
  assert.deepEqual(await store.get(reference), {
    category: "harmful",
    assistantResponse: "Synthetic assistant response.",
    reference,
    reportedAt: "2026-07-26T12:00:00.000Z",
    receivedAt: "2026-07-26T12:00:00.000Z",
  });
  assert.equal(
    store.metadata.get(reference).expiresAt,
    now + aiOutputReportContract.retentionMilliseconds,
  );
});

test("same reference and payload is idempotent", async () => {
  const store = new MemoryStore();
  const handler = createAiOutputReportHandler({
    getReportStore: () => store,
  });

  assert.equal((await handler(request(validBody()))).status, 201);
  const retry = await handler(request(validBody()));
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).duplicate, true);
  assert.equal(store.values.size, 1);
});

test("same reference cannot overwrite different content", async () => {
  const store = new MemoryStore();
  const handler = createAiOutputReportHandler({
    getReportStore: () => store,
  });

  await handler(request(validBody()));
  const conflict = await handler(
    request(validBody({ assistant_response: "Different response." })),
  );
  assert.equal(conflict.status, 409);
  assert.equal(
    (await store.get(reference)).assistantResponse,
    "Synthetic assistant response.",
  );
});

test("rejects malformed, unbounded, and unexpected input", async () => {
  const store = new MemoryStore();
  const handler = createAiOutputReportHandler({
    getReportStore: () => store,
  });
  const cases = [
    validBody({ category: "not-a-category" }),
    validBody({ assistant_response: "x".repeat(48 * 1024 + 1) }),
    validBody({ report_reference: "AIR-guessable" }),
    { ...validBody(), prompt: "must not be accepted" },
  ];

  for (const body of cases) {
    assert.equal((await handler(request(body))).status, 400);
  }
  assert.equal(store.values.size, 0);
  assert.equal(
    (
      await handler(
        request(validBody(), { contentType: "application/x-www-form-urlencoded" }),
      )
    ).status,
    415,
  );
  assert.equal(
    (await handler(request(validBody(), { method: "GET" }))).status,
    405,
  );
});

test("scheduled retention deletes expired and malformed entries", async () => {
  const store = new MemoryStore();
  const now = Date.UTC(2026, 6, 26, 12);
  await store.set("expired", "{}", {
    metadata: { expiresAt: now - 1 },
  });
  await store.set("active", "{}", {
    metadata: { expiresAt: now + 1 },
  });
  await store.set("missing-expiry", "{}", { metadata: {} });

  const result = await purgeExpiredAiOutputReports({
    getReportStore: () => store,
    now: () => now,
  });

  assert.deepEqual(result, { scanned: 3, deleted: 2 });
  assert.deepEqual([...store.values.keys()], ["active"]);
});
