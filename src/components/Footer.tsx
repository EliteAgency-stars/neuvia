import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

export function Footer({ locale, t, nav }: { locale: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  const h = (p: string) => localePath(locale, p);
  const cols: { title: string; links: [string, string, boolean?][] }[] = [
    { title: t.explore, links: [[nav.technology, h("/technology")], [nav.research, h("/research")], [nav.solutions, h("/solutions")], [nav.benchmarks, h("/benchmarks")], [nav.developers, h("/developers")]] },
    { title: t.company, links: [[nav.about, h("/about")], [nav.earlyAccess, h("/early-access")], [nav.contact, h("/contact")], [t.security, h("/security")]] },
    { title: t.resources, links: [[nav.aiAgents, h("/ai-agents")], ["llms.txt", "/llms.txt", true], ["llms-full.txt", "/llms-full.txt", true], ["neuvia.md", "/neuvia.md", true], ["project-info.json", "/api/public/project-info", true]] },
    { title: t.legal, links: [["Privacy", h("/privacy")], ["Terms", h("/terms")], ["Legal", h("/legal")]] },
  ];
  return (
    <footer className="relative mt-24 border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-[1.0625rem] font-medium tracking-tight text-ink">{t.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{site.definition}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-jade animate-pulse-dot" aria-hidden />
              {t.status}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/50">{c.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map(([label, href, raw]) => (
                    <li key={href}>
                      {raw ? (
                        <a href={href} className="font-mono text-[0.8125rem] text-ink/75 hover:text-jade-deep">{label}</a>
                      ) : (
                        <Link href={href} className="text-sm text-ink/75 hover:text-jade-deep">{label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NEUVIA · neuvia.co · {t.rights}</p>
          <a href={`mailto:${site.contact.email}`} className="hover:text-ink">{site.contact.email}</a>
        </div>
      </div>
    </footer>
  );
}
