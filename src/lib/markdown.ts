import type { Block, PageDoc } from "@/content/types";
import { site, absoluteUrl } from "./site";

/** Serializes a structured page into Markdown, so HTML and Markdown share one source. */
export function blockToMd(b: Block): string {
  switch (b.type) {
    case "p": return b.text;
    case "list": return b.items.map((i) => `- ${i}`).join("\n");
    case "cards": return b.items.map((c) => `### ${c.tag ? `${c.tag} — ` : ""}${c.title}\n\n${c.body}${c.list ? "\n\n" + c.list.map((x) => `- ${x}`).join("\n") : ""}`).join("\n\n");
    case "steps": return b.items.map((s, i) => `${i + 1}. **${s.title}** — ${s.body}`).join("\n");
    case "table": return [`| ${b.head.join(" | ")} |`, `| ${b.head.map(() => "---").join(" | ")} |`, ...b.rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
    case "callout": return `> ${b.title ? `**${b.title}.** ` : ""}${b.text}`;
    case "code": return "```" + b.lang + "\n" + b.code + "\n```";
    case "refs": return b.items.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). [${r.title}](${r.url}). ${r.venue}.`).join("\n");
    case "widget":
      if (b.name === "ncri") return "_Interactive NCRI radar with synthetic profiles (see the HTML page). Synthetic data — not a measurement._";
      if (b.name === "integration") return "_Diagram: black-box (inputs/outputs/behavior) ⊃ grey-box (logs, telemetry, probabilities) ⊃ white-box (activations, representations)._";
      if (b.name === "founder") return `**${site.founder.name}** — ${site.founder.role}. Contact: ${site.contact.email}.`;
      return "";
  }
}

export function docToMarkdown(doc: PageDoc, opts: { heading?: number } = {}): string {
  const h = "#".repeat(opts.heading ?? 1);
  const out = [`${h} ${doc.heading}`, "", `> ${doc.lead}`, "", `Canonical: ${absoluteUrl(doc.path)}  `, `Last updated: ${site.lastUpdated}`, ""];
  for (const s of doc.sections) {
    out.push(`${h}# ${s.title}`, "");
    if (s.lead) out.push(s.lead, "");
    for (const b of s.blocks) { const md = blockToMd(b); if (md) out.push(md, ""); }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
