# Staging preview

This is how Jeffrey sees the latest CougarCalc site **without running anything on the Mac**.

## Loop

1. Ask for a change in the Cursor cloud chat.
2. The agent updates the site and deploys staging (`npm run deploy`).
3. Refresh the staging URL in Safari or Chrome. That page **is** the last update.

`cougarcalc.com` DNS stays untouched until you green-light production.

## Staging URL

After the first successful deploy, the live address is:

`https://cougarcalc-staging.<account>.workers.dev`

(The exact URL is written here once deploy finishes.)

Staging is `noindex` on purpose. Buy/checkout may be incomplete until Paddle tokens are on the Worker.

## Deploy commands

| Command | Where it goes |
| --- | --- |
| `npm run deploy` | Staging Worker `cougarcalc-staging` on `workers.dev` |
| `npm run deploy:production` | Production Worker `cougarcalc` — **do not use until DNS go-ahead** |

First-time Cloudflare auth (once, then saved as a Cursor secret for later chats):

- `CLOUDFLARE_API_TOKEN` — token with Workers deploy permission
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account that already hosts MemoryMap, if you want them together
