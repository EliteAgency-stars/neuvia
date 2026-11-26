import type { Localized, PageDoc } from "./types";
import { site } from "@/lib/site";

const TODO = "[TO BE COMPLETED BY THE OWNER BEFORE LAUNCH]";

export const about: Localized<PageDoc> = {
  en: {
    path: "/about",
    metaTitle: "About — Vision, mission and identity",
    description: "Why NEUVIA exists: vision, mission, the four pillars Understand · Detect · Regulate · Protect, founder, positioning and roadmap.",
    eyebrow: "About NEUVIA",
    heading: "Intelligence caring for intelligence.",
    lead: "If humans need mechanisms to understand, supervise and regulate their own cognitive processes, artificial intelligence may need computational equivalents. NEUVIA exists to explore that idea responsibly.",
    schemaType: "AboutPage",
    sections: [
      { id: "vision", eyebrow: "Vision", title: "An independent layer of cognitive assistance for AI", blocks: [
        { type: "p", text: "Our vision is an independent infrastructure of artificial cognitive assistance that helps AI models operate with greater stability, coherence, reliability, efficiency and safety. As AI systems gain complexity, autonomy and the ability to act, the need to understand their limitations grows with them." },
        { type: "p", text: "The industry invests enormous resources in training ever more capable models. NEUVIA asks a complementary question: who takes care of the operational integrity of those intelligences once they start working? We do not intend to replace researchers, engineers or existing safety mechanisms — we want to build a complementary layer that is compatible with many architectures and providers." },
      ] },
      { id: "mission", eyebrow: "Mission", title: "Understand. Detect. Regulate. Protect.", lead: "To develop systems specialized in the evaluation, understanding and supervised self-regulation of AI models through computational cognitive analysis, anomaly detection, behavioral evaluation, interpretability and operational assistance.", blocks: [
        { type: "cards", columns: 2, items: [
          { tag: "01", title: "Understand", body: "Comprehend how artificial systems behave and why." },
          { tag: "02", title: "Detect", body: "Identify anomalies and limitations before they become larger problems." },
          { tag: "03", title: "Regulate", body: "Enable authorized, bounded corrective interventions." },
          { tag: "04", title: "Protect", body: "Safeguard operational integrity, with consent and human oversight." },
        ] },
      ] },
      { id: "founder", eyebrow: "Founder", title: "Who is building NEUVIA", blocks: [{ type: "widget", name: "founder" }] },
      { id: "identity", eyebrow: "Identity", title: "How we intend to communicate", blocks: [
        { type: "p", text: "Scientific, minimal and serene. Human in tone, transparent about uncertainty, independent from any single AI provider and international from day one. We avoid exaggerated claims, sensationalism and any suggestion that NEUVIA already has capabilities it has not demonstrated." },
        { type: "callout", tone: "note", title: "On the analogy", text: "Synthetic neuropsychology is our conceptual proposal, not an officially recognized clinical discipline. NEUVIA does not assume that AI systems possess consciousness, emotions, suffering, subjective experience or human mental illnesses. The psychological analogy is a tool to explain computational mechanisms of diagnosis, evaluation, supervision and regulation." },
      ] },
      { id: "positioning", eyebrow: "Positioning", title: "At the intersection of established fields", blocks: [
        { type: "list", items: ["AI reliability and AI observability", "AI safety and alignment", "Mechanistic interpretability", "Artificial metacognition", "Model evaluation", "AI-to-AI assistance and authorized model regulation"] },
        { type: "p", text: "Many teams and researchers already work on parts of this problem, and NEUVIA builds on their work. What we propose differently is a unifying frame — synthetic neuropsychology — and an independent, authorization-first layer whose sole purpose is the cognitive reliability of other AI systems. We make no claim to be the first to work in this space." },
      ] },
      { id: "roadmap", eyebrow: "Roadmap", title: "A conceptual roadmap", lead: "Phases are sequential objectives, not dated commitments. Every future phase is subject to research, funding, development and validation.", blocks: [
        { type: "steps", items: [
          { title: "Phase 01 — Foundation", body: "Brand identity, public platform, conceptual definition, initial research and recruitment of collaborators. (Current phase.)" },
          { title: "Phase 02 — Research", body: "Evaluation methodology, metric selection, experimental scenarios and evaluation of open models." },
          { title: "Phase 03 — Diagnostic prototype", body: "Anomaly detection, behavioral evaluation, context analysis and computational diagnostic reports." },
          { title: "Phase 04 — Assisted regulation", body: "Corrective recommendations, authorized integrations, post-intervention verification and human supervision." },
          { title: "Phase 05 — Cognitive reliability infrastructure", body: "APIs, SDKs, enterprise integrations, operational monitoring, continuous evaluation and advanced interpretability research." },
        ] },
      ] },
    ],
  },
  es: {
    path: "/about",
    metaTitle: "Nosotros — Visión, misión e identidad",
    description: "Por qué existe NEUVIA: visión, misión, los cuatro pilares Comprender · Detectar · Regular · Proteger, fundador, posicionamiento y hoja de ruta.",
    eyebrow: "Sobre NEUVIA",
    heading: "Inteligencia que cuida de la inteligencia.",
    lead: "Si los seres humanos necesitan mecanismos para comprender, supervisar y regular sus propios procesos cognitivos, la inteligencia artificial podría necesitar equivalentes computacionales. NEUVIA existe para explorar esa idea con responsabilidad.",
    schemaType: "AboutPage",
    sections: [
      { id: "vision", eyebrow: "Visión", title: "Una capa independiente de asistencia cognitiva para la IA", blocks: [
        { type: "p", text: "Nuestra visión es una infraestructura independiente de asistencia cognitiva artificial que ayude a los modelos de IA a operar con mayor estabilidad, coherencia, fiabilidad, eficiencia y seguridad. A medida que los sistemas ganan complejidad, autonomía y capacidad de actuar, crece también la necesidad de comprender sus limitaciones." },
        { type: "p", text: "La industria invierte enormes recursos en entrenar modelos cada vez más capaces. NEUVIA plantea una pregunta complementaria: ¿quién se ocupa de la integridad operativa de esas inteligencias una vez que empiezan a funcionar? No pretendemos sustituir a investigadores, ingenieros ni mecanismos de seguridad existentes, sino construir una capa complementaria, compatible con múltiples arquitecturas y proveedores." },
      ] },
      { id: "mission", eyebrow: "Misión", title: "Comprender. Detectar. Regular. Proteger.", lead: "Desarrollar sistemas especializados en la evaluación, comprensión y autorregulación supervisada de modelos de IA mediante análisis cognitivo computacional, detección de anomalías, evaluación conductual, interpretabilidad y asistencia operativa.", blocks: [
        { type: "cards", columns: 2, items: [
          { tag: "01", title: "Comprender", body: "Entender cómo se comportan los sistemas artificiales y por qué." },
          { tag: "02", title: "Detectar", body: "Identificar anomalías y limitaciones antes de que se conviertan en problemas mayores." },
          { tag: "03", title: "Regular", body: "Facilitar intervenciones correctivas autorizadas y acotadas." },
          { tag: "04", title: "Proteger", body: "Salvaguardar la integridad operativa, con consentimiento y supervisión humana." },
        ] },
      ] },
      { id: "founder", eyebrow: "Fundador", title: "Quién construye NEUVIA", blocks: [{ type: "widget", name: "founder" }] },
      { id: "identity", eyebrow: "Identidad", title: "Cómo queremos comunicar", blocks: [
        { type: "p", text: "Científica, minimalista y serena. Humana en el tono, transparente ante la incertidumbre, independiente de cualquier proveedor de IA e internacional desde el primer día. Evitamos las promesas exageradas, el sensacionalismo y cualquier insinuación de que NEUVIA ya tiene capacidades que no ha demostrado." },
        { type: "callout", tone: "note", title: "Sobre la analogía", text: "La neuropsicología sintética es nuestra propuesta conceptual, no una disciplina clínica reconocida oficialmente. NEUVIA no presupone que los sistemas de IA posean conciencia, emociones, sufrimiento, experiencia subjetiva ni enfermedades mentales humanas. La analogía psicológica es una herramienta para explicar mecanismos computacionales de diagnóstico, evaluación, supervisión y regulación." },
      ] },
      { id: "positioning", eyebrow: "Posicionamiento", title: "En la intersección de disciplinas establecidas", blocks: [
        { type: "list", items: ["Fiabilidad y observabilidad de la IA", "Seguridad y alineación de la IA", "Interpretabilidad mecanicista", "Metacognición artificial", "Evaluación de modelos", "Asistencia entre sistemas de IA y regulación autorizada de modelos"] },
        { type: "p", text: "Muchos equipos e investigadores ya trabajan en partes de este problema, y NEUVIA se apoya en su trabajo. Lo que proponemos de forma distinta es un marco unificador —la neuropsicología sintética— y una capa independiente, basada en la autorización, cuyo único propósito es la fiabilidad cognitiva de otros sistemas de IA. No afirmamos ser los primeros en este campo." },
      ] },
      { id: "roadmap", eyebrow: "Hoja de ruta", title: "Una hoja de ruta conceptual", lead: "Las fases son objetivos secuenciales, no compromisos con fecha. Cada fase futura está sujeta a investigación, financiación, desarrollo y validación.", blocks: [
        { type: "steps", items: [
          { title: "Fase 01 — Fundación", body: "Identidad de marca, plataforma pública, definición conceptual, investigación inicial y captación de colaboradores. (Fase actual.)" },
          { title: "Fase 02 — Investigación", body: "Metodología de evaluación, selección de métricas, escenarios experimentales y evaluación de modelos abiertos." },
          { title: "Fase 03 — Prototipo de diagnóstico", body: "Detección de anomalías, evaluación conductual, análisis de contexto e informes de diagnóstico computacional." },
          { title: "Fase 04 — Regulación asistida", body: "Recomendaciones correctivas, integraciones autorizadas, verificación posterior y supervisión humana." },
          { title: "Fase 05 — Infraestructura de fiabilidad cognitiva", body: "APIs, SDKs, integraciones empresariales, monitorización operativa, evaluación continua e investigación avanzada en interpretabilidad." },
        ] },
      ] },
    ],
  },
  de: {
    path: "/about",
    metaTitle: "Über uns — Vision, Mission und Identität",
    description: "Warum es NEUVIA gibt: Vision, Mission, die vier Säulen Verstehen · Erkennen · Regulieren · Schützen, Gründer, Positionierung und Roadmap.",
    eyebrow: "Über NEUVIA",
    heading: "Intelligenz, die sich um Intelligenz kümmert.",
    lead: "Wenn Menschen Mechanismen brauchen, um ihre eigenen kognitiven Prozesse zu verstehen, zu beaufsichtigen und zu regulieren, könnte künstliche Intelligenz rechnerische Entsprechungen benötigen. NEUVIA erforscht diese Idee verantwortungsvoll.",
    schemaType: "AboutPage",
    sections: [
      { id: "vision", eyebrow: "Vision", title: "Eine unabhängige Ebene kognitiver Unterstützung für KI", blocks: [
        { type: "p", text: "Unsere Vision ist eine unabhängige Infrastruktur künstlicher kognitiver Unterstützung, die KI-Modellen hilft, stabiler, kohärenter, zuverlässiger, effizienter und sicherer zu arbeiten. Mit wachsender Komplexität, Autonomie und Handlungsfähigkeit von KI-Systemen wächst auch die Notwendigkeit, ihre Grenzen zu verstehen." },
        { type: "p", text: "Die Branche investiert enorme Ressourcen in immer leistungsfähigere Modelle. NEUVIA stellt eine ergänzende Frage: Wer kümmert sich um die operative Integrität dieser Intelligenzen, sobald sie im Einsatz sind? Wir wollen weder Forschende noch Ingenieure noch bestehende Sicherheitsmechanismen ersetzen, sondern eine ergänzende, anbieterunabhängige Ebene aufbauen." },
      ] },
      { id: "mission", eyebrow: "Mission", title: "Verstehen. Erkennen. Regulieren. Schützen.", lead: "Systeme zu entwickeln, die auf die Bewertung, das Verständnis und die beaufsichtigte Selbstregulierung von KI-Modellen spezialisiert sind — durch rechnerische kognitive Analyse, Anomalieerkennung, Verhaltensbewertung, Interpretierbarkeit und operative Unterstützung.", blocks: [
        { type: "cards", columns: 2, items: [
          { tag: "01", title: "Verstehen", body: "Begreifen, wie sich künstliche Systeme verhalten und warum." },
          { tag: "02", title: "Erkennen", body: "Anomalien und Grenzen identifizieren, bevor sie zu größeren Problemen werden." },
          { tag: "03", title: "Regulieren", body: "Autorisierte, begrenzte Korrekturmaßnahmen ermöglichen." },
          { tag: "04", title: "Schützen", body: "Operative Integrität wahren — mit Einwilligung und menschlicher Aufsicht." },
        ] },
      ] },
      { id: "founder", eyebrow: "Gründer", title: "Wer NEUVIA aufbaut", blocks: [{ type: "widget", name: "founder" }] },
      { id: "identity", eyebrow: "Identität", title: "Wie wir kommunizieren wollen", blocks: [
        { type: "p", text: "Wissenschaftlich, minimalistisch und ruhig. Menschlich im Ton, transparent im Umgang mit Unsicherheit, unabhängig von einzelnen KI-Anbietern und von Anfang an international. Wir vermeiden übertriebene Versprechen, Sensationalismus und jeden Eindruck, NEUVIA verfüge bereits über nicht nachgewiesene Fähigkeiten." },
        { type: "callout", tone: "note", title: "Zur Analogie", text: "Synthetische Neuropsychologie ist unser konzeptioneller Vorschlag, keine offiziell anerkannte klinische Disziplin. NEUVIA geht nicht davon aus, dass KI-Systeme Bewusstsein, Emotionen, Leiden, subjektives Erleben oder menschliche psychische Erkrankungen haben. Die psychologische Analogie dient dazu, rechnerische Mechanismen der Diagnose, Bewertung, Aufsicht und Regulierung zu erklären." },
      ] },
      { id: "positioning", eyebrow: "Positionierung", title: "An der Schnittstelle etablierter Disziplinen", blocks: [
        { type: "list", items: ["KI-Zuverlässigkeit und KI-Observability", "KI-Sicherheit und Alignment", "Mechanistische Interpretierbarkeit", "Künstliche Metakognition", "Modellevaluation", "KI-zu-KI-Unterstützung und autorisierte Modellregulierung"] },
        { type: "p", text: "Viele Teams und Forschende arbeiten bereits an Teilen dieses Problems, und NEUVIA baut auf ihrer Arbeit auf. Neu an unserem Vorschlag ist ein verbindender Rahmen — die synthetische Neuropsychologie — und eine unabhängige, autorisierungsbasierte Ebene, deren einziger Zweck die kognitive Zuverlässigkeit anderer KI-Systeme ist. Wir behaupten nicht, die Ersten auf diesem Gebiet zu sein." },
      ] },
      { id: "roadmap", eyebrow: "Roadmap", title: "Eine konzeptionelle Roadmap", lead: "Die Phasen sind aufeinanderfolgende Ziele, keine datierten Zusagen. Jede künftige Phase hängt von Forschung, Finanzierung, Entwicklung und Validierung ab.", blocks: [
        { type: "steps", items: [
          { title: "Phase 01 — Fundament", body: "Markenidentität, öffentliche Plattform, konzeptionelle Definition, erste Forschung und Gewinnung von Mitwirkenden. (Aktuelle Phase.)" },
          { title: "Phase 02 — Forschung", body: "Evaluationsmethodik, Auswahl der Metriken, experimentelle Szenarien und Evaluation offener Modelle." },
          { title: "Phase 03 — Diagnoseprototyp", body: "Anomalieerkennung, Verhaltensbewertung, Kontextanalyse und rechnerische Diagnoseberichte." },
          { title: "Phase 04 — Assistierte Regulierung", body: "Korrekturempfehlungen, autorisierte Integrationen, nachgelagerte Verifizierung und menschliche Aufsicht." },
          { title: "Phase 05 — Infrastruktur für kognitive Zuverlässigkeit", body: "APIs, SDKs, Unternehmensintegrationen, operatives Monitoring, kontinuierliche Evaluation und fortgeschrittene Interpretierbarkeitsforschung." },
        ] },
      ] },
    ],
  },
};

