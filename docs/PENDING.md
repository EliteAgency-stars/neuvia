# Pending work and owner actions

## Requires the owner (credentials, legal data, external services)

3. **Domain**: add `neuvia.co` in Vercel and set DNS at the registrar.
4. **Legal pages**: complete every `[TO BE COMPLETED BY THE OWNER BEFORE LAUNCH]` in `/privacy`, `/terms`, `/legal` (legal entity, address, registration, VAT, governing law, retention period, DPAs) and have them reviewed by counsel. A German Impressum (§ 5 DDG) is needed if targeting Germany.
5. **Founder bio**: review the bio text in the dictionaries (`about.founderBody`).
6. **Corporate email**: the site shows `founder@proyectumia.com` as provided. Consider a `@neuvia.co` address once the domain mail is set up (update `src/lib/site.ts`).
7. **Trademark** status of "NEUVIA" and logo.
8. **Search Console / Bing** verification and sitemap submission.

## Product / engineering backlog

- Professional review of Spanish and German; translate the remaining English-only pages (technology, research, solutions, benchmarks, ai-agents, developers, legal) and the Lab UI.
- Durable global rate limiting (e.g. Upstash Redis) — current limiter is per-instance memory + DB idempotency.
- Lighthouse + axe audits and fixes; real-device testing (Safari iOS, Firefox).
- Enable MFA on the Supabase account used for `/admin`.
- Remaining planned articles: "From model performance to cognitive reliability", "Can AI evaluate AI?", "Why more capable models still require oversight", "The challenge of regulating autonomous agents".
- MDX support if interactive components are needed inside articles (Markdown is supported today).
- Replace NCRI placeholder weights only after published methodology; never present NCRI as validated.
- Optional privacy-friendly analytics (with consent banner if non-essential).
