import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/i18n";
import { isLocale, locales, localeHtml } from "@/i18n/config";
import { site, absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: { default: `${site.name} — ${site.slogan}`, template: `%s · ${site.name}` },
  description: site.definition,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  category: "technology",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/brand/neuvia-mark.svg", type: "image/svg+xml" }],
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/brand/site.webmanifest",
  formatDetection: { telephone: false, email: false, address: false },
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/brand/neuvia-mark.png"),
    description: site.definition,
    slogan: site.slogan,
    email: site.contact.email,
    founder: { "@type": "Person", name: site.founder.name, jobTitle: site.founder.role },
    knowsAbout: ["AI reliability", "AI safety", "Mechanistic interpretability", "Model evaluation", "AI observability", "Synthetic neuropsychology"],
    contactPoint: [{ "@type": "ContactPoint", contactType: "general inquiries", email: site.contact.email, availableLanguage: ["English", "Spanish", "German"] }],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.definition,
    inLanguage: ["en", "es", "de"],
    publisher: { "@id": `${site.url}/#organization` },
  };

  return (
    <html lang={localeHtml[locale]} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <Header locale={locale} t={t.nav} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer locale={locale} t={t.footer} nav={t.nav} />
        <JsonLd data={[org, website]} />
      </body>
    </html>
  );
}
