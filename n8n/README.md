# n8n — NEUVIA · Early Access

Pipeline: `neuvia.co /api/early-access` (validation, rate limit, honeypot) → **n8n webhook** `POST /webhook/neuvia-early-access`
→ *Validate request* (shared secret `X-Neuvia-Secret` + field checks) → *Store in Supabase* (RPC `neuvia_submit_request`, idempotent)
→ responds `201 {ok,id}` / `200 {ok,duplicate}` → *Email founder* (Spanish, reply-to requester) → *Email requester* (en/es/de) → *Mark notified*.

- `build-workflow.py` — single source of the workflow, including both HTML email templates.
- `neuvia-early-access.json` — export with **placeholders** (safe to commit).
- `deploy.py` — creates/updates and activates the workflow via the n8n API, auto-detecting the ProyectumIA email credential.

Secrets (never commit): `WEBHOOK_SECRET` (= Vercel `N8N_WEBHOOK_SECRET`) and `RPC_SECRET` (its SHA-256 lives in `public.neuvia_private_settings`).

```bash
WEBHOOK_SECRET=... RPC_SECRET=... N8N_API_KEY=... python3 n8n/deploy.py
```
