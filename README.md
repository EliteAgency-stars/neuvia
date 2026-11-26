# NEUVIA — neuvia.co

> **Intelligence caring for intelligence.**
> NEUVIA is a research and technology initiative developing AI cognitive reliability and regulation infrastructure through synthetic neuropsychology, model evaluation, interpretability and authorized AI-to-AI assistance.

Public platform for NEUVIA: research communication, a conceptual architecture, an interactive (synthetic) Cognitive Reliability Lab, an early-access pipeline with a secure admin panel, and first-class resources for AI agents and search engines.

**Status:** Research & Development Initiative. No NEUVIA model, API or diagnostic service is publicly available. All demonstrations use synthetic data.

---

## Stack & decisions

| Area | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict | SSG for every content page (crawlable without JS), server routes for the form/admin |
| Styling | Tailwind CSS 4 with design tokens in `src/app/globals.css` | One token source; Liquid Glass material as reusable `.glass` / `.glass-dark` classes |
| Motion | `motion` (lab chart/tab transitions) + CSS scroll-driven reveals | Reveals need no JS; content always visible; respects `prefers-reduced-motion` |
| Hero | Canvas 2D (`NeuralField`) | Light, pauses off-screen / hidden tab, static frame with reduced motion |
| Icons / fonts | `lucide-react`, `geist` (self-hosted) | No external font/CDN requests; CSP stays `self`-only |
| Validation | Zod 4, shared client + server | Same rules in the browser and the API |
| Pipeline | n8n workflow `NEUVIA · Early Access` (`n8n/`) | Webhook → validation → Supabase RPC → HTML emails via the ProyectumIA mailbox |
| Database | Supabase Postgres, **no service-role key in the app** | Inserts via secret-protected RPC (from n8n); admin reads with the signed-in user's JWT under RLS |
| Admin auth | Supabase Auth (email + password) | Allowlist `ADMIN_EMAILS` + `public.neuvia_admins` enforced in RLS |
| Content | Typed content objects (`src/content/*.ts`) + Markdown articles (`src/content/research/*.md`) | HTML pages, `/md/*`, `llms.txt`, `llms-full.txt` and JSON are generated from the same source |
| Hosting | Vercel (Git integration on `main`) | Native Next.js support, HTTPS, edge network |

**Brand palette** (vivid jade replaces the original petrol green, per owner feedback): white `#FFFFFF`, paper `#F6FAF8`, ink `#0B1714`, jade `#00C896` (fills, with dark text), jade-deep `#00785A` (text on white, 5.4:1), mint `#C9F8E8`, iris `#4F6BFF` (the "observed model" in visuals), coral `#FF5A3C` (anomalies/warnings).

## Routes

| Path | Purpose |
|---|---|
| `/`, `/es`, `/de` | Home (fully translated) |
| `/technology`, `/research`, `/research/[slug]`, `/solutions`, `/benchmarks`, `/ai-agents`, `/developers` | Content (English; `es`/`de` variants show a notice and canonicalize to English) |
| `/about`, `/early-access`, `/contact` | Translated (en/es/de) |
| `/privacy`, `/terms`, `/legal`, `/security` | Legal drafts + disclosure policy |
| `/admin`, `/admin/export` | Private panel (disabled until configured) |
| `/api/early-access` | POST form endpoint |
| `/api/public/project-info` | Public JSON for agents |
| `/llms.txt`, `/llms-full.txt`, `/neuvia.md`, `/md/{page}`, `/md/research/{slug}` | Machine-readable text |
| `/robots.txt`, `/sitemap.xml`, `/humans.txt`, `/.well-known/security.txt` | Discovery |

## Project structure

```
src/
  app/[locale]/…        localized pages (en at root via src/proxy.ts rewrite)
  app/admin/…           admin (own root layout, noindex, Supabase Auth)
  app/api/…             form + public JSON
  app/(text routes)     llms.txt, llms-full.txt, neuvia.md, md/[...slug], humans.txt, .well-known
  components/           Header, Footer, Logo, NeuralField, ReliabilityLab, NcriRadar, DocPage, EarlyAccessForm…
  content/              pages.ts, company.ts, references.ts, research/*.md  ← edit content here
  i18n/                 config + dictionaries (en/es/de)
  lib/                  site facts, SEO, simulation, validation, db, email, admin auth, agents, markdown
public/brand/           logo SVGs (color, dark, mono), app icon, PNG icons, OG image, manifest
supabase/migrations/    SQL: tables, admin RLS, ingest RPCs
n8n/                    workflow generator + importable export (no secrets)
tests/                  Vitest unit tests
docs/                   VERIFICATION.md, PENDING.md
```

