import { isAuthenticated, audit } from "@/lib/admin-auth";
import { rest, TABLE } from "@/lib/db";
import { INTERESTS, STATUSES } from "@/lib/validation";

export const dynamic = "force-dynamic";

const COLS = ["id", "created_at", "status", "full_name", "email", "organization", "role", "country", "org_type", "interest", "infrastructure", "problem", "message", "newsletter_opt_in", "locale"] as const;
// Prevent CSV formula injection in spreadsheet apps.
const cell = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await isAuthenticated())) return new Response("Unauthorized", { status: 401 });
  const u = new URL(req.url);
  const status = u.searchParams.get("status");
  const interest = u.searchParams.get("interest");
  const q = (u.searchParams.get("q") || "").replace(/[^\p{L}\p{N}@._\- ]/gu, "").slice(0, 80);
  const query = [
    `select=${COLS.join(",")}`,
    "order=created_at.desc",
    status && STATUSES.includes(status as never) && `status=eq.${status}`,
    interest && INTERESTS.includes(interest as never) && `interest=eq.${interest}`,
    q && `or=(full_name.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*,organization.ilike.*${encodeURIComponent(q)}*)`,
  ].filter(Boolean).join("&");
  const res = await rest<Record<string, unknown>[]>(TABLE, { query });
  if (!res.ok) return new Response("Export failed", { status: 502 });
  const rows = res.data || [];
  await audit("export", null, { count: rows.length, status, interest, q });
  const csv = [COLS.join(","), ...rows.map((r) => COLS.map((c) => cell(r[c])).join(","))].join("\r\n");
  return new Response("﻿" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="neuvia-requests-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
