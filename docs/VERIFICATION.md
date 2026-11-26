# Verification report

Date: 2026-11-26 · Build: Next.js 16.4.6 · Node 22

## Executed

| Check | Result |
|---|---|
| `next build` (TypeScript strict) | ✅ Pass — 82 static pages generated |
| Unit tests (`vitest`, 21 tests: simulation determinism/bounds, validation & secret detection, i18n shape parity, Markdown/agent resources, admin token signing) | ✅ 21/21 pass |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities (Next 16.4.6, zod 4.6.7) |
| HTTP smoke test of 37 URLs on the production build | ✅ All expected codes (200; `/nope` → custom 404; `/en/about` → 308) |
| Content types of text resources (`llms.txt`, `.md`, JSON, XML) | ✅ Correct |
| Security headers (CSP, HSTS, XFO, Referrer-Policy) | ✅ Present |
| Canonical + hreflang on untranslated locale variant (`/es/technology` → canonical English) | ✅ |
| API: cross-origin POST → 403; malformed → 422 with fields; stale/bot timing → rejected | ✅ |
| Browser console errors (Chromium, desktop 1440px + iPhone 13) on home, lab, about, early-access (es), benchmarks | ✅ None |
| Visual review (desktop + mobile screenshots) | ✅ Reviewed; hero animation bug (negative frame delta) found and fixed |
| Vercel production deployment of checkpoint commit `7e8cb67` | ✅ READY |

## Not executed / limitations

- **Lighthouse** was not run; the 90/95/95/95 targets are design goals, not measured results. Run `npx lighthouse https://neuvia.co --view` after DNS is live.
- **Form → database end-to-end** could not be exercised because `SUPABASE_SERVICE_ROLE_KEY` is not set in this environment. The table and constraints exist in Supabase; verify with one real submission after configuring Vercel env vars.
- **Email notifications** untested (no Resend key).
- **Reference links** (`src/content/references.ts`): arXiv and DOI hosts were blocked from the build environment, so each citation was checked against established bibliographic knowledge rather than fetched live. Spot-check every link before launch.
- **WCAG 2.2 AA**: built with semantic landmarks, labels, focus states, keyboard-operable controls, reduced-motion support and contrast-checked tokens; no automated axe audit or screen-reader session was performed.
- **Founder photo**: the Supabase-hosted avatar could not be downloaded (host blocked by the environment proxy), so the photo supplied in chat is used (`public/team/santiago-orjuela.webp`).
