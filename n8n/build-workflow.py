#!/usr/bin/env python3
"""Generates the NEUVIA early-access n8n workflow.

Usage:
  python3 n8n/build-workflow.py > n8n/neuvia-early-access.json            # placeholders (safe to commit)
  WEBHOOK_SECRET=... RPC_SECRET=... EMAIL_CRED_ID=... EMAIL_CRED_NAME=... EMAIL_NODE=smtp|gmail \
    python3 n8n/build-workflow.py > /tmp/deploy.json                       # deployable copy (never commit)
"""
import json, os

WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "{{SET_WEBHOOK_SECRET}}")
RPC_SECRET = os.environ.get("RPC_SECRET", "{{SET_RPC_SECRET}}")
EMAIL_NODE = os.environ.get("EMAIL_NODE", "smtp")
EMAIL_CRED_ID = os.environ.get("EMAIL_CRED_ID", "")
EMAIL_CRED_NAME = os.environ.get("EMAIL_CRED_NAME", "ProyectumIA")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "NEUVIA <founder@proyectumia.com>")
FOUNDER_EMAIL = os.environ.get("FOUNDER_EMAIL", "founder@proyectumia.com")
SITE = os.environ.get("SITE_URL", "https://neuvia.co")
SUPABASE_URL = "https://opagblruzwsrxsggkjsa.supabase.co"
SUPABASE_KEY = "sb_publishable_O30dPx3jfAA3m2CUnw7nCQ_jsuZiwRj"

VALIDATE = r"""
// Verifies the shared secret sent by neuvia.co and re-validates every field (defence in depth).
const SECRET = '__WEBHOOK_SECRET__';
const req = $input.first().json;
const given = String((req.headers || {})['x-neuvia-secret'] || '');
let diff = given.length ^ SECRET.length;
for (let i = 0; i < Math.max(given.length, SECRET.length); i++) diff |= (given.charCodeAt(i) || 0) ^ (SECRET.charCodeAt(i) || 0);
if (diff !== 0 || SECRET.startsWith('{{')) return [{ json: { valid: false, status: 401, body: { ok: false, error: 'unauthorized' } } }];

const b = req.body || {};
const ORG = ['ai_lab','model_developer','enterprise','startup','academic','public_sector','investor','independent','other'];
const INT = ['early_access','research_collaboration','enterprise_integration','model_evaluation','technical_partnership','academic_collaboration','investment','developer_access','general'];
const s = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '');
const p = {
  fullName: s(b.fullName, 120), email: s(b.email, 254).toLowerCase(), organization: s(b.organization, 160), role: s(b.role, 120),
  country: s(b.country, 80), orgType: s(b.orgType, 40), interest: s(b.interest, 40), infrastructure: s(b.infrastructure, 300),
  problem: s(b.problem, 4000), message: s(b.message, 4000), privacyAccepted: b.privacyAccepted === true, newsletter: b.newsletter === true,
  locale: ['en','es','de'].includes(b.locale) ? b.locale : 'en', idempotencyKey: s(b.idempotencyKey, 36), ipHash: s(b.ipHash, 64), userAgent: s(b.userAgent, 300),
};
const errors = [];
if (p.fullName.length < 2) errors.push('fullName');
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) errors.push('email');
if (!p.organization) errors.push('organization');
if (!p.role) errors.push('role');
if (!ORG.includes(p.orgType)) errors.push('orgType');
if (!INT.includes(p.interest)) errors.push('interest');
if (p.problem.length < 20) errors.push('problem');
if (!p.privacyAccepted) errors.push('privacyAccepted');
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.idempotencyKey)) errors.push('idempotencyKey');
if (errors.length) return [{ json: { valid: false, status: 422, body: { ok: false, error: 'validation', fields: errors } } }];
return [{ json: { valid: true, payload: p, rpc: { p, s: '__RPC_SECRET__' } } }];
""".replace("__WEBHOOK_SECRET__", WEBHOOK_SECRET).replace("__RPC_SECRET__", RPC_SECRET)

