#!/usr/bin/env python3
"""Creates (or updates) and activates the "NEUVIA · Early Access" workflow through the n8n public API.

Env: N8N_URL (default https://n8n.santiagoorj.beer), N8N_API_KEY (omit when a proxy injects it),
     WEBHOOK_SECRET, RPC_SECRET, optional EMAIL_CRED_MATCH (default "proyectum").
The ProyectumIA email credential is detected from existing workflows (SMTP or Gmail).
"""
import json, os, subprocess, sys, urllib.request

BASE = os.environ.get("N8N_URL", "https://n8n.santiagoorj.beer").rstrip("/") + "/api/v1"
KEY = os.environ.get("N8N_API_KEY", "proxy-injected")
HERE = os.path.dirname(os.path.abspath(__file__))

def api(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"X-N8N-API-KEY": KEY, "Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b"{}")

def all_workflows():
    out, cursor = [], None
    while True:
        d = api("GET", "/workflows?limit=250" + (f"&cursor={cursor}" if cursor else ""))
        out += d.get("data", [])
        cursor = d.get("nextCursor")
        if not cursor: return out

def main():
    for v in ("WEBHOOK_SECRET", "RPC_SECRET"):
        if not os.environ.get(v): sys.exit(f"missing {v}")
    wfs = all_workflows()
    match = os.environ.get("EMAIL_CRED_MATCH", "proyectum").lower()
    found = {}
    for w in wfs:
        for n in w.get("nodes", []):
            for ctype, c in (n.get("credentials") or {}).items():
                if ctype in ("smtp", "gmailOAuth2") and match in str(c.get("name", "")).lower():
                    found[(ctype, c.get("id"), c.get("name"))] = True
    if not found: sys.exit(f"No SMTP/Gmail credential whose name contains '{match}' is used by any workflow. Set EMAIL_CRED_ID/EMAIL_CRED_NAME/EMAIL_NODE manually.")
    ctype, cid, cname = sorted(found, key=lambda k: k[0] != "smtp")[0]
    print(f"email credential: {cname} ({ctype}, id {cid})")
    env = dict(os.environ, EMAIL_NODE="smtp" if ctype == "smtp" else "gmail", EMAIL_CRED_ID=cid, EMAIL_CRED_NAME=cname)
    wf = json.loads(subprocess.check_output([sys.executable, os.path.join(HERE, "build-workflow.py")], env=env))
    existing = next((w for w in wfs if w.get("name") == wf["name"]), None)
    if existing:
        api("PUT", f"/workflows/{existing['id']}", wf); wid = existing["id"]; print("updated", wid)
    else:
        wid = api("POST", "/workflows", wf)["id"]; print("created", wid)
    api("POST", f"/workflows/{wid}/activate"); print("activated", wid)

if __name__ == "__main__":
    main()
