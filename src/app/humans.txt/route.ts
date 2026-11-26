import { site } from "@/lib/site";
export const dynamic = "force-static";
export function GET() {
  const body = `/* TEAM */
Founder & CEO: ${site.founder.name}
Contact: ${site.contact.email}

/* PROJECT */
Name: NEUVIA — ${site.slogan}
Site: ${site.url}
Status: ${site.status}

/* SITE */
Last update: ${site.lastUpdated}
Languages: English, Español, Deutsch
Standards: HTML5, CSS, WCAG 2.2 AA (target), schema.org
Components: Next.js, React, TypeScript, Tailwind CSS, Geist
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
