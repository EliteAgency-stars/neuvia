import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/i18n";
import { isLocale, locales, localePath, type Locale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { getArticle, getArticles, renderMarkdown } from "@/lib/research";
import { site, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => getArticles().map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  const l = (isLocale(locale) ? locale : "en") as Locale;
  return buildMetadata({ locale: l, path: `/research/${slug}`, title: a.title, description: a.description, translated: ["en"], type: "article", markdown: `/md/research/${slug}` });
}

export default async function ArticlePage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const a = getArticle(slug);
  if (!a) notFound();
  const t = getDictionary(locale);
  const html = renderMarkdown(a.body);
  const others = getArticles().filter((x) => x.slug !== slug).slice(0, 2);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.date,
    inLanguage: "en",
    articleSection: a.category,
    url: absoluteUrl(`/research/${slug}`),
    author: { "@id": `${site.url}/#organization` },
    publisher: { "@id": `${site.url}/#organization` },
    isPartOf: { "@id": `${site.url}/#website` },
  };
  return (
    <article lang="en" className="relative">
      <header className="relative isolate overflow-hidden pb-10 pt-32 sm:pt-40">
        <div className="aurora pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden />
        <div className="animate-rise mx-auto max-w-3xl px-5 sm:px-8">
          <Link href={localePath(locale, "/research")} className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden />{t.common.backToResearch}</Link>
          <p className="eyebrow mt-10">{a.category}</p>
          <h1 className="mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.04em]">{a.title}</h1>
          <p className="lead mt-5">{a.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4 text-xs text-ink/55">
            <span>NEUVIA Research</span>
            <time dateTime={a.date}>{a.date}</time>
            <span>{a.readingTime} min read</span>
            <a href={`/md/research/${slug}`} className="inline-flex items-center gap-1.5 hover:text-jade-deep"><FileText className="h-3.5 w-3.5" aria-hidden />Markdown</a>
          </div>
          <p className="mt-4 rounded-2xl bg-mist px-4 py-3 text-sm text-ink/70">{t.common.editorialNote}</p>
        </div>
      </header>
      <div className="prose-neuvia mx-auto max-w-3xl px-5 sm:px-8" dangerouslySetInnerHTML={{ __html: html }} />
      {others.length > 0 && (
        <nav aria-label="More research" className="mx-auto mt-20 max-w-3xl px-5 sm:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-ink/50">Continue reading</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}><Link href={localePath(locale, `/research/${o.slug}`)} className="block h-full rounded-[1.25rem] bg-paper p-5 ring-1 ring-line hover:ring-ink/30"><p className="font-mono text-[0.6875rem] uppercase tracking-wider text-jade-deep">{o.category}</p><p className="mt-2 font-semibold leading-snug">{o.title}</p></Link></li>
            ))}
          </ul>
        </nav>
      )}
      <JsonLd data={ld} />
    </article>
  );
}