EMAILS = r"""
// Builds the two HTML emails (founder notification in Spanish, localized confirmation for the requester).
const raw = String($json.data ?? '').trim();
let id = null;
try { id = JSON.parse(raw); } catch (e) { id = null; }
const p = $('Validate request').first().json.payload;
const SITE = '__SITE__';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nl = (v) => esc(v).replace(/\n/g, '<br>');

const INTEREST = {
  es: { early_access: 'Acceso anticipado', research_collaboration: 'Colaboración en investigación', enterprise_integration: 'Integración empresarial', model_evaluation: 'Evaluación de modelos de IA', technical_partnership: 'Alianza técnica', academic_collaboration: 'Colaboración académica', investment: 'Consultas de inversión', developer_access: 'Acceso para desarrolladores', general: 'Información general' },
  en: { early_access: 'Early access', research_collaboration: 'Research collaboration', enterprise_integration: 'Enterprise integration', model_evaluation: 'AI model evaluation', technical_partnership: 'Technical partnership', academic_collaboration: 'Academic collaboration', investment: 'Investment inquiries', developer_access: 'Developer access', general: 'General information' },
  de: { early_access: 'Early Access', research_collaboration: 'Forschungskooperation', enterprise_integration: 'Integration im Unternehmen', model_evaluation: 'Evaluation von KI-Modellen', technical_partnership: 'Technische Partnerschaft', academic_collaboration: 'Akademische Zusammenarbeit', investment: 'Investitionsanfragen', developer_access: 'Entwicklerzugang', general: 'Allgemeine Informationen' },
};
const ORG_ES = { ai_lab: 'Laboratorio de IA', model_developer: 'Desarrollador de modelos', enterprise: 'Empresa', startup: 'Startup', academic: 'Institución académica', public_sector: 'Sector público', investor: 'Inversor', independent: 'Independiente', other: 'Otro' };

function layout({ preheader, eyebrow, title, intro, body, cta, footer, lang }) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F6FAF8;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F6FAF8;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6FAF8;"><tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
    <tr><td style="padding:0 8px 20px 8px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:12px;height:12px;background:#0B1714;border-radius:12px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="width:6px;font-size:0;">&nbsp;</td>
        <td style="width:12px;height:12px;background:#00C896;border-radius:12px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding-left:12px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:4px;color:#0B1714;">NEUVIA</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#FFFFFF;border:1px solid #E2EBE7;border-radius:20px;overflow:hidden;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="height:4px;background:#00C896;background-image:linear-gradient(90deg,#4F6BFF,#00C896,#2BF0B4);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:36px 36px 8px 36px;font-family:Helvetica,Arial,sans-serif;">
          <p style="margin:0 0 12px 0;font-family:'Courier New',monospace;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#00785A;">${esc(eyebrow)}</p>
          <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-0.5px;color:#0B1714;">${esc(title)}</h1>
          <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#56655F;">${intro}</p>
        </td></tr>
        <tr><td style="padding:0 36px 8px 36px;font-family:Helvetica,Arial,sans-serif;">${body}</td></tr>
        ${cta ? `<tr><td style="padding:16px 36px 36px 36px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#00C896;border-radius:999px;"><a href="${cta.href}" style="display:inline-block;padding:13px 24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#04221A;text-decoration:none;">${esc(cta.label)} &rarr;</a></td></tr></table></td></tr>` : '<tr><td style="height:28px;"></td></tr>'}
      </table>
    </td></tr>
    <tr><td style="padding:24px 12px 0 12px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#7A8984;">${footer}</td></tr>
  </table>
</td></tr></table></body></html>`;
}

const row = (k, v) => `<tr><td style="padding:10px 0;border-bottom:1px solid #E2EBE7;width:38%;vertical-align:top;font-size:13px;color:#7A8984;">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #E2EBE7;vertical-align:top;font-size:14px;color:#0B1714;">${v}</td></tr>`;

// —— Founder notification (Spanish) ——
const founderHtml = layout({
  lang: 'es',
  preheader: `${p.fullName} · ${p.organization} · ${INTEREST.es[p.interest]}`,
  eyebrow: 'Nueva solicitud · Acceso anticipado',
  title: `${p.fullName} quiere conectar con NEUVIA`,
  intro: `<strong style="color:#0B1714;">${esc(p.organization)}</strong> · ${esc(p.role)} — interés: <strong style="color:#00785A;">${esc(INTEREST.es[p.interest])}</strong>`,
  body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${row('Correo', `<a href="mailto:${esc(p.email)}" style="color:#00785A;">${esc(p.email)}</a>`)}
    ${row('Organización', esc(p.organization))}
    ${row('Cargo', esc(p.role))}
    ${row('Tipo', esc(ORG_ES[p.orgType] || p.orgType))}
    ${row('País', esc(p.country || '—'))}
    ${row('Infraestructura IA', esc(p.infrastructure || '—'))}
    ${row('Idioma', esc(p.locale.toUpperCase()))}
    ${row('Novedades', p.newsletter ? 'Sí, aceptó recibir novedades' : 'No')}
  </table>
  <p style="margin:24px 0 8px 0;font-size:13px;color:#7A8984;">Problema que quiere resolver</p>
  <div style="padding:16px 18px;background:#E9FCF5;border-radius:14px;font-size:15px;line-height:1.6;color:#0B1714;">${nl(p.problem)}</div>
  ${p.message ? `<p style="margin:20px 0 8px 0;font-size:13px;color:#7A8984;">Mensaje adicional</p><div style="padding:16px 18px;background:#F6FAF8;border-radius:14px;font-size:15px;line-height:1.6;color:#0B1714;">${nl(p.message)}</div>` : ''}
  <p style="margin:20px 0 0 0;font-size:12px;color:#7A8984;">ID: ${esc(id)} · Responde a este correo para contestar directamente a ${esc(p.fullName)}.</p>`,
  cta: { href: `${SITE}/admin`, label: 'Abrir panel de solicitudes' },
  footer: 'NEUVIA · Intelligence caring for intelligence.<br>Notificación interna generada por el flujo de n8n «NEUVIA · Early Access». Contiene datos personales: no la reenvíes.',
});

// —— Requester confirmation (localized) ——
const T = {
  en: { pre: 'We received your request — here is what happens next.', eyebrow: 'Request received', title: `Thank you, ${p.fullName.split(' ')[0]}.`, intro: 'Your request to collaborate with NEUVIA has been received and stored securely. A member of the team will review it personally.', next: 'What happens next', steps: ['We review every request individually.', 'If there is a fit with our current research phase, we will contact you by email.', 'NEUVIA is a research and development initiative: no product is publicly available yet, and we will always be clear about what exists today.'], summary: 'Your request', interest: 'Area of interest', org: 'Organization', note: 'Please never send API keys, credentials or confidential model data by email.', cta: 'Explore NEUVIA', footer: 'You are receiving this email because you submitted the form at neuvia.co. If this was not you, simply ignore it or reply to let us know.', subject: 'NEUVIA · We received your request' },
  es: { pre: 'Recibimos tu solicitud — esto es lo que sigue.', eyebrow: 'Solicitud recibida', title: `Gracias, ${p.fullName.split(' ')[0]}.`, intro: 'Tu solicitud para colaborar con NEUVIA se ha recibido y guardado de forma segura. Una persona del equipo la revisará personalmente.', next: 'Qué sigue ahora', steps: ['Revisamos cada solicitud de forma individual.', 'Si encaja con nuestra fase actual de investigación, te contactaremos por correo.', 'NEUVIA es una iniciativa de investigación y desarrollo: todavía no hay ningún producto disponible públicamente y siempre seremos claros sobre lo que existe hoy.'], summary: 'Tu solicitud', interest: 'Área de interés', org: 'Organización', note: 'Nunca envíes claves API, credenciales ni datos confidenciales de modelos por correo.', cta: 'Explorar NEUVIA', footer: 'Recibes este correo porque enviaste el formulario de neuvia.co. Si no fuiste tú, ignóralo o respóndenos para avisarnos.', subject: 'NEUVIA · Recibimos tu solicitud' },
  de: { pre: 'Wir haben Ihre Anfrage erhalten — so geht es weiter.', eyebrow: 'Anfrage erhalten', title: `Vielen Dank, ${p.fullName.split(' ')[0]}.`, intro: 'Ihre Anfrage zur Zusammenarbeit mit NEUVIA ist eingegangen und wurde sicher gespeichert. Ein Teammitglied prüft sie persönlich.', next: 'Wie es weitergeht', steps: ['Wir prüfen jede Anfrage einzeln.', 'Wenn sie zu unserer aktuellen Forschungsphase passt, melden wir uns per E-Mail.', 'NEUVIA ist eine Forschungs- und Entwicklungsinitiative: Derzeit ist kein Produkt öffentlich verfügbar, und wir sind stets transparent darüber, was heute existiert.'], summary: 'Ihre Anfrage', interest: 'Interessenbereich', org: 'Organisation', note: 'Bitte senden Sie niemals API-Schlüssel, Zugangsdaten oder vertrauliche Modelldaten per E-Mail.', cta: 'NEUVIA entdecken', footer: 'Sie erhalten diese E-Mail, weil Sie das Formular auf neuvia.co ausgefüllt haben. Falls Sie das nicht waren, ignorieren Sie sie einfach oder antworten Sie uns.', subject: 'NEUVIA · Wir haben Ihre Anfrage erhalten' },
}[p.locale] || null;
const t = T;
const requesterHtml = layout({
  lang: p.locale,
  preheader: t.pre,
  eyebrow: t.eyebrow,
  title: t.title,
  intro: esc(t.intro),
  body: `<p style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#0B1714;">${esc(t.next)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${t.steps.map((st, i) => `<tr><td style="width:34px;vertical-align:top;padding:0 0 12px 0;"><div style="width:24px;height:24px;line-height:24px;text-align:center;border-radius:24px;background:#E9FCF5;color:#00785A;font-family:'Courier New',monospace;font-size:12px;font-weight:700;">${i + 1}</div></td><td style="vertical-align:top;padding:2px 0 12px 0;font-size:15px;line-height:1.55;color:#1E2C28;">${esc(st)}</td></tr>`).join('')}</table>
  <p style="margin:16px 0 4px 0;font-size:13px;font-weight:700;color:#0B1714;">${esc(t.summary)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${row(t.interest, esc(INTEREST[p.locale][p.interest]))}${row(t.org, esc(p.organization))}</table>
  <p style="margin:20px 0 0 0;padding:12px 14px;background:#FFF0EC;border-radius:12px;font-size:13px;line-height:1.5;color:#1E2C28;">${esc(t.note)}</p>`,
  cta: { href: SITE, label: t.cta },
  footer: `NEUVIA · Intelligence caring for intelligence.<br>${esc(t.footer)}<br><a href="${SITE}/privacy" style="color:#7A8984;">Privacy</a> · <a href="mailto:__FOUNDER__" style="color:#7A8984;">__FOUNDER__</a>`,
});

return [{ json: {
  id, duplicate: !id, payload: p,
  founder: { to: '__FOUNDER__', subject: `NEUVIA · Nueva solicitud: ${p.fullName} (${p.organization}) — ${INTEREST.es[p.interest]}`, html: founderHtml, replyTo: p.email },
  requester: { to: p.email, subject: t.subject, html: requesterHtml },
} }];
""".replace("__SITE__", SITE).replace("__FOUNDER__", FOUNDER_EMAIL)