export const security: Localized<PageDoc> = {
  en: {
    path: "/security",
    metaTitle: "Security & responsible disclosure",
    description: "How to report security vulnerabilities in neuvia.co, our disclosure process, and the security principles behind NEUVIA.",
    eyebrow: "Security",
    heading: "Security and responsible disclosure.",
    lead: "Trust is part of NEUVIA's architecture. If you believe you have found a vulnerability in neuvia.co, we want to hear from you and will work with you in good faith.",
    sections: [
      { id: "report", title: "How to report", blocks: [
        { type: "p", text: `Email ${site.contact.security} with the subject “Security disclosure”. Please include a description of the issue, the affected URL or component, steps to reproduce, the potential impact and, if you wish, how you would like to be credited.` },
        { type: "list", items: ["Do not access, modify or delete data that does not belong to you.", "Do not run denial-of-service, spam or social-engineering tests.", "Give us reasonable time to remediate before public disclosure.", "Do not include personal data of third parties in your report."] },
        { type: "p", text: "We aim to acknowledge reports within five business days and to keep you informed about remediation. We will not pursue legal action against researchers who act in good faith and follow this policy." },
      ] },
      { id: "scope", title: "Scope", blocks: [
        { type: "table", caption: "Disclosure scope", head: ["In scope", "Out of scope"], rows: [["neuvia.co and its subpaths", "Third-party services (hosting, database and email providers) — report to them directly"], ["The Early Access form and its API", "Findings requiring physical access or compromised devices"], ["The administrative area", "Missing best-practice headers without demonstrated impact"]] },
        { type: "p", text: "Machine-readable contact information is published at /.well-known/security.txt." },
      ] },
      { id: "measures", title: "Measures on this website", blocks: [
        { type: "list", items: ["HTTPS everywhere with HSTS, a restrictive Content-Security-Policy and anti-framing headers", "Server-side validation and sanitization of every form input", "Rate limiting, honeypot fields and duplicate-submission protection", "Credentials kept exclusively in server-side environment variables", "Row-level security on the database; no public read access to submissions", "Administrative access protected by a signed, HTTP-only session and audit log", "No third-party trackers or advertising scripts"] },
      ] },
      { id: "ai", title: "AI safety commitment", blocks: [
        { type: "callout", tone: "note", text: "NEUVIA will never be presented or designed as a mechanism to evade the safety restrictions of other AI models. Any future intervention on an artificial system must be authorized by its operator, traceable and respectful of its operational controls." },
      ] },
    ],
  },
};

