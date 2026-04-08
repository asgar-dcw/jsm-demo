# Deploy DCW Schedule Manager on Vercel

This app is a **Vite + React** static site with a **Node serverless** route at `GET /api/jira/search` that proxies Jira Cloud using your API token (kept on the server).

## What gets deployed

| Piece | Role |
|--------|------|
| `npm run build` | Produces static assets in `dist/`. |
| `vercel.json` | Vite output, SPA fallback to `index.html`, API route config. |
| `api/jira/search.ts` | Serverless handler — same logic as dev middleware in `vite.config.ts`. |

Client code calls **relative** URLs: `fetch('/api/jira/search')`, so no CORS setup is needed when the UI and API share the same Vercel deployment.

## One-time setup

1. Push this project to GitHub/GitLab/Bitbucket (or use Vercel CLI).
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. **Root Directory**: If the repo root is this folder (`schedule-mate-main`), leave default. If the app lives in a subfolder, set that subfolder as the root.
4. **Framework Preset**: Vite (should auto-detect). Build: `npm run build`, Output: `dist`.
5. **Environment variables** (Project → Settings → Environment Variables):

   | Name | Environment | Notes |
   |------|-------------|--------|
   | `JIRA_BASE_URL` | Production, Preview | `https://your-site.atlassian.net` (no trailing slash) |
   | `JIRA_EMAIL` | Production, Preview | Atlassian account email for the API token |
   | `JIRA_API_TOKEN` | Production, Preview | [Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens) |
   | `JIRA_DEFAULT_JQL` | Optional | Bounded JQL; see `.env.example` |
   | `VITE_JIRA_BASE_URL` | Production, Preview | Same as `JIRA_BASE_URL` if you want “Open in Jira” links (embedded at **build** time) |

   **Secrets:** Mark `JIRA_API_TOKEN` as sensitive. Do **not** prefix Jira secrets with `VITE_` — that would bundle them into the browser.

6. Redeploy after changing `VITE_*` variables (they are inlined at build time).

## Verify after deploy

- Open the production URL → dashboard should load.
- If Jira env is set: issues should load from Jira. If not: demo seed data (by design).
- Visit `/settings` — client-side route should work (SPA rewrite).

## Limits

- Serverless `maxDuration` is set to **10s** in `vercel.json` (Hobby-compatible). If Jira is slow, upgrade the plan and raise `functions["api/jira/search.ts"].maxDuration` (e.g. 30–60s on Pro).

## Large folders

`plane-preview/` is listed in `.vercelignore` so it is not uploaded with the app. It is unrelated to this Vite project.

## CLI (optional)

```bash
npm i -g vercel
vercel login
vercel
```

Link production env vars in the dashboard, then `vercel --prod`.
