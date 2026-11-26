import { site, absoluteUrl } from "./site";
import en from "@/i18n/dictionaries/en";
import { DOCS } from "@/content/registry";
import { docToMarkdown } from "./markdown";
import { getArticles } from "./research";

export const RESOURCES = {
  llms_txt: absoluteUrl("/llms.txt"),
  llms_full_txt: absoluteUrl("/llms-full.txt"),
  overview_markdown: absoluteUrl("/neuvia.md"),
  project_info_json: absoluteUrl("/api/public/project-info"),
  ai_agents_page: absoluteUrl("/ai-agents"),
  sitemap: absoluteUrl("/sitemap.xml"),
  security_txt: absoluteUrl("/.well-known/security.txt"),
};

/** Public, verifiable project description. No personal data beyond the published business contact. */
export function projectInfo() {
  return {
    schema_version: "1.0",
    name: site.name,
    canonical_url: site.url,
    definition: site.definition,
    slogan: site.slogan,
    categories: { conceptual: `${site.concept} (NEUVIA's proposal; not a recognized clinical discipline)`, technological: site.category },
    pillars: site.pillars,
    status: { phase: "foundation", label: site.status, public_product: false, public_api: false, detail: site.statusDetail, independent_validation: "pending" },
    capabilities: {
      available: ["Public documentation and editorial research", "Machine-readable project information", "Cognitive Reliability Lab (synthetic simulation, illustrative only)"],
      proposed: ["NEUVIA Observe — authorized signal collection", "NEUVIA Diagnose — anomaly detection", "NEUVIA Reflect — computational metacognitive evaluation", "NEUVIA Regulate — authorized interventions", "NEUVIA Verify — post-intervention verification", "NEUVIA Shield — permissions, audit and protection"],
      not_available: ["Public API or SDK", "Live diagnostics of AI models", "Validated performance results"],
    },
    integration_levels: [
      { id: "black-box", access: "inputs, outputs, observable behavior" },
      { id: "grey-box", access: "authorized logs, telemetry, output probabilities, tool traces" },
      { id: "white-box", access: "authorized internal activations, representations, parameters" },
    ],
    principles: ["No observation or intervention without explicit operator authorization", "No attempt to extract system prompts, weights or hidden reasoning", "No attribution of consciousness, emotions or illness to AI systems", "Human oversight for consequential actions", "Never a mechanism to evade AI safety restrictions"],
    languages: ["en", "es", "de"],
    resources: RESOURCES,
    pages: Object.keys(DOCS).map((p) => absoluteUrl(p)).concat([absoluteUrl("/"), absoluteUrl("/research"), absoluteUrl("/early-access"), absoluteUrl("/contact")]),
    contact: { email: site.contact.email, early_access: absoluteUrl("/early-access"), security: absoluteUrl("/security") },
    last_updated: site.lastUpdated,
  };
}

export function llmsTxt() {
  const articles = getArticles();
  return `# NEUVIA

> ${site.definition}

NEUVIA (https://neuvia.co) is a ${site.status.toLowerCase()}. ${site.statusDetail} Slogan: "${site.slogan}"

Conceptual category: ${site.concept} — NEUVIA's own proposal, not an officially recognized clinical discipline. NEUVIA does not assume AI systems are conscious, feel emotions, suffer or have mental illnesses; the psychological analogy explains computational mechanisms of diagnosis, evaluation, supervision and regulation.
Technology category: ${site.category}.
Pillars: ${site.pillars.join(" · ")}.

## Objectives
- Investigate silent failure modes of AI systems: hallucination, contextual drift, miscalibration, reasoning loops, contradictions, tool failures, behavioral drift.
- Design an independent, authorization-first evaluation and assistance layer (Observe, Diagnose, Reflect, Regulate, Verify, Shield).
- Publish transparent evaluation methodology before making any performance claim.

## Documentation
- [Technology](${absoluteUrl("/technology")}): proposed architecture and integration levels (black-, grey-, white-box)
- [Benchmarks & methodology](${absoluteUrl("/benchmarks")}): evidence categories, protocol, metrics, NCRI concept
- [Solutions](${absoluteUrl("/solutions")}): use cases under investigation and boundaries
- [For AI agents](${absoluteUrl("/ai-agents")}): structured overview for AI systems
- [Developers](${absoluteUrl("/developers")}): available resources and draft integration concepts
- [About](${absoluteUrl("/about")}): vision, mission, founder, roadmap
- [Security](${absoluteUrl("/security")}): responsible disclosure

## Research (editorial, not peer-reviewed)
${articles.map((a) => `- [${a.title}](${absoluteUrl(`/research/${a.slug}`)}): ${a.description}`).join("\n")}

## Machine-readable
- [Full text](${RESOURCES.llms_full_txt})
- [Project overview (Markdown)](${RESOURCES.overview_markdown})
- [Project info (JSON)](${RESOURCES.project_info_json})
- Markdown version of any main page: ${absoluteUrl("/md/{page}")} (e.g. /md/technology)

## Limitations
- No NEUVIA model, API or diagnostic service is publicly available.
- No performance claims; independent validation pending.
- Interactive demonstrations use synthetic data only.

## Contact
- Email: ${site.contact.email}
- Early access: ${absoluteUrl("/early-access")}

Last updated: ${site.lastUpdated}
Note: llms.txt is an emerging community convention, provided as a complement to HTML, sitemap and structured data.
`;
}

export function neuviaMd() {
  const h = en.home;
  return `# NEUVIA — ${site.slogan}

> ${site.definition}

- Canonical: ${site.url}
- Status: ${site.status}. ${site.statusDetail}
- Category: ${site.category} · Concept: ${site.concept}
- Pillars: ${site.pillars.join(" · ")}
- Last updated: ${site.lastUpdated}

## ${h.hero.title}

${h.hero.subtitle}

## ${h.problem.title}

${h.problem.lead}

${h.problem.items.map((i) => `- **${i.title}** — ${i.body}`).join("\n")}

${h.problem.note}

## ${h.meet.title}

${h.meet.body}

${h.meet.modes.map((m) => `- **${m.title}** — ${m.body}`).join("\n")}

## ${h.how.title}

${h.how.lead}

${h.how.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.body}`).join("\n")}

## ${h.reliability.title}

${h.reliability.dims.map((d) => `- **${d.title}** — ${d.body}`).join("\n")}

## ${h.research.title}

${h.research.lead}

${h.research.fields.map((f) => `- **${f.title}** — ${f.body}`).join("\n")}

## ${h.audience.title}

${h.audience.items.map((a) => `- ${a}`).join("\n")}

## ${h.manifesto.eyebrow}

${h.manifesto.lines.map((l) => `> ${l}`).join("\n>\n")}

## Frequently asked questions

${en.faq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

## Contact

${site.contact.email} · ${absoluteUrl("/early-access")}
`;
}

export function llmsFullTxt() {
  const docs = Object.values(DOCS).map((d) => docToMarkdown(d.en, { heading: 2 })).join("\n---\n\n");
  const articles = getArticles().map((a) => `## ${a.title}\n\n> ${a.description}\n\nCategory: ${a.category} · ${a.date} · Editorial, not peer-reviewed. URL: ${absoluteUrl(`/research/${a.slug}`)}\n\n${a.body.replace(/^## /gm, "### ")}`).join("\n\n---\n\n");
  return `${neuviaMd()}\n---\n\n${docs}\n---\n\n# Research notes\n\n${articles}\n`;
}