def node(name, ntype, version, pos, params, **extra):
    n = {"parameters": params, "name": name, "type": ntype, "typeVersion": version, "position": pos}
    n.update(extra)
    return n

def respond(name, pos, code_expr, body_expr):
    return node(name, "n8n-nodes-base.respondToWebhook", 1.1, pos, {
        "respondWith": "json", "responseBody": body_expr,
        "options": {"responseCode": code_expr, "responseHeaders": {"entries": [{"name": "Cache-Control", "value": "no-store"}]}},
    })

def email(name, pos, prefix):
    cred = {"id": EMAIL_CRED_ID, "name": EMAIL_CRED_NAME}
    if EMAIL_NODE == "gmail":
        return node(name, "n8n-nodes-base.gmail", 2.1, pos, {
            "sendTo": f"={{{{ $('Build emails').first().json.{prefix}.to }}}}",
            "subject": f"={{{{ $('Build emails').first().json.{prefix}.subject }}}}",
            "emailType": "html",
            "message": f"={{{{ $('Build emails').first().json.{prefix}.html }}}}",
            "options": {"appendAttribution": False, "senderName": "NEUVIA", **({"replyTo": "={{ $('Build emails').first().json.founder.replyTo }}"} if prefix == "founder" else {})},
        }, credentials={"gmailOAuth2": cred}, onError="continueRegularOutput")
    return node(name, "n8n-nodes-base.emailSend", 2.1, pos, {
        "fromEmail": FROM_EMAIL,
        "toEmail": f"={{{{ $('Build emails').first().json.{prefix}.to }}}}",
        "subject": f"={{{{ $('Build emails').first().json.{prefix}.subject }}}}",
        "emailFormat": "html",
        "html": f"={{{{ $('Build emails').first().json.{prefix}.html }}}}",
        "options": {"appendAttribution": False, **({"replyTo": "={{ $('Build emails').first().json.founder.replyTo }}"} if prefix == "founder" else {})},
    }, credentials={"smtp": cred}, onError="continueRegularOutput")

