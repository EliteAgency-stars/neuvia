"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminConfigured, audit, createSessionToken, isAuthenticated, passwordMatches, sessionCookie } from "@/lib/admin-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { rest, TABLE } from "@/lib/db";
import { STATUSES } from "@/lib/validation";

export async function login(_: { error?: string } | undefined, fd: FormData) {
  if (!adminConfigured()) return { error: "Admin is not configured." };
  const ip = clientIp(await headers());
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfter / 60)} min.` };
  const pw = String(fd.get("password") || "");
  if (!passwordMatches(pw)) {
    await audit("login_failed");
    return { error: "Invalid credentials." };
  }
  (await cookies()).set(sessionCookie(createSessionToken()));
  await audit("login");
  redirect("/admin");
}

export async function logout() {
  (await cookies()).set(sessionCookie("", 0));
  await audit("logout");
  redirect("/admin");
}

const uuid = z.string().uuid();

export async function updateStatus(fd: FormData) {
  if (!(await isAuthenticated())) redirect("/admin");
  const id = uuid.parse(fd.get("id"));
  const status = z.enum(STATUSES).parse(fd.get("status"));
  const res = await rest(TABLE, { method: "PATCH", query: `id=eq.${id}`, body: { status } });
  if (res.ok) await audit("status_change", id, { status });
  revalidatePath("/admin");
}

export async function deleteRequest(fd: FormData) {
  if (!(await isAuthenticated())) redirect("/admin");
  const id = uuid.parse(fd.get("id"));
  if (fd.get("confirm") !== "DELETE") return;
  const res = await rest(TABLE, { method: "DELETE", query: `id=eq.${id}` });
  if (res.ok) await audit("delete", id);
  revalidatePath("/admin");
}
