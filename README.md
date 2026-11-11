# Wakie Wakie's — website

Thai Asian fusion breakfast & smoothie · 652 Main St, Westbrook, ME. Built by [Real Easy Sites](https://getrealeasysites.com).

Node 20 + Express + SQLite. Online ordering links to the existing Square page (wakiewakies.square.site).

- `data/menu.json` — the full menu (pulled from Square, Nov 2026). Edit this to change items/prices.
- `public/js/main.js` — `PHOTOS` maps photo slots/dishes to images in `public/img`; `HOURS` sets hours + the live "open now" badge.
- `/admin` — password-only dashboard for contact/group-order messages (status + delete).

## Render env vars
| Var | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Dashboard password (login disabled until set) |
| `SESSION_SECRET` | Optional cookie signing secret |
| `NOTIFY_EMAIL` + `SMTP_HOST/PORT/USER/PASS` | Optional email alert per message |
| `DATA_DIR` | Where the SQLite file lives (use a persistent disk) |
