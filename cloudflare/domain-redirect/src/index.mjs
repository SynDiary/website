const CANONICAL_ORIGIN = "https://www.syndiary.com";

export function canonicalRedirectUrl(requestUrl) {
  const sourceUrl = new URL(requestUrl);
  const targetUrl = new URL(CANONICAL_ORIGIN);

  targetUrl.pathname = sourceUrl.pathname;
  targetUrl.search = sourceUrl.search;

  return targetUrl;
}

export default {
  fetch(request) {
    return Response.redirect(canonicalRedirectUrl(request.url), 301);
  },
};
