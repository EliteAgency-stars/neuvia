import type { Metadata } from "next";
import { site, absoluteUrl } from "./site";
import { locales, localePath, ogLocale, type Locale } from "@/i18n/config";

type MetaInput = {
  locale: Locale;
  path: string; // unprefixed path, e.g. "/technology"
  title: string;
  description: string;
  /** Locales that have a real translation of this page. Defaults to all. */
  translated?: readonly Locale[];
  type?: "website" | "article";
  noindex?: boolean;
  markdown?: string;
};

export function buildMetadata({ locale, path, title, description, translated = locales, type = "website", noindex, markdown }: MetaInput): Metadata {
  // Untranslated locale variants canonicalize to the English page to avoid duplicate content.
  const canonicalLocale = translated.includes(locale) ? locale : "en";
  const canonical = absoluteUrl(localePath(canonicalLocale, path));
  const languages: Record<string, string> = {};
  for (const l of translated) languages[l] = absoluteUrl(localePath(l, path));
  languages["x-default"] = absoluteUrl(localePath("en", path));
  const types: Record<string, string> | undefined = markdown ? { "text/markdown": absoluteUrl(markdown) } : undefined;

  return {
    title,
    description,
    metadataBase: new URL(site.url),
    alternates: { canonical, languages, types },
    openGraph: {
      type,
      url: canonical,
      siteName: site.name,
      title,
      description,
      locale: ogLocale[locale],
      images: [{ url: absoluteUrl("/brand/og-image.png"), width: 1200, height: 630, alt: `${site.name} — ${site.slogan}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/brand/og-image.png")] },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