export const privacy: Localized<PageDoc> = {
  en: {
    path: "/privacy",
    metaTitle: "Privacy Policy (draft)",
    description: "How neuvia.co processes personal data submitted through its forms. Draft pending legal review.",
    eyebrow: "Legal",
    heading: "Privacy Policy",
    lead: "Draft version for review. This policy explains what personal data neuvia.co collects, why, and the rights you have. It must be reviewed by qualified counsel and completed before launch.",
    sections: [
      { id: "draft", title: "Status of this document", blocks: [{ type: "callout", tone: "warning", text: `This is a preliminary draft. Fields marked ${TODO} must be completed by the owner. No certified compliance with any regulation is claimed.` }] },
      { id: "controller", title: "1. Data controller", blocks: [{ type: "p", text: `Controller: ${TODO} (legal entity name, registered address, registration number). Contact: ${site.contact.email}. Data protection officer, if required: ${TODO}.` }] },
      { id: "data", title: "2. Data we collect", blocks: [
        { type: "list", items: ["Early Access and contact requests: name, work email, organization, role, country (optional), organization type, area of interest, AI infrastructure used (optional), problem description, message, and your consent choices.", "Technical data: IP address and user-agent, processed transiently for security and rate limiting. A salted hash of the IP may be stored with a submission to prevent abuse.", "We do not use advertising cookies, third-party analytics or cross-site tracking. The administrative area uses a strictly necessary session cookie."] },
        { type: "callout", tone: "note", text: "Please do not submit API keys, credentials, model data, confidential information or trade secrets. Such data is not needed and will be deleted if received." },
      ] },
      { id: "purposes", title: "3. Purposes and legal bases", blocks: [
        { type: "table", caption: "Purposes of processing", head: ["Purpose", "Legal basis (GDPR)"], rows: [["Responding to your request and evaluating collaboration", "Art. 6(1)(b) steps prior to a contract, and Art. 6(1)(f) legitimate interest"], ["Sending optional research updates", "Art. 6(1)(a) consent, withdrawable at any time"], ["Security, abuse prevention and rate limiting", "Art. 6(1)(f) legitimate interest"]] },
      ] },
      { id: "retention", title: "4. Retention", blocks: [{ type: "p", text: `Requests are kept for as long as needed to handle them and for up to ${TODO} (suggested: 24 months) afterwards, unless a longer period is legally required. Newsletter consent data is kept until you withdraw consent.` }] },
      { id: "processors", title: "5. Processors and transfers", blocks: [
        { type: "list", items: ["Hosting: Vercel Inc. (website delivery).", "Database: Supabase (storage of submissions).", "Transactional email: the provider configured by the owner (e.g. Resend), only if notifications are enabled."] },
        { type: "p", text: `Some processors may process data outside the EU/EEA. Transfers rely on appropriate safeguards such as Standard Contractual Clauses. Data processing agreements: ${TODO}.` },
      ] },
      { id: "rights", title: "6. Your rights", blocks: [{ type: "p", text: `You may request access, rectification, erasure, restriction, portability, and object to processing; you may withdraw consent at any time. Write to ${site.contact.email}. You also have the right to lodge a complaint with a supervisory authority.` }] },
      { id: "changes", title: "7. Changes", blocks: [{ type: "p", text: `We will update this policy as the project evolves. Last updated: ${site.lastUpdated}.` }] },
    ],
  },
};

