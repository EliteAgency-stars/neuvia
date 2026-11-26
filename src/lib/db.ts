import "server-only";
import { createHash } from "node:crypto";

/**
 * Minimal Supabase PostgREST client using the service-role key (server only).
 * Tables are protected by RLS with no public policies, so only this server
 * can read or write them.
 */
const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dbConfigured = () => Boolean(url && key);

export const TABLE = "neuvia_access_requests";
export const AUDIT = "neuvia_admin_audit";

type Opts = { method?: string; query?: string; body?: unknown; prefer?: string };

export async function rest<T = unknown>(table: string, { method = "GET", query = "", body, prefer }: Opts = {}): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  if (!url || !key) return { ok: false, status: 503, data: null, error: "not_configured" };
  const res = await fetch(`${url}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const textBody = await res.text();
  let data: T | null = null;
  try { data = textBody ? (JSON.parse(textBody) as T) : null; } catch { data = null; }
  return { ok: res.ok, status: res.status, data, error: res.ok ? undefined : (data as { code?: string; message?: string } | null)?.code || `http_${res.status}` };
}

export const hashIp = (ip: string) => createHash("sha256").update(`${process.env.IP_HASH_SALT || "neuvia"}:${ip}`).digest("hex").slice(0, 32);
