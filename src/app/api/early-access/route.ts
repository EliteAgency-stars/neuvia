import { NextResponse } from "next/server";
import { accessRequestSchema, looksLikeSecret } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { dbConfigured, rest, TABLE, hashIp } from "@/lib/db";
import { notifyNewRequest } from "@/lib/email";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (status: number, body: Record<string, unknown>, headers?: Record<string, string>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(req: Request) {
  // Same-origin check (CSRF defence for a JSON endpoint).
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json(403, { ok: false, error: "forbidden" });
  if (!req.headers.get("content-type")?.includes("application/json")) return json(415, { ok: false, error: "unsupported_media_type" });

  const ip = clientIp(req.headers);
  const rl = rateLimit(`ea:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return json(429, { ok: false, error: "rate_limited" }, { "Retry-After": String(rl.retryAfter) });

  const raw = await req.text();
  if (raw.length > 20_000) return json(413, { ok: false, error: "payload_too_large" });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json(400, { ok: false, error: "invalid_json" }); }

  const parsed = accessRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    // Honeypot hit: pretend success-shaped response is NOT returned; respond generically.
    if (fields.includes("website")) return json(400, { ok: false, error: "rejected" });
    return json(422, { ok: false, error: "validation", fields });
  }
  const r = parsed.data;
  const elapsed = Date.now() - r.startedAt;
  if (elapsed < 3000 || elapsed > 1000 * 60 * 60 * 24) return json(400, { ok: false, error: "rejected" });
  if ([r.problem, r.message, r.infrastructure].some(looksLikeSecret)) return json(422, { ok: false, error: "secret_detected", fields: ["problem"] });

  if (!dbConfigured()) {
    return json(503, { ok: false, error: "not_configured", contact: site.contact.email });
  }

  const insert = await rest<{ id: string }[]>(TABLE, {
    method: "POST",
    prefer: "return=representation",
    query: "select=id",
    body: {
      full_name: r.fullName,
      email: r.email,
      organization: r.organization,
      role: r.role,
      country: r.country || null,
      org_type: r.orgType,
      interest: r.interest,
      infrastructure: r.infrastructure || null,
      problem: r.problem,
      message: r.message || null,
      privacy_accepted: true,
      newsletter_opt_in: r.newsletter,
      locale: r.locale,
      idempotency_key: r.idempotencyKey,
      ip_hash: hashIp(ip),
      user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    },
  });

  if (insert.status === 409 || insert.error === "23505") return json(200, { ok: true, duplicate: true });
  if (!insert.ok || !insert.data?.[0]?.id) {
    console.error("early-access insert failed", insert.status, insert.error);
    return json(502, { ok: false, error: "storage_failed" });
  }
  const id = insert.data[0].id;
  const email = await notifyNewRequest(r, id);
  return json(201, { ok: true, id, notification: email });
}

export function GET() {
  return json(405, { ok: false, error: "method_not_allowed" }, { Allow: "POST" });
}
