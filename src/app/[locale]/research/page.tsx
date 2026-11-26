import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Clock } from "lucide-react";
import { PageHero, FallbackNotice } from "@/components/DocPage";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { getDictionary } from "@/i18n";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { getArticles, CATEGORIES, UPCOMING } from "@/lib/research";
import { site, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  return buildMetadata({ locale: l, path: "/research", title: "Research — Synthetic neuropsychology and cognitive reliability", description: "Editorial research notes from NEUVIA on synthetic neuropsychology, artificial metacognition, interpretability, cognitive reliability and AI safety.", translated: ["en"] });
}

export default async function Research({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  const articles = getArticles();
  const [lead, ...rest] = articles;
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "NEUVIA Research",
    url: absoluteUrl("/research"),
    isPartOf: { "@id": `${site.url}/#website` },
    hasPart: articles.map((a) => ({ "@type": "Article", headline: a.title, url: absoluteUrl(`/research/${a.slug}`), datePublished: a.date })),
  };
  return (
    <div lang={locale === "en" ? undefined : "en"}>
      <PageHero eyebrow={t.nav.research} heading="Research notes on the reliability of artificial minds." lead="Original editorial writing that explains the foundations of NEUVIA. These are not peer-reviewed publications; future scientific work will be published separately, with methods and data." />
      {locale !== "en" && <FallbackNotice text={t.common.fallback} />}
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ul className="flex flex-wrap gap-2" aria-label="Categories">
          {CATEGORIES.map((c) => {
            const n = articles.filter((a) => a.category === c).length;
            return <li key={c} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ${n ? "bg-white text-ink ring-line" : "text-ink/40 ring-line/60"}`}>{c}{n ? <span className="ml-1.5 font-mono text-jade-deep">{n}</span> : null}</li>;
          })}
        </ul>

        {lead && (
          <Reveal className="mt-12">
            <Link href={localePath(locale, `/research/${lead.slug}`)} className="group relative isolate block overflow-hidden rounded-[2rem] p-8 ring-1 ring-line sm:p-12">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_90%_10%,rgb(0_200_150/0.18),transparent_70%),linear-gradient(180deg,#fff,#F6FAF8)]" aria-hidden />
              <p className="eyebrow">{lead.category}</p>
              <h2 className="mt-4 max-w-3xl text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em]">{lead.title}</h2>
              <p className="lead mt-4 max-w-2xl">{lead.description}</p>
              <p className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-jade-deep">{t.common.readMore} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></p>
            </Link>
          </Reveal>
        )}

        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {rest.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={(i % 2) * 0.06}>
              <Link href={localePath(locale, `/research/${a.slug}`)} className="group flex h-full flex-col rounded-[1.5rem] bg-white p-7 ring-1 ring-line transition-shadow hover:shadow-[0_20px_44px_-26px_rgb(11_23_20/0.4)]">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-jade-deep">{a.category}</p>
                <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight">{a.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{a.description}</p>
                <p className="mt-6 flex items-center gap-2 text-xs text-ink/50"><Clock className="h-3.5 w-3.5" aria-hidden />{a.readingTime} min · Editorial</p>
              </Link>
            </Reveal>
          ))}
        </ul>

        <section className="mt-20" aria-labelledby="upcoming">
          <h2 id="upcoming" className="text-sm font-semibold uppercase tracking-[0.08em] text-ink/50">In preparation</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {UPCOMING.map((u) => <li key={u} className="flex items-center justify-between gap-4 py-4 text-[1.0625rem] text-ink/60"><span>{u}</span><span className="shrink-0 font-mono text-xs text-ink/40">upcoming</span></li>)}
          </ul>
        </section>
      </div>
      <JsonLd data={ld} />
    </div>
  );
}
