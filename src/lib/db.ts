import "server-only";

/**
 * Supabase access WITHOUT the service-role key.
 * - Public URL + publishable key (designed to be public) identify the project.
 * - Admin reads/writes use the signed-in user's JWT; RLS policies only allow
 *   emails listed in public.neuvia_admins.
 * - New submissions are written by the n8n workflow through a secret-protected RPC.
 */
export const SUPABASE_URL = (process.env.SUPABASE_URL || "https://opagblruzwsrxsggkjsa.supabase.co").replace(/\/$/, "");
export const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_O30dPx3jfAA3m2CUnw7nCQ_jsuZiwRj";

export const TABLE = "neuvia_access_requests";
export const AUDIT = "neuvia_admin_audit";

type Opts = { method?: string; query?: string; body?: unknown; prefer?: string; token: string };

export async function rest<T = unknown>(table: string, { method = "GET", query = "", body, prefer, token }: Opts): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    method,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let data: T | null = null;
  try { data = text ? (JSON.parse(text) as T) : null; } catch { data = null; }
  return { ok: res.ok, status: res.status, data, error: res.ok ? undefined : (data as { code?: string } | null)?.code || `http_${res.status}` };
}

export type AuthTokens = { access_token: string; refresh_token: string; expires_in: number; user: { id: string; email?: string } };

async function auth<T>(path: string, init: { method?: string; body?: unknown; token?: string }) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: init.method || "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as T | null;
  return { ok: res.ok, status: res.status, data };
}

export const signInWithPassword = (email: string, password: string) => auth<AuthTokens>("token?grant_type=password", { body: { email, password } });
export const refreshSession = (refresh_token: string) => auth<AuthTokens>("token?grant_type=refresh_token", { body: { refresh_token } });
export const getUser = (token: string) => auth<{ id: string; email?: string }>("user", { method: "GET", token });
export const signOut = (token: string) => auth("logout", { token });
