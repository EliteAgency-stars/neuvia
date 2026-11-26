"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AT, RT, SESSION_MAX, audit, authCookie, getAdminSession, isAllowedAdmin } from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { rest, signInWithPassword, signOut, TABLE } from "@/lib/db";
import { STATUSES } from "@/lib/validation";

export async function login(_: { error?: string } | undefined, fd: FormData) {
  const ip = clientIp(await headers());
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfter / 60)} min.` };
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };
  if (!isAllowedAdmin(email)) return { error: "Invalid credentials." };
  const res = await signInWithPassword(email, password);
  if (!res.ok || !res.data?.access_token || !isAllowedAdmin(res.data.user?.email)) return { error: "Invalid credentials." };
  const jar = await cookies();
  jar.set(authCookie(AT, res.data.access_token, Math.min(res.data.expires_in || 3600, SESSION_MAX)));
  jar.set(authCookie(RT, res.data.refresh_token, SESSION_MAX));
  await audit({ token: res.data.access_token, email }, "login");
  redirect("/admin");
}

export async function logout() {
  const session = await getAdminSession();
  if (session) { await audit(session, "logout"); await signOut(session.token).catch(() => undefined); }
  const jar = await cookies();
  jar.set(authCookie(AT, "", 0));
  jar.set(authCookie(RT, "", 0));
  redirect("/admin");
}

const uuid = z.string().uuid();

export async function updateStatus(fd: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");
  const id = uuid.parse(fd.get("id"));
  const status = z.enum(STATUSES).parse(fd.get("status"));
  const res = await rest(TABLE, { token: session.token, method: "PATCH", query: `id=eq.${id}`, body: { status } });
  if (res.ok) await audit(session, "status_change", id, { status });
  revalidatePath("/admin");
}

export async function deleteRequest(fd: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");
  const id = uuid.parse(fd.get("id"));
  if (fd.get("confirm") !== "DELETE") return;
  const res = await rest(TABLE, { token: session.token, method: "DELETE", query: `id=eq.${id}` });
  if (res.ok) await audit(session, "delete", id);
  revalidatePath("/admin");
}
