export const locales = ["en", "es", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = { en: "English", es: "Español", de: "Deutsch" };
export const localeHtml: Record<Locale, string> = { en: "en", es: "es", de: "de" };
export const ogLocale: Record<Locale, string> = { en: "en_US", es: "es_ES", de: "de_DE" };

export const isLocale = (v: string | undefined): v is Locale => !!v && (locales as readonly string[]).includes(v);

/** Path for a locale. English is served without prefix (canonical root). */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}
