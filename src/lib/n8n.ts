import "server-only";

/**
 * The early-access pipeline runs in n8n (workflow: n8n/neuvia-early-access.json):
 * webhook → validation → Supabase (secret-protected RPC) → HTML emails (ProyectumIA mailbox).
 */
export const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8n.santiagoorj.beer/webhook/neuvia-early-access";
const SECRET = process.env.N8N_WEBHOOK_SECRET || "";

export const n8nConfigured = () => SECRET.length >= 24;

export type N8nResult = { ok: boolean; status: number; id?: string; duplicate?: boolean; error?: string };

export async function sendToN8n(payload: Record<string, unknown>): Promise<N8nResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Neuvia-Secret": SECRET },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; duplicate?: boolean; error?: string };
    return { ok: res.ok && data.ok === true, status: res.status, id: data.id, duplicate: data.duplicate, error: data.error };
  } catch (e) {
    return { ok: false, status: 504, error: (e as Error).name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
