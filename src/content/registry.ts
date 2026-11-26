import type { Localized, PageDoc } from "./types";
import { technology, solutions, benchmarks, aiAgents, developers } from "./pages";
import { about, security, privacy, terms, legal } from "./company";

/** All structured content pages, keyed by unprefixed path. */
export const DOCS: Record<string, Localized<PageDoc>> = {
  "/technology": technology,
  "/solutions": solutions,
  "/benchmarks": benchmarks,
  "/ai-agents": aiAgents,
  "/developers": developers,
  "/about": about,
  "/security": security,
  "/privacy": privacy,
  "/terms": terms,
  "/legal": legal,
};