nodes = [
    node("Webhook", "n8n-nodes-base.webhook", 2, [0, 300], {"httpMethod": "POST", "path": "neuvia-early-access", "responseMode": "responseNode", "options": {}}, webhookId="neuvia-early-access"),
    node("Validate request", "n8n-nodes-base.code", 2, [220, 300], {"jsCode": VALIDATE}),
    node("Valid?", "n8n-nodes-base.if", 2.2, [440, 300], {
        "conditions": {"options": {"caseSensitive": True, "typeValidation": "strict", "version": 2}, "combinator": "and",
                       "conditions": [{"id": "v1", "leftValue": "={{ $json.valid }}", "rightValue": True, "operator": {"type": "boolean", "operation": "true", "singleValue": True}}]},
        "options": {}}),
    respond("Reject", [660, 480], "={{ $json.status }}", "={{ JSON.stringify($json.body) }}"),
    node("Store in Supabase", "n8n-nodes-base.httpRequest", 4.2, [660, 220], {
        "method": "POST", "url": f"{SUPABASE_URL}/rest/v1/rpc/neuvia_submit_request",
        "sendHeaders": True, "headerParameters": {"parameters": [{"name": "apikey", "value": SUPABASE_KEY}]},
        "sendBody": True, "specifyBody": "json", "jsonBody": "={{ JSON.stringify($json.rpc) }}",
        "options": {"response": {"response": {"responseFormat": "text", "outputPropertyName": "data"}}, "timeout": 10000},
    }, onError="continueErrorOutput"),
    respond("Storage error", [880, 420], "=502", "={{ JSON.stringify({ ok: false, error: 'storage_failed' }) }}"),
    node("Build emails", "n8n-nodes-base.code", 2, [880, 200], {"jsCode": EMAILS}),
    node("New request?", "n8n-nodes-base.if", 2.2, [1100, 200], {
        "conditions": {"options": {"caseSensitive": True, "typeValidation": "strict", "version": 2}, "combinator": "and",
                       "conditions": [{"id": "n1", "leftValue": "={{ $json.duplicate }}", "rightValue": False, "operator": {"type": "boolean", "operation": "false", "singleValue": True}}]},
        "options": {}}),
    respond("Respond duplicate", [1320, 340], "=200", "={{ JSON.stringify({ ok: true, duplicate: true }) }}"),
    respond("Respond created", [1320, 120], "=201", "={{ JSON.stringify({ ok: true, id: $json.id }) }}"),
    email("Email founder", [1540, 120], "founder"),
    email("Email requester", [1760, 120], "requester"),
    node("Mark notified", "n8n-nodes-base.httpRequest", 4.2, [1980, 120], {
        "method": "POST", "url": f"{SUPABASE_URL}/rest/v1/rpc/neuvia_mark_notified",
        "sendHeaders": True, "headerParameters": {"parameters": [{"name": "apikey", "value": SUPABASE_KEY}]},
        "sendBody": True, "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ rid: $('Build emails').first().json.id, s: $('Validate request').first().json.rpc.s }) }}",
        "options": {"timeout": 10000},
    }, onError="continueRegularOutput"),
]
connections = {
    "Webhook": {"main": [[{"node": "Validate request", "type": "main", "index": 0}]]},
    "Validate request": {"main": [[{"node": "Valid?", "type": "main", "index": 0}]]},
    "Valid?": {"main": [[{"node": "Store in Supabase", "type": "main", "index": 0}], [{"node": "Reject", "type": "main", "index": 0}]]},
    "Store in Supabase": {"main": [[{"node": "Build emails", "type": "main", "index": 0}], [{"node": "Storage error", "type": "main", "index": 0}]]},
    "Build emails": {"main": [[{"node": "New request?", "type": "main", "index": 0}]]},
    "New request?": {"main": [[{"node": "Respond created", "type": "main", "index": 0}], [{"node": "Respond duplicate", "type": "main", "index": 0}]]},
    "Respond created": {"main": [[{"node": "Email founder", "type": "main", "index": 0}]]},
    "Email founder": {"main": [[{"node": "Email requester", "type": "main", "index": 0}]]},
    "Email requester": {"main": [[{"node": "Mark notified", "type": "main", "index": 0}]]},
}
print(json.dumps({"name": "NEUVIA · Early Access", "nodes": nodes, "connections": connections,
                  "settings": {"executionOrder": "v1", "saveDataSuccessExecution": "none", "saveDataErrorExecution": "all", "saveManualExecutions": False}}, indent=2, ensure_ascii=False))
