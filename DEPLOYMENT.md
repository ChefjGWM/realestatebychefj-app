# Deployment Guide

This is a Next.js 14 (App Router) app deployed to Vercel, backed by Supabase
(database + auth) and Resend (email notifications). Follow these steps from
a clean machine to take it from source code to a live URL on
`tools.realestatebychefj.com`.

---

## 0. Prerequisites

- A GitHub account
- A Vercel account (free tier is fine to start)
- A Supabase account + a project created (free tier OK)
- A Resend account + a verified sending domain (or use `onboarding@resend.dev` for testing)
- The custom domain `realestatebychefj.com` registered somewhere where you can edit DNS records
- Node.js 18+ installed locally (to run the build before pushing)

---

## 1. Push the code to GitHub

From the project root:

```bash
# 1. Initialize a git repo (skip if you've already done this)
git init
git add .
git commit -m "Initial commit"

# 2. Create the GitHub repo
#    Option A — using the GitHub CLI:
gh repo create realestatebychefj-app --public --source=. --remote=origin --push

#    Option B — manually:
#    a. Visit https://github.com/new and create a new repo named "realestatebychefj-app"
#    b. Then locally:
git remote add origin https://github.com/<your-username>/realestatebychefj-app.git
git branch -M main
git push -u origin main
```

> **Important:** make sure `.env.local` is NOT in the repo. The `.gitignore`
> Next.js scaffolds includes `.env*.local` by default — verify with
> `git status` before committing.

---

## 2. Create a Vercel account & connect GitHub

1. Go to <https://vercel.com/signup> and sign in **with GitHub** — this
   automatically links your repos.
2. Authorize Vercel to access either all repositories or just
   `realestatebychefj-app`.

---

## 3. Import the project into Vercel

1. From your Vercel dashboard, click **Add New → Project**.
2. Find `realestatebychefj-app` in the list and click **Import**.
3. Vercel auto-detects Next.js — leave the **Framework Preset**, **Root
   Directory**, **Build Command**, and **Output Directory** at their defaults.
4. **Don't click Deploy yet** — first add the environment variables (next
   step).

---

## 4. Add environment variables in Vercel

Still on the import screen (or under **Project Settings → Environment
Variables** if you've already deployed), add the following four variables.
For each, set the **Environment** to **Production, Preview, and Development**
unless noted.

| Variable                          | Where to find it                                  | Notes                                  |
| --------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase → Project Settings → API → Project URL   | Public, exposed to the browser         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase → Project Settings → API → `anon public` | Public, exposed to the browser         |
| `RESEND_API_KEY`                  | Resend → API Keys → Create API key                | **Server-only**, never `NEXT_PUBLIC_*` |
| `RESEND_FROM_EMAIL`               | Your verified Resend sender, e.g. `Chef J <hi@realestatebychefj.com>` | Must use a domain you've verified in Resend (or `onboarding@resend.dev` for testing) |

After saving the four variables, click **Deploy** (or trigger a redeploy if
the project was already imported). The first build takes 1–3 minutes.

---

## 5. Set up the Supabase database

The migrations live under `supabase/migrations/`. Run them in order:

1. In Supabase, open **SQL Editor** → **New query**.
2. Paste the contents of `supabase/migrations/001_clients.sql` and click **Run**.
3. Open another **New query**, paste `supabase/migrations/002_auth.sql`, and run.

Verify in **Table Editor**: you should see two tables under the `public` schema:
- `clients` with columns `id`, `user_id`, `name`, `email`, `phone`, `budget`, `preapproved`, `notes`, `dti_data`, `budget_data`, `created_at`, `updated_at`
- `agents` with `user_id`, `email`, `created_at`

### Seed your first agent (admin) account

1. Visit `https://<your-vercel-url>.vercel.app/admin`.
2. Use the agent sign-in form to **create an account** (Supabase auto-creates a
   user on first sign-in attempt — actually, you'll need to register through
   the regular `/` page first OR use Supabase **Authentication → Users → Add
   user** in the dashboard to create a user manually).
3. Once the user exists, copy the user's UUID from **Authentication → Users**.
4. Back in the SQL editor, run:
   ```sql
   insert into public.agents (user_id, email)
   values ('<paste-the-uuid-here>', 'agent@yourdomain.com');
   ```
5. Sign in again on `/admin` — you should now see the CRM dashboard.

---

## 6. Connect the custom domain

1. In the Vercel project dashboard, go to **Settings → Domains**.
2. Click **Add** and enter `tools.realestatebychefj.com` (recommended — keeps
   the marketing site separate).
   - If you'd rather host the tools at the apex `realestatebychefj.com`, add
     that instead.
3. Vercel will show you the DNS records to add at your registrar:
   - For a **subdomain** (`tools.realestatebychefj.com`) → add a **CNAME**
     pointing to `cname.vercel-dns.com`.
   - For the **apex** (`realestatebychefj.com`) → add an **A** record pointing
     to `76.76.21.21` (Vercel's anycast IP).
4. Save the DNS records at your registrar. Propagation usually takes 1–10
   minutes; Vercel auto-issues a TLS certificate once DNS resolves.
5. The site will then be live at <https://tools.realestatebychefj.com>.

> The canonical URL configured in `src/app/layout.tsx` is
> `https://tools.realestatebychefj.com`. If you go with a different domain,
> update `SITE_URL` in `src/app/layout.tsx` and redeploy.

---

## 7. Verify the deployment

Visit your live URL and confirm:

- [ ] Home page renders the login screen with the sign-in form (because
      Supabase env vars are set)
- [ ] You can register a test client (use a real email you can check)
- [ ] After registration, the email at `fjj_myhome@outlook.com` receives a
      "New Client: ..." message from Resend
- [ ] Filling out the DTI tab triggers another email "Client ... updated their
      financial info"
- [ ] `/about` loads with the correct title in the browser tab
- [ ] `/admin` shows the agent sign-in form; signing in as a seeded agent
      reveals the CRM dashboard
- [ ] `/robots.txt` returns the allow-all robots file
- [ ] `/icon.svg` returns the navy-and-gold favicon

---

## 8. Future updates

Vercel auto-deploys on every push to `main`:

```bash
git add .
git commit -m "Update calculator labels"
git push
```

Each push opens a new production deployment. Pull requests get their own
preview URL automatically.

---

## Troubleshooting

| Symptom                                          | Cause / fix                                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "⚠ Demo mode" banner on the live site            | `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set. Add them in Project Settings → Environment Variables and redeploy.                    |
| Notify endpoint returns `resend-not-configured`  | `RESEND_API_KEY` or `RESEND_FROM_EMAIL` missing. Add them and redeploy.                                                                                       |
| Resend rejects the `from` address                | The `from` domain isn't verified. Verify the domain in the Resend dashboard or fall back to `onboarding@resend.dev` for testing.                              |
| `/admin` shows "Not Authorized" after signing in | Your user is signed in but isn't in the `public.agents` table. Insert a row keyed by your `auth.users.id`.                                                    |
| Build fails with type errors                     | Run `npm run build` locally and fix the errors before pushing. ESLint warnings are skipped during build (see `next.config.mjs`), but type errors are fatal. |
| RLS policy errors in the dashboard               | Make sure `002_auth.sql` ran successfully. The `clients` table requires the `agents` row check for cross-client reads.                                         |
