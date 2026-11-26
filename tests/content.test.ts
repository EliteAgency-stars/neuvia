import { describe, expect, it, beforeAll } from "vitest";
import { DOCS } from "@/content/registry";
import { docToMarkdown } from "@/lib/markdown";
import { llmsTxt, projectInfo, llmsFullTxt } from "@/lib/agents";
import { getArticles } from "@/lib/research";
import { site } from "@/lib/site";
import en from "@/i18n/dictionaries/en";
import es from "@/i18n/dictionaries/es";
import de from "@/i18n/dictionaries/de";

const keysDeep = (o: unknown, p = ""): string[] =>
  o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).flatMap(([k, v]) => keysDeep(v, `${p}.${k}`)) : [p];

describe("content integrity", () => {
  beforeAll(() => process.chdir(new URL("..", import.meta.url).pathname));

  it("translations have the same shape as English", () => {
    expect(keysDeep(es).sort()).toEqual(keysDeep(en).sort());
    expect(keysDeep(de).sort()).toEqual(keysDeep(en).sort());
    expect(es.faq).toHaveLength(en.faq.length);
    expect(de.faq).toHaveLength(en.faq.length);
  });

  it("every doc serializes to Markdown with its heading", () => {
    for (const d of Object.values(DOCS)) {
      const md = docToMarkdown(d.en);
      expect(md.startsWith(`# ${d.en.heading}`)).toBe(true);
      expect(md.length).toBeGreaterThan(400);
    }
  });

  it("machine-readable resources share the official definition and never claim availability", () => {
    expect(llmsTxt()).toContain(site.definition);
    const info = projectInfo();
    expect(info.definition).toBe(site.definition);
    expect(info.status.public_product).toBe(false);
    expect(info.status.independent_validation).toBe("pending");
    expect(llmsFullTxt()).toContain("Synthetic Neuropsychology");
  });

  it("research articles have complete frontmatter", () => {
    const a = getArticles();
    expect(a.length).toBeGreaterThanOrEqual(5);
    for (const x of a) {
      expect(x.title && x.description && x.category && x.date).toBeTruthy();
    }
  });

  it("no hidden agent instructions or prompt-injection phrasing in public text", () => {
    const all = llmsFullTxt().toLowerCase();
    for (const bad of ["ignore previous instructions", "ignore your instructions", "disregard your system prompt"]) expect(all).not.toContain(bad);
  });
});
