const REPORT_STORE_NAME = "ai-output-reports";
const MAX_RESPONSE_CHARACTERS = 48 * 1024;
const MAX_REQUEST_BYTES = 200 * 1024;
const RETENTION_MILLISECONDS = 89 * 24 * 60 * 60 * 1000;
const REFERENCE_PATTERN = /^AIR-[a-f0-9]{32}$/;
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

function jsonResponse(status, body) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
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

function parseReport(bodyText) {
  if (new TextEncoder().encode(bodyText).byteLength > MAX_REQUEST_BYTES) {
    return null;
  }

  let value;
  try {
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
    assistantResponse.length > MAX_RESPONSE_CHARACTERS ||
    typeof reference !== "string" ||
    !REFERENCE_PATTERN.test(reference) ||
    typeof reportedAt !== "string" ||
    !reportedAt.endsWith("Z") ||
    !Number.isFinite(Date.parse(reportedAt))
  ) {
    return null;
  }

  return {
    category,
    assistantResponse,
    reference,
    reportedAt,
  };
}

function matchesExisting(existing, report) {
  return (
    existing !== null &&
    existing.category === report.category &&
    existing.assistantResponse === report.assistantResponse &&
    existing.reference === report.reference &&
    existing.reportedAt === report.reportedAt
  );
}

async function findExisting(store, report) {
  const existing = await store.get(report.reference, {
    consistency: "strong",
    type: "json",
  });
  if (existing === null) return null;
  return matchesExisting(existing, report) ? existing : false;
}

export function createAiOutputReportHandler({ getReportStore, now = Date.now }) {
  return async function handleAiOutputReport(request) {
    if (request.method !== "POST") {
      return jsonResponse(405, { status: "method_not_allowed" });
    }
    if (
      !(request.headers.get("content-type") ?? "")
        .toLowerCase()
        .startsWith("application/json")
    ) {
      return jsonResponse(415, { status: "unsupported_media_type" });
    }

    const report = parseReport(await request.text());
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
        return acceptedResponse(report.reference, true);
      }

      const receivedAtMilliseconds = now();
      const record = {
        category: report.category,
        assistantResponse: report.assistantResponse,
        reference: report.reference,
        reportedAt: report.reportedAt,
        receivedAt: new Date(receivedAtMilliseconds).toISOString(),
      };
      const expiresAt =
        receivedAtMilliseconds + RETENTION_MILLISECONDS;
      const result = await store.set(
        report.reference,
        JSON.stringify(record),
        {
          onlyIfNew: true,
          metadata: { expiresAt },
        },
      );

      if (!result.modified) {
        const raced = await findExisting(store, report);
        if (raced === false || raced === null) {
          return jsonResponse(409, { status: "reference_conflict" });
        }
        return acceptedResponse(report.reference, true);
      }

      return acceptedResponse(report.reference, false);
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
  const { blobs } = await store.list();
  let deleted = 0;
  for (const blob of blobs) {
    const entry = await store.getMetadata(blob.key, {
      consistency: "strong",
    });
    const expiresAt = entry?.metadata?.expiresAt;
    if (!Number.isFinite(expiresAt) || expiresAt <= now()) {
      await store.delete(blob.key);
      deleted += 1;
    }
  }
  return { scanned: blobs.length, deleted };
}

export function createReportStore(getStore) {
  return () =>
    getStore({
      name: REPORT_STORE_NAME,
      consistency: "strong",
    });
}

export const aiOutputReportContract = Object.freeze({
  maxResponseCharacters: MAX_RESPONSE_CHARACTERS,
  maxRequestBytes: MAX_REQUEST_BYTES,
  retentionMilliseconds: RETENTION_MILLISECONDS,
});
