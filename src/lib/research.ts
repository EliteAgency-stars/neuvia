import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingTime: number;
  body: string; // markdown
};

const DIR = path.join(process.cwd(), "src/content/research");

export const CATEGORIES = [
  "Synthetic Neuropsychology",
  "Artificial Metacognition",
  "Mechanistic Interpretability",
  "Cognitive Reliability",
  "AI Safety",
  "Model Regulation",
  "Autonomous Agent Reliability",
  "Research Notes",
] as const;

/** Topics in preparation (not yet published, listed transparently). */
export const UPCOMING = [
  "From model performance to cognitive reliability",
  "Can artificial intelligence evaluate artificial intelligence?",
  "Why more capable models still require oversight",
  "The challenge of regulating autonomous agents",
];

function parse(file: string): Article {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Missing frontmatter in ${file}`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    slug: file.replace(/\.mdx?$/, ""),
    title: meta.title,
    description: meta.description,
    category: meta.category || "Research Notes",
    date: meta.date,
    readingTime: Number(meta.readingTime || 5),
    body: m[2].trim(),
  };
}

let cache: Article[] | null = null;
export function getArticles(): Article[] {
  if (!cache) {
    cache = fs.readdirSync(DIR).filter((f) => /\.mdx?$/.test(f)).map(parse).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  }
  return cache;
}

export const getArticle = (slug: string) => getArticles().find((a) => a.slug === slug);

/** Markdown → HTML. Source files are first-party content in the repository (trusted). */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false, gfm: true }) as string;
}

export function articleToMarkdown(a: Article, url: string) {
  return `# ${a.title}\n\n> ${a.description}\n\nCategory: ${a.category} · Published: ${a.date} · Editorial note — not a peer-reviewed publication.  \nCanonical: ${url}\n\n${a.body}\n`;
}
