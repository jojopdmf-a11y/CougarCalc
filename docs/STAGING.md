# Staging preview

This is how Jeffrey sees the latest CougarCalc site **without running anything on the Mac**.

## Bookmark this

**https://cougarcalc-staging.jjstudio2.workers.dev**

Refresh that link after an update. That page **is** the last published staging build.

`cougarcalc.com` DNS stays untouched until you green-light production.

## Loop

1. Ask for a change in the Cursor cloud chat.
2. The agent updates the site and deploys staging (`npm run deploy`).
3. Refresh the URL above.

Staging is `noindex` on purpose. Buy/checkout may be incomplete until Paddle tokens are on the Worker.

## Deploy commands

| Command | Where it goes |
| --- | --- |
| `npm run deploy` | Staging Worker `cougarcalc-staging` on `workers.dev` |
| `npm run deploy:production` | Production Worker `cougarcalc` — **do not use until DNS go-ahead** |
