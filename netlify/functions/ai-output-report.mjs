import { getStore } from "@netlify/blobs";

import {
  createAiOutputReportHandler,
  createReportStore,
} from "./_shared/ai-output-report.mjs";

export default createAiOutputReportHandler({
  getReportStore: createReportStore(getStore),
});

export const config = {
  path: "/api/ai-output-reports",
  method: "POST",
  rateLimit: {
    windowLimit: 6,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
