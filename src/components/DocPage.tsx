import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, Info, Mail, Phone, MessageCircle, FileText } from "lucide-react";
import type { Block, Localized, PageDoc } from "@/content/types";
import { pick, translatedLocales } from "@/content/types";
import { NcriRadar } from "./NcriRadar";
import { Reveal } from "./Reveal";
import { JsonLd } from "./JsonLd";
import { getDictionary, type Dictionary } from "@/i18n";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { site, absoluteUrl } from "@/lib/site";

type Params = { params: Promise<{ locale: string }> };

export function IntegrationDiagram() {
  const levels = [
    { id: "Black-box", r: 132, fill: "#F6FAF8", stroke: "#CFDCD6", label: "Inputs · outputs · behavior" },
    { id: "Grey-box", r: 92, fill: "#E9FCF5", stroke: "#8BE6C9", label: "Logs · telemetry · probabilities" },
    { id: "White-box", r: 52, fill: "#C9F8E8", stroke: "#00C896", label: "Activations · representations" },
  ];
  return (
    <figure className="glass grid items-center gap-8 !rounded-[1.75rem] p-6 sm:p-8 md:grid-cols-[300px_1fr]">
      <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[300px]" role="img" aria-label="Concentric diagram: black-box access is the outer layer, grey-box the middle and white-box the inner core of an AI model.">
        {levels.map((l) => <circle key={l.id} cx="150" cy="150" r={l.r} fill={l.fill} stroke={l.stroke} strokeWidth="1.5" />)}
        <circle cx="150" cy="150" r="14" fill="#0B1714" />
        <circle cx="150" cy="150" r="22" fill="none" stroke="#00C896" strokeWidth="1.5" strokeDasharray="3 4" />
        <text x="150" y="30" textAnchor="middle" className="fill-ink/60 font-mono text-[10px] uppercase">black-box</text>
        <text x="150" y="70" textAnchor="middle" className="fill-ink/70 font-mono text-[10px] uppercase">grey-box</text>
        <text x="150" y="112" textAnchor="middle" className="fill-jade-deep font-mono text-[10px] uppercase">white-box</text>
      </svg>
      <figcaption>
        <ol className="space-y-4">
          {levels.map((l, i) => (
            <li key={l.id} className="flex gap-4">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full ring-2" style={{ background: l.fill, boxShadow: `0 0 0 2px ${l.stroke}` }} />
              <div>
                <p className="font-semibold tracking-tight">{l.id} <span className="ml-1 font-mono text-[0.6875rem] text-ink/45">L{i + 1}</span></p>
                <p className="text-sm text-muted">{l.label}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-muted">Deeper levels require explicit, stronger authorization from the operator — and are only possible where the model permits them.</p>
      </figcaption>
    </figure>
  );
}

export function FounderCard({ t }: { t: Dictionary }) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[300px_1fr] md:gap-12">
      <div className="relative mx-auto w-full max-w-[300px]">
        <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_70%_20%,rgb(0_200_150/0.35),transparent_70%),radial-gradient(60%_60%_at_20%_90%,rgb(79_107_255/0.25),transparent_70%)] blur-xl" aria-hidden />
        <div className="glass overflow-hidden !rounded-[1.75rem] p-2">
          <Image src={site.founder.image} alt={`${site.founder.name}, ${site.founder.role} of NEUVIA`} width={800} height={1000} sizes="(min-width: 768px) 300px, 90vw" className="aspect-[4/5] w-full rounded-[1.35rem] object-cover" />
        </div>
        <div className="glass absolute -bottom-4 left-1/2 w-max -translate-x-1/2 !rounded-full px-4 py-2 text-xs font-medium">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-jade align-middle" aria-hidden />{site.founder.role}
        </div>
      </div>
      <div>
        <p className="eyebrow">{t.about.founderEyebrow}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight">{site.founder.name}</h3>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink/80">{t.about.founderBody}</p>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          <li><a href={`mailto:${site.contact.email}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 ring-1 ring-line hover:ring-ink"><Mail className="h-4 w-4" aria-hidden />{site.contact.email}</a></li>
          <li><a href={site.contact.phoneEuropeHref} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 ring-1 ring-line hover:ring-ink"><Phone className="h-4 w-4" aria-hidden />{site.contact.phoneEurope}</a></li>
          <li><a href={site.contact.whatsappHref} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 ring-1 ring-line hover:ring-ink"><MessageCircle className="h-4 w-4" aria-hidden />WhatsApp</a></li>
        </ul>
      </div>
    </div>
  );
}

function BlockView({ b, t }: { b: Block; t: Dictionary }) {
  switch (b.type) {
    case "p":
      return <p className="max-w-3xl text-[1.0625rem] leading-[1.75] text-ink/80">{b.text}</p>;
    case "list":
      return (
        <ul className="max-w-3xl space-y-2.5">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3 text-[1.0625rem] leading-relaxed text-ink/80"><span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-jade" aria-hidden />{it}</li>
          ))}
        </ul>
      );
    case "cards":
      return (
        <ul className={`grid gap-3 ${b.columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
          {b.items.map((c, i) => (
            <Reveal as="li" key={c.title} delay={(i % 3) * 0.05} className="group rounded-[1.4rem] bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-[0_18px_40px_-24px_rgb(11_23_20/0.35)]">
              {c.tag && <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-jade-deep">{c.tag}</p>}
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              {c.list && (
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                  {c.list.map((x) => <li key={x} className="flex gap-2.5 text-sm text-ink/75"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/40" aria-hidden />{x}</li>)}
                </ul>
              )}
            </Reveal>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="relative max-w-3xl space-y-6 border-l border-line pl-8">
          {b.items.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[2.85rem] flex h-7 w-7 items-center justify-center rounded-full bg-white font-mono text-[0.6875rem] ring-1 ring-line-strong">{i + 1}</span>
              <h3 className="font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-[1.25rem] ring-1 ring-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">{b.caption}</caption>
            <thead className="bg-paper">
              <tr>{b.head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold text-ink">{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-line align-top">
                  {r.map((cell, j) => j === 0 ? <th key={j} scope="row" className="px-4 py-3 font-medium text-ink">{cell}</th> : <td key={j} className="px-4 py-3 text-ink/75">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const warn = b.tone === "warning";
      const Icon = warn ? AlertTriangle : Info;
      return (
        <div className={`flex max-w-3xl gap-3 rounded-[1.25rem] p-5 ${warn ? "bg-coral-soft ring-1 ring-coral/20" : "bg-mint-soft ring-1 ring-jade/25"}`} role="note">
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${warn ? "text-coral" : "text-jade-deep"}`} aria-hidden />
          <div className="text-[0.9375rem] leading-relaxed text-ink/85">
            {b.title && <p className="mb-1 font-semibold text-ink">{b.title}</p>}
            <p>{b.text}</p>
          </div>
        </div>
      );
    }
    case "code":
      return (
        <pre className="glass-dark max-w-3xl overflow-x-auto !rounded-[1.25rem] p-5 font-mono text-[0.8125rem] leading-relaxed text-white/85"><code>{b.code}</code></pre>
      );
    case "refs":
      return (
        <ol className="max-w-3xl space-y-3">
          {b.items.map((r, i) => (
            <li key={r.url} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-mono text-xs text-ink/40">[{i + 1}]</span>
              <span className="text-ink/80">{r.authors} ({r.year}). <a href={r.url} rel="noopener noreferrer" target="_blank" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-jade">{r.title}</a>. <span className="text-muted">{r.venue}.</span></span>
            </li>
          ))}
        </ol>
      );
    case "widget":
      if (b.name === "ncri") return <NcriRadar />;
      if (b.name === "integration") return <IntegrationDiagram />;
      if (b.name === "founder") return <FounderCard t={t} />;
      return null;
  }
}

export function PageHero({ eyebrow, heading, lead, children }: { eyebrow: string; heading: string; lead: string; children?: React.ReactNode }) {
  return (
    <header className="relative isolate overflow-hidden pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div className="aurora pointer-events-none absolute inset-0 -z-20 opacity-80" aria-hidden />
      <div className="grid-paper pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="animate-rise mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.04em]">{heading}</h1>
        <p className="lead mt-6 max-w-2xl">{lead}</p>
        {children}
      </div>
    </header>
  );
}

export function FallbackNotice({ text }: { text: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <p className="mb-8 inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm text-ink/75" lang="en"><Info className="h-4 w-4 text-jade-deep" aria-hidden />{text}</p>
    </div>
  );
}

export function DocBody({ doc, t }: { doc: PageDoc; t: Dictionary }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[200px_1fr]">
      <nav aria-label={t.common.onThisPage} className="hidden lg:block">
        <div className="sticky top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">{t.common.onThisPage}</p>
          <ul className="mt-4 space-y-2 border-l border-line">
            {doc.sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-sm text-ink/60 transition-colors hover:border-jade hover:text-ink">{s.title}</a></li>
            ))}
          </ul>
          <a href={`/md${doc.path}`} className="mt-8 inline-flex items-center gap-2 text-xs text-ink/50 hover:text-jade-deep"><FileText className="h-3.5 w-3.5" aria-hidden />{t.common.markdown}</a>
        </div>
      </nav>
      <div className="min-w-0 space-y-20 sm:space-y-24">
        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28">
            <Reveal>
              {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
              <h2 id={`${s.id}-h`} className={`${s.eyebrow ? "mt-3" : ""} text-[clamp(1.6rem,3vw,2.35rem)] font-semibold leading-[1.1] tracking-[-0.03em]`}>{s.title}</h2>
              {s.lead && <p className="lead mt-4 max-w-3xl">{s.lead}</p>}
            </Reveal>
            <div className="mt-8 space-y-6">
              {s.blocks.map((b, i) => <BlockView key={i} b={b} t={t} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Factory: metadata + page component for a localized content document. */
export function docRoute(content: Localized<PageDoc>) {
  const translated = translatedLocales(content);
  async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { locale } = await params;
    const l = (isLocale(locale) ? locale : "en") as Locale;
    const { data } = pick(content, l);
    return buildMetadata({ locale: l, path: data.path, title: data.metaTitle, description: data.description, translated, markdown: `/md${data.path}` });
  }
  async function Page({ params }: Params) {
    const { locale: raw } = await params;
    const locale = (isLocale(raw) ? raw : "en") as Locale;
    const t = getDictionary(locale);
    const { data, fallback } = pick(content, locale);
    const url = absoluteUrl(localePath(translated.includes(locale) ? locale : "en", data.path));
    const ld = [
      {
        "@context": "https://schema.org",
        "@type": data.schemaType ?? "WebPage",
        ...(data.schemaType === "TechArticle" ? { headline: data.heading, author: { "@id": `${site.url}/#organization` }, dateModified: site.lastUpdated } : { name: data.heading }),
        url,
        description: data.description,
        inLanguage: fallback ? "en" : locale,
        isPartOf: { "@id": `${site.url}/#website` },
        publisher: { "@id": `${site.url}/#organization` },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "NEUVIA", item: absoluteUrl(localePath(locale, "/")) },
          { "@type": "ListItem", position: 2, name: data.eyebrow, item: url },
        ],
      },
    ];
    return (
      <article lang={fallback ? "en" : undefined}>
        <PageHero eyebrow={data.eyebrow} heading={data.heading} lead={data.lead}>
          <p className="mt-8 font-mono text-xs text-ink/45">{t.common.updated}: {site.lastUpdated}</p>
        </PageHero>
        {fallback && <FallbackNotice text={t.common.fallback} />}
        <DocBody doc={data} t={t} />
        <aside className="mx-auto mt-24 max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-paper p-8 ring-1 ring-line sm:flex-row sm:items-center sm:p-10">
            <p className="max-w-xl text-xl font-medium tracking-tight">{t.home.access.title}</p>
            <Link href={localePath(locale, "/early-access")} className="btn btn-primary shrink-0">{t.nav.earlyAccess}</Link>
          </div>
        </aside>
        <JsonLd data={ld} />
      </article>
    );
  }
  return { generateMetadata, Page };
}
