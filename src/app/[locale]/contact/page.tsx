import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { PageHero, FounderCard } from "@/components/DocPage";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/i18n";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { site, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l).contactPage;
  return buildMetadata({ locale: l, path: "/contact", title: t.title, description: t.lead });
}

export default async function Contact({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const d = getDictionary(locale);
  const t = d.contactPage;
  const items = [
    { icon: Mail, label: t.email, value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Phone, label: t.phone, value: site.contact.phoneEurope, href: site.contact.phoneEuropeHref },
    { icon: MessageCircle, label: t.whatsapp, value: site.contact.whatsapp, href: site.contact.whatsappHref, external: true },
  ];
  return (
    <>
      <PageHero eyebrow={t.title} heading={t.heading} lead={t.lead} />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ul className="grid gap-3 md:grid-cols-3">
          {items.map(({ icon: Icon, label, value, href, external }) => (
            <li key={label}>
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="glass group flex h-full flex-col !rounded-[1.5rem] p-6 transition-transform duration-500 hover:-translate-y-0.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-jade-deep"><Icon className="h-5 w-5" aria-hidden /></span>
                <span className="mt-8 text-xs font-medium uppercase tracking-[0.08em] text-ink/50">{label}</span>
                <span className="mt-1 text-lg font-semibold tracking-tight group-hover:text-jade-deep">{value}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link href={localePath(locale, "/early-access")} className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-ink p-6 text-white transition-colors hover:bg-ink-2">
            <span className="text-[0.9375rem]">{t.formCta}</span><ArrowRight className="h-5 w-5 shrink-0 text-jade-bright" aria-hidden />
          </Link>
          <Link href={localePath(locale, "/security")} className="flex items-center gap-4 rounded-[1.5rem] bg-paper p-6 ring-1 ring-line hover:ring-ink/30">
            <ShieldCheck className="h-6 w-6 shrink-0 text-jade-deep" aria-hidden />
            <span><span className="block font-semibold">{t.security}</span><span className="text-sm text-muted">{t.securityBody}</span></span>
          </Link>
        </div>
        <section className="mt-24" aria-label={d.about.founderEyebrow}>
          <FounderCard t={d} />
        </section>
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", url: absoluteUrl(localePath(locale, "/contact")), name: t.title, inLanguage: locale, about: { "@id": `${site.url}/#organization` } }} />
    </>
  );
}
