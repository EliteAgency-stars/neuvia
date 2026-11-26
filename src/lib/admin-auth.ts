import "server-only";
import { createHash, createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { clientIp } from "./rate-limit";
import { hashIp, rest, AUDIT } from "./db";

export const COOKIE = "__Host-neuvia_admin";
const TTL_SECONDS = 60 * 60 * 8;

const password = () => process.env.ADMIN_PASSWORD || "";
const secret = () => process.env.ADMIN_SESSION_SECRET || "";

/** Admin is only enabled when a strong password and signing secret are configured. */
export const adminConfigured = () => password().length >= 16 && secret().length >= 32;

const sha = (s: string) => createHash("sha256").update(s).digest();
export function passwordMatches(input: string) {
  if (!adminConfigured()) return false;
  return timingSafeEqual(sha(input), sha(password()));
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TTL_SECONDS, n: randomBytes(8).toString("hex") })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp: number };
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function isAuthenticated() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value);
}

export const sessionCookie = (value: string, maxAge = TTL_SECONDS) => ({
  name: COOKIE,
  value,
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge,
});

export async function audit(action: string, requestId?: string | null, detail: Record<string, unknown> = {}) {
  const h = await headers();
  await rest(AUDIT, { method: "POST", body: { action, request_id: requestId ?? null, detail, ip_hash: hashIp(clientIp(h)) } }).catch(() => undefined);
}
