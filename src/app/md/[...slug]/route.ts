import { DOCS } from "@/content/registry";
import { docToMarkdown } from "@/lib/markdown";
import { getArticle, getArticles, articleToMarkdown } from "@/lib/research";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [...Object.keys(DOCS).map((p) => ({ slug: [p.slice(1)] })), ...getArticles().map((a) => ({ slug: ["research", a.slug] }))];
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  let body: string | null = null;
  if (DOCS[path]) body = docToMarkdown(DOCS[path].en);
  else if (slug[0] === "research" && slug[1]) {
    const a = getArticle(slug[1]);
    if (a) body = articleToMarkdown(a, absoluteUrl(path));
  }
  if (!body) return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8", "X-Robots-Tag": "noindex", Link: `<${absoluteUrl(path)}>; rel="canonical"` } });
}
