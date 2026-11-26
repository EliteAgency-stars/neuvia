import type { Metadata } from "next";
import { EarlyAccessForm } from "@/components/EarlyAccessForm";
import { PageHero } from "@/components/DocPage";
import { getDictionary } from "@/i18n";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l);
  return buildMetadata({ locale: l, path: "/early-access", title: t.form.title, description: t.home.access.lead });
}

export default async function EarlyAccess({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  return (
    <>
      <PageHero eyebrow={t.home.access.eyebrow} heading={t.home.access.title} lead={t.form.intro} />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_300px]">
        <EarlyAccessForm t={t.form} locale={locale} privacyHref={localePath(locale, "/privacy")} contactEmail={site.contact.email} />
        <aside className="space-y-6 text-sm text-muted lg:pt-4">
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-jade-deep">{t.common.status}</p>
            <p className="mt-2 leading-relaxed">{site.statusDetail}</p>
          </div>
          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-jade-deep">{t.nav.contact}</p>
            <a href={`mailto:${site.contact.email}`} className="mt-2 block font-medium text-ink hover:text-jade-deep">{site.contact.email}</a>
          </div>
        </aside>
      </div>
    </>
  );
}
