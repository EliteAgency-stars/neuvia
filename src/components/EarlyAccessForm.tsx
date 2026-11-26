"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { accessRequestSchema, ORG_TYPES, INTERESTS } from "@/lib/validation";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

type T = Dictionary["form"];
type State = "idle" | "sending" | "success" | "error";

const field = "mt-1.5 block w-full rounded-2xl border-0 bg-white/80 px-4 py-3 text-[0.9375rem] text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-shadow placeholder:text-ink/35 focus:bg-white focus:shadow-[inset_0_0_0_2px_var(--color-jade-deep)] focus:outline-none aria-[invalid=true]:shadow-[inset_0_0_0_2px_var(--color-coral)]";

export function EarlyAccessForm({ t, locale, privacyHref, contactEmail, defaultInterest }: { t: T; locale: Locale; privacyHref: string; contactEmail: string; defaultInterest?: string }) {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const startedAt = useRef(Date.now());
  const key = useRef<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => { key.current = crypto.randomUUID(); startedAt.current = Date.now(); }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") || ""),
      email: String(fd.get("email") || ""),
      organization: String(fd.get("organization") || ""),
      role: String(fd.get("role") || ""),
      country: String(fd.get("country") || ""),
      orgType: String(fd.get("orgType") || ""),
      interest: String(fd.get("interest") || ""),
      infrastructure: String(fd.get("infrastructure") || ""),
      problem: String(fd.get("problem") || ""),
      message: String(fd.get("message") || ""),
      privacyAccepted: fd.get("privacyAccepted") === "on",
      newsletter: fd.get("newsletter") === "on",
      locale,
      website: String(fd.get("website") || ""),
      startedAt: startedAt.current,
      idempotencyKey: key.current || crypto.randomUUID(),
    };
    const parsed = accessRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (errs[k]) continue;
        errs[k] = k === "email" ? t.invalidEmail : k === "problem" && payload.problem.trim().length > 0 ? t.tooShort : t.required;
      }
      setErrors(errs);
      setState("error");
      setMessage(t.errorValidation);
      const first = formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    setErrors({});
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/early-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: string[] };
      if (res.ok && data.ok) {
        setState("success");
        formRef.current?.reset();
        setTimeout(() => statusRef.current?.focus(), 50);
        return;
      }
      setState("error");
      if (res.status === 503 || data.error === "not_configured") setMessage(t.errorConfig);
      else if (res.status === 429) setMessage(t.errorRate);
      else if (data.error === "secret_detected") { setMessage(t.warning); setErrors({ problem: t.warning }); }
      else if (data.error === "validation") { setMessage(t.errorValidation); setErrors(Object.fromEntries((data.fields || []).map((f) => [f, t.required]))); }
      else setMessage(t.errorGeneric);
    } catch {
      setState("error");
      setMessage(t.errorGeneric);
    }
  }

  if (state === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="glass flex flex-col items-center !rounded-[1.75rem] px-6 py-16 text-center outline-none">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-jade-deep"><CheckCircle2 className="h-7 w-7" aria-hidden /></span>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">{t.successTitle}</h2>
        <p className="mt-3 max-w-md text-muted">{t.successBody}</p>
      </div>
    );
  }

  const err = (k: string) => errors[k] ? <p id={`${k}-err`} className="mt-1.5 text-xs font-medium text-coral">{errors[k]}</p> : null;
  const aria = (k: string) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });
  const L = ({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) => (
    <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-ink/85">{children}{optional ? <span className="ml-1 font-normal text-ink/45">({t.optional})</span> : <span className="ml-0.5 text-coral" aria-hidden>*</span>}</label>
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="glass !rounded-[1.75rem] p-6 sm:p-9" aria-describedby="form-warning">
      <div id="form-warning" className="flex gap-3 rounded-2xl bg-coral-soft px-4 py-3 text-[0.8125rem] leading-relaxed text-ink/80 ring-1 ring-coral/15">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden />{t.warning}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div><L htmlFor="fullName">{t.fullName}</L><input id="fullName" name="fullName" autoComplete="name" required maxLength={120} className={field} {...aria("fullName")} />{err("fullName")}</div>
        <div><L htmlFor="email">{t.email}</L><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={field} {...aria("email")} />{err("email")}</div>
        <div><L htmlFor="organization">{t.organization}</L><input id="organization" name="organization" autoComplete="organization" required maxLength={160} className={field} {...aria("organization")} />{err("organization")}</div>
        <div><L htmlFor="role">{t.role}</L><input id="role" name="role" autoComplete="organization-title" required maxLength={120} className={field} {...aria("role")} />{err("role")}</div>
        <div><L htmlFor="country" optional>{t.country}</L><input id="country" name="country" autoComplete="country-name" maxLength={80} className={field} /></div>
        <div>
          <L htmlFor="orgType">{t.orgType}</L>
          <select id="orgType" name="orgType" required defaultValue="" className={field} {...aria("orgType")}>
            <option value="" disabled>{t.select}</option>
            {ORG_TYPES.map((o) => <option key={o} value={o}>{t.orgTypes[o]}</option>)}
          </select>{err("orgType")}
        </div>
        <div className="sm:col-span-2">
          <fieldset>
            <legend className="text-[0.8125rem] font-medium text-ink/85">{t.interest}<span className="ml-0.5 text-coral" aria-hidden>*</span></legend>
            <div className="mt-2 flex flex-wrap gap-2" {...(errors.interest ? { "aria-describedby": "interest-err" } : {})}>
              {INTERESTS.map((i) => (
                <label key={i} className="cursor-pointer">
                  <input type="radio" name="interest" value={i} defaultChecked={i === defaultInterest} className="peer sr-only" />
                  <span className="inline-block rounded-full bg-white/80 px-3.5 py-2 text-[0.8125rem] font-medium text-ink/75 shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-all peer-checked:bg-ink peer-checked:text-white peer-checked:shadow-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-jade-deep">{t.interests[i]}</span>
                </label>
              ))}
            </div>
          </fieldset>{err("interest")}
        </div>
        <div className="sm:col-span-2"><L htmlFor="infrastructure" optional>{t.infra}</L><input id="infrastructure" name="infrastructure" maxLength={300} className={field} placeholder="e.g. open-weight models, hosted APIs, agent framework" /></div>
        <div className="sm:col-span-2"><L htmlFor="problem">{t.problem}</L><textarea id="problem" name="problem" required minLength={20} maxLength={4000} rows={5} className={field} {...aria("problem")} />{err("problem")}</div>
        <div className="sm:col-span-2"><L htmlFor="message" optional>{t.message}</L><textarea id="message" name="message" maxLength={4000} rows={3} className={field} /></div>
      </div>

      {/* Honeypot — hidden from humans and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-7 space-y-3 border-t border-line pt-6">
        <label className="flex items-start gap-3 text-sm text-ink/80">
          <input type="checkbox" name="privacyAccepted" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#00785A]" {...aria("privacyAccepted")} />
          <span>{t.privacy} <Link href={privacyHref} className="font-medium text-jade-deep underline underline-offset-2">{t.privacyLink}</Link>.<span className="ml-0.5 text-coral" aria-hidden>*</span></span>
        </label>
        {err("privacyAccepted")}
        <label className="flex items-start gap-3 text-sm text-ink/70">
          <input type="checkbox" name="newsletter" className="mt-0.5 h-4 w-4 shrink-0 accent-[#00785A]" />
          <span>{t.newsletter}</span>
        </label>
      </div>

      <div className="mt-7 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-5 text-sm">
          {state === "error" && message && (
            <p className="flex items-start gap-2 font-medium text-coral"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><span>{message}{message === t.errorConfig && <> <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a></>}</span></p>
          )}
        </div>
        <button type="submit" disabled={state === "sending"} className="btn btn-primary min-w-44 disabled:cursor-wait disabled:opacity-70">
          {state === "sending" ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{t.sending}</> : t.submit}
        </button>
      </div>
    </form>
  );
}
