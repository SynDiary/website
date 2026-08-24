const REPORT_STORE_NAME = "ai-output-reports";
const MAX_RESPONSE_BYTES = 48 * 1024;
const MAX_REQUEST_BYTES = 200 * 1024;
const RETENTION_MILLISECONDS = 89 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_CLOCK_SKEW_MILLISECONDS = 5 * 60 * 1000;
const REFERENCE_PATTERN = /^AIR-[a-f0-9]{32}$/;
const JSON_MEDIA_TYPE = "application/json";
const ALLOWED_CATEGORIES = new Set([
  "offensive",
  "harmful",
  "misleading",
  "other",
]);
const ALLOWED_FIELDS = new Set([
  "category",
  "assistant_response",
  "report_reference",
  "reported_at",
]);
const textDecoder = new TextDecoder("utf-8", { fatal: true });
const textEncoder = new TextEncoder();

function jsonResponse(status, body, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

function acceptedResponse(reference, duplicate) {
  return jsonResponse(duplicate ? 200 : 201, {
    status: "accepted",
    reference,
    duplicate,
  });
}

function isJsonRequest(request) {
  const mediaType = (request.headers.get("content-type") ?? "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  return mediaType === JSON_MEDIA_TYPE;
}

function isSecureRequest(request) {
  const url = new URL(request.url);
  return (
    url.protocol === "https:" ||
    (url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1"))
  );
}

function isCanonicalUtcTimestamp(value, now) {
  if (typeof value !== "string") return false;
  const milliseconds = Date.parse(value);
  return (
    Number.isFinite(milliseconds) &&
    new Date(milliseconds).toISOString() === value &&
    milliseconds <= now + MAX_FUTURE_CLOCK_SKEW_MILLISECONDS
  );
}

function parseReport(bodyBytes, now) {
  if (bodyBytes.byteLength > MAX_REQUEST_BYTES) {
    return null;
  }

  let bodyText;
  let value;
  try {
    bodyText = textDecoder.decode(bodyBytes);
    value = JSON.parse(bodyText);
  } catch {
    return null;
  }

  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !ALLOWED_FIELDS.has(key)) ||
    Object.keys(value).length !== ALLOWED_FIELDS.size
  ) {
    return null;
  }

  const category = value.category;
  const assistantResponse = value.assistant_response;
  const reference = value.report_reference;
  const reportedAt = value.reported_at;
  if (
    typeof category !== "string" ||
    !ALLOWED_CATEGORIES.has(category) ||
    typeof assistantResponse !== "string" ||
    assistantResponse.trim().length === 0 ||
    textEncoder.encode(assistantResponse).byteLength > MAX_RESPONSE_BYTES ||
    typeof reference !== "string" ||
    !REFERENCE_PATTERN.test(reference) ||
    !isCanonicalUtcTimestamp(reportedAt, now)
  ) {
    return null;
  }

  return {
    category,
    assistant_response: assistantResponse,
    report_reference: reference,
    reported_at: reportedAt,
  };
}

function matchesExisting(existing, report) {
  return (
    existing !== null &&
    existing.category === report.category &&
    existing.assistant_response === report.assistant_response &&
    existing.report_reference === report.report_reference &&
    existing.reported_at === report.reported_at
  );
}

async function findExisting(store, report) {
  const existing = await store.get(report.report_reference, {
    consistency: "strong",
    type: "json",
  });
  if (existing === null) return null;
  return matchesExisting(existing, report) ? existing : false;
}

export function createAiOutputReportHandler({ getReportStore, now = Date.now }) {
  return async function handleAiOutputReport(request) {
    if (request.method !== "POST") {
      return jsonResponse(
        405,
        { status: "method_not_allowed" },
        { allow: "POST" },
      );
    }
    if (!isSecureRequest(request)) {
      return jsonResponse(426, { status: "https_required" });
    }
    if (!isJsonRequest(request)) {
      return jsonResponse(415, { status: "unsupported_media_type" });
    }

    const declaredLength = request.headers.get("content-length");
    if (declaredLength !== null) {
      const parsedLength = Number(declaredLength);
      if (
        !Number.isSafeInteger(parsedLength) ||
        parsedLength < 0 ||
        parsedLength > MAX_REQUEST_BYTES
      ) {
        return jsonResponse(413, { status: "payload_too_large" });
      }
    }

    const bodyBytes = new Uint8Array(await request.arrayBuffer());
    if (bodyBytes.byteLength > MAX_REQUEST_BYTES) {
      return jsonResponse(413, { status: "payload_too_large" });
    }
    const receivedAtMilliseconds = now();
    const report = parseReport(bodyBytes, receivedAtMilliseconds);
    if (report === null) {
      return jsonResponse(400, { status: "invalid_report" });
    }

    try {
      const store = getReportStore();
      const existing = await findExisting(store, report);
      if (existing === false) {
        return jsonResponse(409, { status: "reference_conflict" });
      }
      if (existing !== null) {
        return acceptedResponse(report.report_reference, true);
      }

      const receivedAt = new Date(receivedAtMilliseconds).toISOString();
      const expiresAt = receivedAtMilliseconds + RETENTION_MILLISECONDS;
      const result = await store.set(
        report.report_reference,
        JSON.stringify(report),
        {
          onlyIfNew: true,
          metadata: { expiresAt, receivedAt },
        },
      );

      if (!result.modified) {
        const raced = await findExisting(store, report);
        if (raced === false || raced === null) {
          return jsonResponse(409, { status: "reference_conflict" });
        }
        return acceptedResponse(report.report_reference, true);
      }

      return acceptedResponse(report.report_reference, false);
    } catch {
      return jsonResponse(503, { status: "temporarily_unavailable" });
    }
  };
}

export async function purgeExpiredAiOutputReports({
  getReportStore,
  now = Date.now,
}) {
  const store = getReportStore();
  const purgeAt = now();
  let deleted = 0;
  let scanned = 0;
  for await (const page of store.list({ paginate: true })) {
    scanned += page.blobs.length;
    for (const blob of page.blobs) {
      const entry = await store.getMetadata(blob.key, {
        consistency: "strong",
      });
      const expiresAt = entry?.metadata?.expiresAt;
      if (!Number.isFinite(expiresAt) || expiresAt <= purgeAt) {
        await store.delete(blob.key);
        deleted += 1;
      }
    }
  }
  return { scanned, deleted };
}

export function createReportStore(getStore) {
  return () =>
    getStore({
      name: REPORT_STORE_NAME,
      consistency: "strong",
    });
}

export const aiOutputReportContract = Object.freeze({
  allowedCategories: Object.freeze([...ALLOWED_CATEGORIES]),
  maxFutureClockSkewMilliseconds: MAX_FUTURE_CLOCK_SKEW_MILLISECONDS,
  maxRequestBytes: MAX_REQUEST_BYTES,
  maxResponseBytes: MAX_RESPONSE_BYTES,
  referencePattern: REFERENCE_PATTERN,
  reportStoreName: REPORT_STORE_NAME,
  retentionMilliseconds: RETENTION_MILLISECONDS,
});