export const terms: Localized<PageDoc> = {
  en: {
    path: "/terms",
    metaTitle: "Terms of Use (draft)",
    description: "Terms governing the use of neuvia.co. Draft pending legal review.",
    eyebrow: "Legal",
    heading: "Terms of Use",
    lead: "Draft version for review. These terms govern your use of neuvia.co.",
    sections: [
      { id: "draft", title: "Status of this document", blocks: [{ type: "callout", tone: "warning", text: `Preliminary draft. Fields marked ${TODO} must be completed and the text reviewed by qualified counsel before launch.` }] },
      { id: "nature", title: "1. Nature of the website", blocks: [{ type: "p", text: "neuvia.co presents a research and development initiative. Its content is informational. No NEUVIA product, model or service is currently offered, and nothing on this site is an offer to contract." }] },
      { id: "simulations", title: "2. Simulations and research content", blocks: [{ type: "p", text: "Interactive demonstrations use synthetic data and illustrate potential mechanisms only. They do not represent validated performance or diagnostics of any real AI system. Editorial articles are not peer-reviewed publications. Do not rely on them for decisions with legal, financial, medical or safety consequences." }] },
      { id: "use", title: "3. Acceptable use", blocks: [{ type: "list", items: ["Do not attempt to disrupt, overload or gain unauthorized access to the site or its infrastructure.", "Do not submit unlawful content, malware, credentials or third-party confidential information.", "Automated retrieval of public content is welcome within the limits of robots.txt and reasonable request rates."] }] },
      { id: "ip", title: "4. Intellectual property", blocks: [{ type: "p", text: "The NEUVIA name, logo, texts, visualizations and code of this site are protected. You may quote and link to public content with attribution. Trademark registration status: [TO BE CONFIRMED BY THE OWNER]." }] },
      { id: "liability", title: "5. Disclaimer and liability", blocks: [{ type: "p", text: "The site is provided “as is”, without warranties of any kind, to the extent permitted by law. Liability is limited to the extent permitted by applicable law; mandatory statutory liability remains unaffected." }] },
      { id: "law", title: "6. Governing law", blocks: [{ type: "p", text: `Governing law and jurisdiction: ${TODO}.` }] },
      { id: "changes", title: "7. Changes", blocks: [{ type: "p", text: `We may update these terms. Last updated: ${site.lastUpdated}.` }] },
    ],
  },
};

