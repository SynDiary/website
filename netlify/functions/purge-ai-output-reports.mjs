import { getStore } from "@netlify/blobs";

import {
  createReportStore,
  purgeExpiredAiOutputReports,
} from "./_shared/ai-output-report.mjs";

export default async function purgeAiOutputReports() {
  const result = await purgeExpiredAiOutputReports({
    getReportStore: createReportStore(getStore),
  });
  console.log(
    `AI output report retention: scanned ${result.scanned}, deleted ${result.deleted}`,
  );
  return new Response(null, { status: 204 });
}

export const config = {
  schedule: "15 3 * * *",
};
