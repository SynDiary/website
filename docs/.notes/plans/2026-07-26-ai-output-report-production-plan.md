# Production website and AI-output-report plan

## Architecture

Keep the marketing and legal site on its established Netlify project. Keep the
existing `POST /api/ai-output-reports` Netlify Function as the only public
report API and the existing `ai-output-reports` Netlify Blobs store as the
dedicated namespace. Do not add public lookup or deletion methods: possession
of a receipt reference should not by itself grant anonymous deletion access.
Operators use authenticated Netlify Blobs commands, with the AIR reference as
the sole record key, to prove existence or delete a report without printing the
stored assistant response.

The handler accepts exactly four JSON fields over HTTPS. It validates the
allowed category, a 128-bit lowercase hexadecimal `AIR-` reference, a canonical
UTC client timestamp, the exact UTF-8 request size, and the exact UTF-8 response
size. Atomic create-if-absent storage makes identical retries idempotent and
prevents a reused reference from overwriting different content. The blob value
contains only the four submitted fields. Server receipt and expiry timestamps
live in blob metadata; request headers, IP addresses, credentials, and rejected
fields are neither logged by application code nor persisted.

## Retention and administration

The scheduled purge runs daily at `03:15 UTC`. Each accepted report receives an
expiry exactly 89 days after server receipt. The purge deletes expired entries
and fail-closed malformed legacy entries that have no numeric expiry. It logs
counts only, never report references or contents.

Lookup uses an authenticated exact-prefix list in the dedicated store and
checks for one exact AIR key. Deletion targets that exact key. A second lookup
proves absence. This avoids downloading or copying report content outside the
dedicated store.

## Public surfaces

Preserve the production layout, styling, imagery, and interactions from website
commit `41a6709`. Change only copy, metadata, and legal/support links needed to
state the current product contract. Keep the existing homepage contact form and
reCAPTCHA flow and disclose it separately from the app's no-ads/no-tracking
contract. Build the new Support page from the same legal-page markup and CSS
classes. Keep `/support` as a clean rewrite to the static support page and force
`/privacy` to return a permanent redirect to the canonical Privacy Policy.

## Error handling and verification

Malformed schema, category, reference, timestamps, encoding, and body size
receive narrow JSON errors. Reused references with different content receive a
conflict. Storage failures return a generic temporary-unavailability response
without logging payload data.

Before deployment, run unit and contract tests, the static build/verification
script, production dependency audit, Netlify function bundling, external link
checks, and rendered desktop/mobile accessibility checks. After explicit owner
approval, deploy through the connected Netlify workflow and record required
page status, redirect, synthetic submit/retry, authenticated exact-key lookup,
deletion, post-delete absence, scheduled-function configuration, and a
successful production purge invocation.