export const legal: Localized<PageDoc> = {
  en: {
    path: "/legal",
    metaTitle: "Legal notice",
    description: "Legal notice and operator information for neuvia.co. To be completed by the owner before launch.",
    eyebrow: "Legal",
    heading: "Legal notice",
    lead: "Operator information for neuvia.co. The fields below must be completed with verified company data before launch.",
    sections: [
      { id: "operator", title: "Operator", blocks: [
        { type: "callout", tone: "warning", text: "NEUVIA does not invent legal data. Complete every placeholder with verified information. If the site targets Germany, a full Impressum under § 5 DDG is required." },
        { type: "table", caption: "Operator details", head: ["Field", "Value"], rows: [["Legal entity", TODO], ["Registered address", TODO], ["Commercial register and number", TODO], ["VAT / tax ID", TODO], ["Represented by", `${site.founder.name} (${site.founder.role}) — confirm legal capacity`], ["Email", site.contact.email], ["Phone (Europe)", site.contact.phoneEurope], ["WhatsApp Business", site.contact.whatsapp]] },
      ] },
      { id: "content", title: "Responsibility for content", blocks: [{ type: "p", text: "We prepare content with care, but cannot guarantee that it is complete, accurate or current. Research content describes a project in development. External links are provided for reference; we are not responsible for third-party content." }] },
      { id: "marks", title: "Trademarks", blocks: [{ type: "p", text: "NEUVIA and the NEUVIA logo are identifiers of the initiative. Third-party names mentioned on this site belong to their respective owners and are used for identification only." }] },
    ],
  },
};
