import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Crawler policy. Configurable with AI_TRAINING_CRAWLERS=allow|disallow (default: allow).
 * - Search & answer engines (indexing for search results): allowed.
 * - User-triggered retrieval (an assistant fetching a page on a user's request): allowed.
 * - Training-data collection: governed by AI_TRAINING_CRAWLERS.
 * Agent names follow each provider's published documentation; not every provider honours robots.txt identically.
 */
const SEARCH = ["Googlebot", "Bingbot", "DuckDuckBot", "Applebot", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const USER_FETCH = ["ChatGPT-User", "Claude-User", "Perplexity-User"];
const TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent"];
const PRIVATE = ["/admin", "/api/"];

export default function robots(): MetadataRoute.Robots {
  const training = (process.env.AI_TRAINING_CRAWLERS || "allow").toLowerCase() !== "disallow";
  return {
    rules: [
      { userAgent: [...SEARCH, ...USER_FETCH], allow: ["/", "/api/public/"], disallow: PRIVATE },
      { userAgent: TRAINING, ...(training ? { allow: ["/", "/api/public/"], disallow: PRIVATE } : { disallow: "/" }) },
      { userAgent: "*", allow: ["/", "/api/public/"], disallow: PRIVATE },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
