import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { clientIp } from "./rate-limit";
import { hashIp } from "./hash";
import { getUser, rest, AUDIT } from "./db";

export const AT = "__Host-neuvia_at";
export const RT = "__Host-neuvia_rt";
export const SESSION_MAX = 60 * 60 * 8; // admin sessions last at most 8 hours

/** Emails allowed into /admin (also enforced in the database through RLS). */
export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || "founder@proyectumia.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAllowedAdmin = (email?: string | null) => !!email && adminEmails().includes(email.toLowerCase());

export const authCookie = (name: string, value: string, maxAge: number) => ({
  name, value, maxAge, httpOnly: true, secure: true, sameSite: "strict" as const, path: "/",
});

export type AdminSession = { token: string; email: string };

/** Validates the Supabase access token server-side on every request. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const token = (await cookies()).get(AT)?.value;
  if (!token) return null;
  const res = await getUser(token);
  const email = res.data?.email;
  if (!res.ok || !isAllowedAdmin(email)) return null;
  return { token, email: email! };
});

export const hasRefreshToken = async () => Boolean((await cookies()).get(RT)?.value);

export async function audit(session: AdminSession, action: string, requestId?: string | null, detail: Record<string, unknown> = {}) {
  const h = await headers();
  await rest(AUDIT, { token: session.token, method: "POST", body: { action, request_id: requestId ?? null, detail, actor_email: session.email, ip_hash: hashIp(clientIp(h)) } }).catch(() => undefined);
}
