import "server-only";
import type { AccessRequest } from "./validation";

/**
 * Optional notification via Resend's HTTP API. Configure:
 * RESEND_API_KEY, CONTACT_RECIPIENT_EMAIL, EMAIL_FROM (verified sender).
 * Returns "skipped" when not configured — the request is still stored.
 */
export async function notifyNewRequest(r: AccessRequest, id: string): Promise<"sent" | "skipped" | "failed"> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_RECIPIENT_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !to || !from) return "skipped";
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const rows: [string, string][] = [["Name", r.fullName], ["Email", r.email], ["Organization", r.organization], ["Role", r.role], ["Country", r.country || "—"], ["Organization type", r.orgType], ["Interest", r.interest], ["Infrastructure", r.infrastructure || "—"], ["Problem", r.problem], ["Message", r.message || "—"], ["Newsletter consent", r.newsletter ? "yes" : "no"], ["Locale", r.locale]];
  const html = `<h2>New NEUVIA request</h2><p>ID: ${esc(id)}</p><table cellpadding="6" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#56655F;vertical-align:top"><b>${esc(k)}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: r.email, subject: `NEUVIA · ${r.interest} · ${r.organization}`, html }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