## Local development

```bash
npm ci
cp .env.example .env.local   # fill what you need; the site runs without any env
npm run dev                  # http://localhost:3000
npm test                     # unit tests
npm run lint                 # type-check
npm run build && npm start   # production build
```

Without `N8N_WEBHOOK_SECRET` the form returns a clear "service not configured" message (it never fakes success).

## Environment variables

See `.env.example`. Server-only secrets: `N8N_WEBHOOK_SECRET`, `IP_HASH_SALT`. Never prefix them with `NEXT_PUBLIC_`.

## Deployment (Vercel + neuvia.co)

Pushing to `main` deploys to production through the existing Vercel Git integration (project `neuvia`).

1. **Environment variables** — Vercel → Project → Settings → Environment Variables (Production): `N8N_WEBHOOK_SECRET` (must match the secret inside the workflow's *Validate request* node) and `IP_HASH_SALT`. Supabase URL/publishable key are public and built in. Redeploy after saving.
2. **Database** — migrations in `supabase/migrations/` are applied to the Supabase project: requests + audit tables, admin RLS policies (`neuvia_admins`), and the `neuvia_submit_request` / `neuvia_mark_notified` RPCs that validate a SHA-256-hashed ingest secret.
3. **n8n** — workflow `NEUVIA · Early Access` (source: `n8n/build-workflow.py`, export: `n8n/neuvia-early-access.json` with placeholders). It responds to the site immediately after storing the request, then emails the founder (Spanish, reply-to = requester) and the requester (en/es/de). To rotate secrets: regenerate, update the RPC hash in `neuvia_private_settings`, the workflow and Vercel.
4. **Admin** — sign in at `/admin` with the Supabase account `founder@proyectumia.com`. To add an admin: insert the email into `public.neuvia_admins` and add it to `ADMIN_EMAILS`.
5. **Domain** — Vercel → Project → Domains → add `neuvia.co` and `www.neuvia.co` (redirect www → apex). At your registrar set `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com` (or use the exact records Vercel shows). HTTPS certificates are issued automatically.
6. **Verify** — submit a test request on `/early-access`, confirm both emails arrive and the row appears in `/admin`; then delete it.
7. **Search engines** — verify the domain in Google Search Console and Bing Webmaster Tools (DNS TXT record) and submit `https://neuvia.co/sitemap.xml`.
8. **Monitoring** — Vercel Runtime Logs (`early-access n8n forward failed`) and n8n executions (errors are saved).
9. **Backups** — Supabase daily backups (plan-dependent); export CSV from `/admin` periodically if you need offline copies.

## Updating content

- Site-wide facts (definition, status, contact, founder): `src/lib/site.ts`.
- Page content: `src/content/pages.ts` and `src/content/company.ts` (add `es`/`de` keys to translate a page — hreflang and sitemap update automatically).
- New article: add `src/content/research/<slug>.md` with frontmatter (`title`, `description`, `category`, `date`, `readingTime`). It appears in the index, sitemap, `llms.txt` and `/md/research/<slug>`.
- UI strings / home page: `src/i18n/dictionaries/{en,es,de}.ts` (tests enforce identical shape).
- Crawler policy: `AI_TRAINING_CRAWLERS=allow|disallow`.

## Security summary

Strict CSP (self-only), HSTS, `X-Frame-Options: DENY`, no third-party scripts or trackers; Zod validation + sanitization; honeypot, minimum fill time, per-IP rate limiting, idempotency key (DB unique constraint) against duplicates; secret-pattern detection refuses API keys pasted into the form; same-origin check on the API; inserts only through a secret-checked RPC; admin = Supabase Auth tokens in `__Host-` cookies (HttpOnly, Secure, SameSite=Strict, ≤8h) validated server-side on every request, allowlist enforced by RLS, login rate limit, audit log of every view/change/export/delete, CSV formula-injection protection. See `/security` for the disclosure policy.
