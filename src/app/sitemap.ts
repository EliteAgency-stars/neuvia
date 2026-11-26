import type { MetadataRoute } from "next";
import { DOCS } from "@/content/registry";
import { translatedLocales } from "@/content/types";
import { getArticles } from "@/lib/research";
import { locales, localePath, type Locale } from "@/i18n/config";
import { site, absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const modified = new Date(site.lastUpdated);
  const entry = (path: string, translated: readonly Locale[], priority: number): MetadataRoute.Sitemap =>
    translated.map((l) => ({
      url: absoluteUrl(localePath(l, path)),
      lastModified: modified,
      changeFrequency: "monthly" as const,
      priority: l === "en" ? priority : priority - 0.1,
      alternates: { languages: Object.fromEntries([...translated.map((x) => [x, absoluteUrl(localePath(x, path))]), ["x-default", absoluteUrl(path)]]) },
    }));
  return [
    ...entry("/", locales, 1),
    ...entry("/early-access", locales, 0.8),
    ...entry("/contact", locales, 0.6),
    ...Object.entries(DOCS).flatMap(([path, doc]) => entry(path, translatedLocales(doc), path.match(/privacy|terms|legal/) ? 0.3 : 0.8)),
    ...entry("/research", ["en"], 0.8),
    ...getArticles().map((a) => ({ url: absoluteUrl(`/research/${a.slug}`), lastModified: new Date(a.date), changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}
