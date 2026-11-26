import { site, absoluteUrl } from "@/lib/site";
export const dynamic = "force-static";
export function GET() {
  const expires = new Date(Date.parse(site.lastUpdated) + 1000 * 60 * 60 * 24 * 330).toISOString();
  const body = `Contact: mailto:${site.contact.security}
Expires: ${expires}
Preferred-Languages: en, es, de
Canonical: ${absoluteUrl("/.well-known/security.txt")}
Policy: ${absoluteUrl("/security")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
