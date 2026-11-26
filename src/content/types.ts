import type { Locale } from "@/i18n/config";

export type Ref = { authors: string; title: string; venue: string; year: string; url: string };

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "cards"; items: { title: string; body: string; tag?: string; list?: string[] }[]; columns?: 2 | 3 }
  | { type: "steps"; items: { title: string; body: string }[] }
  | { type: "table"; caption: string; head: string[]; rows: string[][] }
  | { type: "callout"; tone?: "note" | "warning"; title?: string; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "refs"; items: Ref[] }
  | { type: "widget"; name: "ncri" | "integration" | "form" | "contact" | "founder" };

export type Section = { id: string; eyebrow?: string; title: string; lead?: string; blocks: Block[] };

export type PageDoc = {
  path: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  heading: string;
  lead: string;
  sections: Section[];
  schemaType?: "WebPage" | "TechArticle" | "AboutPage" | "ContactPage";
};

export type Localized<T> = { en: T } & Partial<Record<Exclude<Locale, "en">, T>>;

export function pick<T>(content: Localized<T>, locale: Locale): { data: T; fallback: boolean } {
  const data = content[locale];
  return data ? { data, fallback: false } : { data: content.en, fallback: locale !== "en" };
}

export function translatedLocales<T>(content: Localized<T>): Locale[] {
  return (Object.keys(content) as Locale[]).filter((k) => !!content[k]);
}
