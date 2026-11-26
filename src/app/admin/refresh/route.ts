import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AT, RT, SESSION_MAX, authCookie, isAllowedAdmin } from "@/lib/admin-auth";
import { refreshSession } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Exchanges the refresh token for a new access token (Server Components cannot set cookies). */
export async function GET(req: Request) {
  const jar = await cookies();
  const rt = jar.get(RT)?.value;
  const res = NextResponse.redirect(new URL("/admin", req.url));
  const r = rt ? await refreshSession(rt) : null;
  if (r?.ok && r.data?.access_token && isAllowedAdmin(r.data.user?.email)) {
    res.cookies.set(authCookie(AT, r.data.access_token, Math.min(r.data.expires_in || 3600, SESSION_MAX)));
    res.cookies.set(authCookie(RT, r.data.refresh_token, SESSION_MAX));
  } else {
    res.cookies.set(authCookie(AT, "", 0));
    res.cookies.set(authCookie(RT, "", 0));
  }
  return res;
}
