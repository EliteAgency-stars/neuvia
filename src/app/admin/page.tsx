import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { redirect } from "next/navigation";
import { audit, getAdminSession, hasRefreshToken } from "@/lib/admin-auth";
import { rest, TABLE } from "@/lib/db";
import { INTERESTS, STATUSES } from "@/lib/validation";
import { LoginForm } from "./LoginForm";
import { logout, updateStatus, deleteRequest } from "./actions";

export const dynamic = "force-dynamic";

type Row = { id: string; created_at: string; full_name: string; email: string; organization: string; role: string; country: string | null; org_type: string; interest: string; infrastructure: string | null; problem: string; message: string | null; newsletter_opt_in: boolean; locale: string; status: string };

const STATUS_LABEL: Record<string, string> = { new: "New", under_review: "Under review", contacted: "Contacted", in_discussion: "In discussion", closed: "Closed" };
const safeQ = (q: string) => q.replace(/[^\p{L}\p{N}@._\- ]/gu, "").slice(0, 80);

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>;
}

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await getAdminSession();
  if (!session && (await hasRefreshToken())) redirect("/admin/refresh");
  if (!session) {
    return (
      <Shell>
        <div className="mx-auto max-w-sm pt-20">
          <LogoMark className="h-10 w-10" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">NEUVIA admin</h1>
          <p className="mt-2 text-sm text-muted">Restricted area — sign in with your Supabase account. All actions are logged.</p>
          <LoginForm />
        </div>
      </Shell>
    );
  }

  const sp = await searchParams;
  const q = safeQ(sp.q || "");
  const status = STATUSES.includes(sp.status as never) ? sp.status : "";
  const interest = INTERESTS.includes(sp.interest as never) ? sp.interest : "";
  const sort = sp.sort === "asc" ? "asc" : "desc";
  const filters = [
    "select=*",
    `order=created_at.${sort}`,
    "limit=200",
    status && `status=eq.${status}`,
    interest && `interest=eq.${interest}`,
    q && `or=(full_name.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*,organization.ilike.*${encodeURIComponent(q)}*)`,
  ].filter(Boolean).join("&");
  const res = await rest<Row[]>(TABLE, { token: session.token, query: filters });
  const rows = res.data || [];
  await audit(session, "view", null, { q, status, interest, count: rows.length });
  const exportHref = `/admin/export?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(interest && { interest }) })}`;

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><LogoMark className="h-8 w-8" /><h1 className="text-xl font-semibold tracking-tight">Requests <span className="font-mono text-sm text-muted">({rows.length})</span></h1><span className="hidden text-xs text-muted sm:inline">{session.email}</span></div>
        <div className="flex items-center gap-2">
          <a href={exportHref} className="btn btn-ghost !h-9 !text-sm">Export CSV</a>
          <form action={logout}><button className="btn btn-dark !h-9 !text-sm">Sign out</button></form>
        </div>
      </header>

      <form className="mt-6 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search name, email, organization" className="h-10 min-w-64 flex-1 rounded-full bg-white px-4 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)]" />
        <select name="status" defaultValue={status} className="h-10 rounded-full bg-white px-4 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)]"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
        <select name="interest" defaultValue={interest} className="h-10 rounded-full bg-white px-4 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)]"><option value="">All interests</option>{INTERESTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select>
        <select name="sort" defaultValue={sort} className="h-10 rounded-full bg-white px-4 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)]"><option value="desc">Newest first</option><option value="asc">Oldest first</option></select>
        <button className="btn btn-primary !h-10 !text-sm">Apply</button>
        {(q || status || interest) && <Link href="/admin" className="btn btn-ghost !h-10 !text-sm">Reset</Link>}
      </form>

      {!res.ok && <p className="mt-6 rounded-xl bg-coral-soft p-4 text-sm">Could not load requests ({res.error}).</p>}
      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-[1.25rem] bg-white p-5 ring-1 ring-line">
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-semibold">{r.full_name}</span>
                <span className="text-sm text-muted">{r.organization} · {r.role}</span>
                <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs">{r.interest.replace(/_/g, " ")}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs ${r.status === "new" ? "bg-mint text-jade-deep" : "bg-paper text-ink/70 ring-1 ring-line"}`}>{STATUS_LABEL[r.status]}</span>
                <time className="ml-auto font-mono text-xs text-muted" dateTime={r.created_at}>{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</time>
              </summary>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {[["Email", r.email], ["Country", r.country || "—"], ["Organization type", r.org_type], ["Infrastructure", r.infrastructure || "—"], ["Newsletter", r.newsletter_opt_in ? "Yes" : "No"], ["Locale", r.locale]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd>{v}</dd></div>)}
                <div className="sm:col-span-2"><dt className="text-xs text-muted">Problem</dt><dd className="whitespace-pre-wrap">{r.problem}</dd></div>
                {r.message && <div className="sm:col-span-2"><dt className="text-xs text-muted">Message</dt><dd className="whitespace-pre-wrap">{r.message}</dd></div>}
              </dl>
              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                <form action={updateStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={r.status} aria-label="Status" className="h-9 rounded-full bg-paper px-3 text-sm ring-1 ring-line">{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
                  <button className="btn btn-dark !h-9 !text-sm">Update</button>
                </form>
                <a href={`mailto:${r.email}`} className="btn btn-ghost !h-9 !text-sm">Reply</a>
                <form action={deleteRequest} className="ml-auto flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input name="confirm" placeholder='Type "DELETE"' aria-label="Type DELETE to confirm" className="h-9 w-32 rounded-full bg-paper px-3 text-xs ring-1 ring-line" />
                  <button className="btn !h-9 bg-coral-soft !text-sm text-coral">Delete</button>
                </form>
              </div>
            </details>
          </li>
        ))}
        {res.ok && rows.length === 0 && <li className="rounded-[1.25rem] bg-white p-10 text-center text-muted ring-1 ring-line">No requests match these filters.</li>}
      </ul>
    </Shell>
  );
}
