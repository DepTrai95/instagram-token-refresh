## Instagram Token Refresh (Cloudflare Worker)

Small Cloudflare Worker + cron job that refreshes an Instagram long‑lived access token (which otherwise expires after ~60 days) and optionally sends notifications via Postmark.

### What this project does

- **Refresh Instagram token**: Calls the Instagram Graph API `refresh_access_token` endpoint on a schedule.
- **Runs on Cloudflare Workers**: No server to manage; deployed with `wrangler`.
- **Optional email notifications**: Uses Postmark to email when the token was refreshed successfully or when an error occurs.

---

### Prerequisites

- **Node.js**: v18 or newer installed locally.
- **npm** (or another Node package manager).
- **Cloudflare account** with Workers enabled.
- **Instagram long‑lived access token** (from the Instagram Graph API).
- **Postmark account** (only if you want email notifications).

---

### Project structure

Repo layout:

- **`instagram-token-refresh/`** – the Worker project (contains `wrangler.jsonc`, `src/index.js`, `package.json`, etc.).
- Root of the repo – can contain local-only files like `.dev.vars` (not committed).

Unless otherwise noted, run commands from inside:

```bash
cd instagram-token-refresh/instagram-token-refresh
```

---

### Environment variables

The Worker uses the following variables (both locally and in Cloudflare):

- **`INSTAGRAM_TOKEN`**: Your Instagram long‑lived access token.
- **`POSTMARK_API_KEY`**: Postmark server API token (used to send email).
- **`POSTMARK_EMAIL`**: Email address used as both `From` and `To` for notifications.

#### Local development (`.dev.vars`)

Wrangler automatically loads environment variables from a `.dev.vars` file located in the same folder as `wrangler.jsonc` when running `wrangler dev`.

Create `instagram-token-refresh/instagram-token-refresh/.dev.vars` with contents like:

```dotenv
INSTAGRAM_TOKEN=YOUR_INSTAGRAM_LONG_LIVED_TOKEN
POSTMARK_API_KEY=YOUR_POSTMARK_SERVER_TOKEN
POSTMARK_EMAIL=you@example.com
```

> **Important**: Do **not** commit `.dev.vars` to git. It should already be ignored by `.gitignore`, but double‑check before pushing.

#### Cloudflare production variables

In production, these variables must be configured for the Worker in Cloudflare:

- Go to **Cloudflare Dashboard → Workers & Pages → Your Worker → Settings → Variables**.
- Add the three variables:
  - `INSTAGRAM_TOKEN`
  - `POSTMARK_API_KEY`
  - `POSTMARK_EMAIL`

Alternatively, you can set them via the Wrangler CLI (for the currently selected environment/worker):

```bash
cd instagram-token-refresh/instagram-token-refresh
wrangler secret put INSTAGRAM_TOKEN
wrangler secret put POSTMARK_API_KEY
wrangler secret put POSTMARK_EMAIL
```

Wrangler will prompt you to paste each value.

---

### Cron schedule

The schedule is defined in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": ["0 3 1 * *"]
}
```

This means:

- **At 03:00 UTC on the 1st day of every month**.

To change how often the token is refreshed, edit the `crons` expression(s) in `wrangler.jsonc` and re‑deploy.

---

### Local development

1. **Clone the repo**

   ```bash
   git clone <this-repo-url>
   cd instagram-token-refresh/instagram-token-refresh
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.dev.vars`**

   As described above, create `.dev.vars` next to `wrangler.jsonc` and fill in your values.

4. **Run the Worker locally**

   ```bash
   npm run dev
   ```

   This starts `wrangler dev` and serves the Worker (by default at `http://localhost:8787/`).

   - The scheduled handler can be triggered via the Cloudflare dashboard or via `wrangler`’s scheduled event simulation (see the Wrangler docs).

---

### Deploying to Cloudflare

1. **Log in to Cloudflare with Wrangler (once per machine)**

   ```bash
   npx wrangler login
   ```

2. **Ensure production variables are set**

   - Either via the Cloudflare dashboard (recommended).
   - Or via `wrangler secret put` as shown above.

3. **Deploy the Worker**

   From inside `instagram-token-refresh/instagram-token-refresh`:

   ```bash
   npm run deploy
   ```

   Wrangler will:

   - Upload the Worker code.
   - Apply/update the cron schedule from `wrangler.jsonc`.

4. **Verify the Worker**

   - In the Cloudflare dashboard, open the Worker and check:
     - **Triggers → Cron Triggers**: The schedule should match your `wrangler.jsonc`.
     - **Logs / Observability**: Confirm the scheduled runs and token refresh logs.

---

### Notes & tips

- **Testing without waiting for cron**:
  - You can temporarily change the cron expression in `wrangler.jsonc` to run more frequently (e.g. every 5 minutes) for testing, then change it back to monthly and redeploy.
- **Email notifications optional**:
  - If you do not want emails, simply omit `POSTMARK_API_KEY` and `POSTMARK_EMAIL`. The Worker will skip sending notifications.
- **Security**:
  - Never commit your real tokens or `.dev.vars` file.
  - If secrets were ever committed, rotate them in Instagram and Postmark immediately.

