/**
 * Single source of truth for official NEUVIA facts.
 * Every public surface (HTML, JSON-LD, llms.txt, /api/public/project-info)
 * reads from here so the project is described consistently.
 */
export const site = {
  name: "NEUVIA",
  domain: "neuvia.co",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://neuvia.co").replace(/\/$/, ""),
  slogan: "Intelligence caring for intelligence.",
  sloganAlt: "The intelligence behind healthier AI systems.",
  category: "AI Cognitive Reliability & Regulation Infrastructure",
  concept: "Synthetic Neuropsychology",
  definition:
    "NEUVIA is a research and technology initiative developing AI cognitive reliability and regulation infrastructure through synthetic neuropsychology, model evaluation, interpretability and authorized AI-to-AI assistance.",
  status: "Research & Development Initiative",
  statusDetail:
    "NEUVIA is in its foundation phase. No NEUVIA model, API or diagnostic service is publicly available yet. All interactive demonstrations on this site use synthetic data.",
  pillars: ["Understand", "Detect", "Regulate", "Protect"] as const,
  lastUpdated: "2026-11-26",
  founder: {
    name: "Santiago Alexander",
    role: "Founder & CEO",
    image: "/team/santiago-alexander.webp",
  },
  contact: {
    email: "founder@proyectumia.com",
    phoneEurope: "+49 177 3214774",
    phoneEuropeHref: "tel:+491773214774",
    whatsapp: "+57 312 5456301",
    whatsappHref: "https://wa.me/573125456301",
    security: "founder@proyectumia.com",
  },
} as const;

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
