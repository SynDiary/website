# SynDiary alternate-domain redirects

This Cloudflare Worker permanently redirects the apex and `www` hostnames of
the alternate SynDiary domains to the website's final canonical origin,
`https://www.syndiary.com`.

The redirect preserves the request path and query string. Routes are exact so
other subdomains remain available for future services.

## Verify

```sh
node --test test/redirect.test.mjs
wrangler deploy --dry-run
```

## Deploy

```sh
wrangler deploy
```
