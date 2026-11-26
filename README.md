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
| Database | Supabase Postgres via PostgREST + service-role key (server only) | No client SDK needed; RLS on with **no public policies** |
| Email | Resend HTTP API (optional) | Configurable by env; submissions are stored even if email is off |
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
  app/admin/…           admin (own root layout, noindex)
  app/api/…             form + public JSON
  app/(text routes)     llms.txt, llms-full.txt, neuvia.md, md/[...slug], humans.txt, .well-known
  components/           Header, Footer, Logo, NeuralField, ReliabilityLab, NcriRadar, DocPage, EarlyAccessForm…
  content/              pages.ts, company.ts, references.ts, research/*.md  ← edit content here
  i18n/                 config + dictionaries (en/es/de)
  lib/                  site facts, SEO, simulation, validation, db, email, admin auth, agents, markdown
public/brand/           logo SVGs (color, dark, mono), app icon, PNG icons, OG image, manifest
supabase/migrations/    SQL for requests + audit tables
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

Without database env vars the form returns a clear "service not configured" message (it never fakes success) and `/admin` shows "Admin disabled".

## Environment variables

See `.env.example`. Server-only secrets: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `IP_HASH_SALT`. Never prefix them with `NEXT_PUBLIC_`.

## Deployment (Vercel + neuvia.co)

Pushing to `main` deploys to production through the existing Vercel Git integration (project `neuvia`).

1. **Environment variables** — Vercel → Project → Settings → Environment Variables (Production): `SUPABASE_URL=https://opagblruzwsrxsggkjsa.supabase.co`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API), `IP_HASH_SALT` (random), `ADMIN_PASSWORD` (≥16 chars), `ADMIN_SESSION_SECRET` (≥32 chars, e.g. `openssl rand -base64 48`), optionally `RESEND_API_KEY`, `CONTACT_RECIPIENT_EMAIL`, `EMAIL_FROM`. Redeploy after saving.
2. **Database** — the migration in `supabase/migrations/` has already been applied to the Supabase project (tables `neuvia_access_requests`, `neuvia_admin_audit`, RLS on, no public access). For a fresh project, run it in the SQL editor.
3. **Domain** — Vercel → Project → Domains → add `neuvia.co` and `www.neuvia.co` (redirect www → apex). At your registrar set `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com` (or use the exact records Vercel shows). HTTPS certificates are issued automatically.
4. **Email** — in Resend, verify the `neuvia.co` domain (SPF/DKIM records), then set `EMAIL_FROM="NEUVIA <noreply@neuvia.co>"`.
5. **Verify** — submit a test request on `/early-access`, confirm it appears in `/admin` and (if configured) by email. Then delete it from the admin panel.
6. **Search engines** — verify the domain in Google Search Console and Bing Webmaster Tools (DNS TXT record) and submit `https://neuvia.co/sitemap.xml`.
7. **Monitoring** — enable Vercel Observability / Runtime Logs; form failures are logged as `early-access insert failed`.
8. **Backups** — Supabase daily backups (plan-dependent); export CSV from `/admin` periodically if you need offline copies.

## Updating content

- Site-wide facts (definition, status, contact, founder): `src/lib/site.ts`.
- Page content: `src/content/pages.ts` and `src/content/company.ts` (add `es`/`de` keys to translate a page — hreflang and sitemap update automatically).
- New article: add `src/content/research/<slug>.md` with frontmatter (`title`, `description`, `category`, `date`, `readingTime`). It appears in the index, sitemap, `llms.txt` and `/md/research/<slug>`.
- UI strings / home page: `src/i18n/dictionaries/{en,es,de}.ts` (tests enforce identical shape).
- Crawler policy: `AI_TRAINING_CRAWLERS=allow|disallow`.

## Security summary

Strict CSP (self-only), HSTS, `X-Frame-Options: DENY`, no third-party scripts or trackers; Zod validation + sanitization; honeypot, minimum fill time, per-IP rate limiting, idempotency key (DB unique constraint) against duplicates; secret-pattern detection refuses API keys pasted into the form; same-origin check on the API; RLS without public policies; admin session = HMAC-signed `__Host-` cookie (HttpOnly, Secure, SameSite=Strict, 8h), login rate limit, audit log of every view/change/export/delete, CSV formula-injection protection. See `/security` for the disclosure policy.
