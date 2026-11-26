import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Ghost, Waves, Gauge, Repeat, Split, Wrench, Activity, ShieldAlert, Check, Plus } from "lucide-react";
import { NeuralField } from "@/components/NeuralField";
import { ReliabilityLab } from "@/components/ReliabilityLab";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/i18n";
import { isLocale, localePath, type Locale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { site, absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "en") as Locale;
  const t = getDictionary(l).home.meta;
  return { ...buildMetadata({ locale: l, path: "/", title: t.title, description: t.description, markdown: "/neuvia.md" }), title: { absolute: t.title } };
}

const problemIcons = [Ghost, Waves, Gauge, Repeat, Split, Wrench, Activity, ShieldAlert];

function SectionHead({ id, eyebrow, title, lead, center = false }: { id?: string; eyebrow: string; title: string; lead?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="h-section mt-4">{title}</h2>
      {lead && <p className={`lead mt-5 ${center ? "mx-auto" : ""} max-w-2xl`}>{lead}</p>}
    </Reveal>
  );
}

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const d = getDictionary(locale);
  const t = d.home;
  const h = (p: string) => localePath(locale, p);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: absoluteUrl(h("/")),
    name: t.meta.title,
    description: t.meta.description,
    inLanguage: locale,
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@type": "DefinedTerm", name: "Synthetic Neuropsychology", description: "NEUVIA's conceptual proposal for studying computational cognitive processes and failure modes of artificial systems. Not a recognized clinical discipline.", inDefinedTermSet: absoluteUrl("/research/what-is-synthetic-neuropsychology") },
  };

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative isolate overflow-hidden pt-28 sm:pt-32">
        <div className="aurora pointer-events-none absolute inset-0 -z-20" aria-hidden />
        <div className="grid-paper pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 sm:px-8 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1.12fr_1fr] lg:gap-6">
          <div className="animate-rise relative z-10 pb-4 lg:pb-16">
            <p className="glass inline-flex items-center gap-2.5 !rounded-full py-1.5 pl-2 pr-4 text-[0.8125rem] font-medium text-ink/80">
              <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wider text-jade-bright">New</span>
              {t.hero.eyebrow}
            </p>
            <h1 className="text-balance-lg mt-7">{t.hero.title}</h1>
            <p className="lead mt-6 max-w-xl">{t.hero.subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={h("/early-access")} className="btn btn-primary">
                {t.hero.primary} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href={h("/technology")} className="btn btn-ghost">{t.hero.secondary}</Link>
            </div>
            <p className="mt-8 inline-flex items-center gap-2 text-[0.8125rem] text-muted">
              <span className="h-2 w-2 rounded-full bg-jade animate-pulse-dot" aria-hidden />
              <span className="font-medium text-ink/80">{d.common.status}:</span> {t.hero.status}
            </p>
          </div>
          <div className="relative h-[360px] sm:h-[440px] lg:h-[560px]">
            <NeuralField labels={{ model: t.hero.vizModel, neuvia: t.hero.vizNeuvia, caption: t.hero.vizCaption, phases: t.hero.phases }} />
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl px-5 sm:px-8">
          <ul className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line py-6 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink/55">
            {site.pillars.map((p, i) => (
              <li key={p} className="flex items-center gap-3"><span className="text-jade-deep">0{i + 1}</span>{p}</li>
            ))}
            <li className="hidden text-ink/40 md:block">{site.slogan}</li>
          </ul>
        </div>
      </section>

      {/* ——— Problem ——— */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32" aria-labelledby="problem">
        <SectionHead id="problem" eyebrow={t.problem.eyebrow} title={t.problem.title} lead={t.problem.lead} />
        <ul className="mt-16 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {t.problem.items.map((it, i) => {
            const Icon = problemIcons[i];
            return (
              <Reveal as="li" key={it.title} delay={(i % 4) * 0.08} className="group relative border-b border-r border-line p-6 transition-colors hover:bg-paper sm:p-7">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-ink/70 transition-colors group-hover:text-jade-deep" aria-hidden />
                  <span className="font-mono text-[0.6875rem] text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-8 text-[1.0625rem] font-semibold tracking-tight">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{it.body}</p>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-6 max-w-3xl text-sm text-muted">{t.problem.note}</p>
      </section>

      {/* ——— Meet NEUVIA ——— */}
      <section className="relative overflow-hidden bg-paper py-24 sm:py-32" aria-labelledby="meet">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="max-w-4xl">
            <p className="eyebrow">{t.meet.eyebrow}</p>
            <h2 id="meet" className="h-section mt-4">{t.meet.title}</h2>
            <p className="mt-7 text-[clamp(1.25rem,2.2vw,1.75rem)] leading-[1.45] tracking-tight text-ink/80">{t.meet.body}</p>
          </Reveal>
          <ol className="mt-16 grid gap-3 md:grid-cols-4">
            {t.meet.modes.map((m, i) => {
              const focus = i === 3;
              return (
                <Reveal as="li" key={m.verb} delay={i * 0.08} className={`relative flex flex-col rounded-[1.5rem] p-6 ${focus ? "glass-dark text-white" : "bg-white ring-1 ring-line"}`}>
                  <span className={`font-mono text-[0.6875rem] uppercase tracking-[0.12em] ${focus ? "text-jade-bright" : "text-ink/45"}`}>0{i + 1} · {m.verb}</span>
                  <h3 className={`mt-10 text-lg font-semibold tracking-tight ${focus ? "text-white" : ""}`}>{m.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${focus ? "text-white/70" : "text-muted"}`}>{m.body}</p>
                  {focus && <span className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-jade animate-pulse-dot" aria-hidden />}
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ——— How it works ——— */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32" aria-labelledby="how">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead id="how" eyebrow={t.how.eyebrow} title={t.how.title} lead={t.how.lead} />
          <Link href={h("/technology")} className="btn btn-ghost">{d.common.learnMore} <ArrowUpRight className="h-4 w-4" aria-hidden /></Link>
        </div>
        <ol className="relative mt-16 grid gap-4 lg:grid-cols-5">
          <div className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-gradient-to-r from-iris/40 via-jade to-ink/30 lg:block" aria-hidden />
          {t.how.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="relative flex gap-5 lg:block">
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-mono text-xs font-medium text-ink shadow-[0_0_0_1px_var(--color-line-strong),0_6px_16px_-6px_rgb(0_200_150/0.5)]">
                {i + 1}
              </span>
              <div className="lg:mt-6 lg:pr-4">
                <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ——— Cognitive reliability ——— */}
      <section className="border-y border-line bg-white py-24 sm:py-32" aria-labelledby="reliability">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead id="reliability" eyebrow={t.reliability.eyebrow} title={t.reliability.title} lead={t.reliability.lead} />
            <Link href={h("/benchmarks")} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-jade-deep hover:underline">NCRI — NEUVIA Cognitive Reliability Index <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-[1.5rem] bg-line ring-1 ring-line sm:grid-cols-2">
            {t.reliability.dims.map((dim, i) => (
              <Reveal as="li" key={dim.title} delay={(i % 2) * 0.06} className="bg-white p-6">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90" aria-hidden>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E2EBE7" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#00C896" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(0.35 + ((i * 37) % 50) / 100) * 88} 88`} />
                  </svg>
                  <h3 className="font-semibold tracking-tight">{dim.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{dim.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— Lab ——— */}
      <section id="lab" className="relative isolate overflow-hidden py-24 sm:py-32" aria-labelledby="lab-title">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_20%,rgb(0_200_150/0.16),transparent_70%),radial-gradient(50%_50%_at_90%_70%,rgb(79_107_255/0.12),transparent_70%)]" aria-hidden />
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">{t.lab.eyebrow}</p>
            <h2 id="lab-title" className="h-section mt-4">{t.lab.title}</h2>
            <p className="lead mt-5 max-w-2xl">{t.lab.lead}</p>
          </Reveal>
          <div className="mt-12">
            <ReliabilityLab disclaimer={t.lab.disclaimer} />
          </div>
        </div>
      </section>

      {/* ——— Research foundation ——— */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32" aria-labelledby="foundation">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead id="foundation" eyebrow={t.research.eyebrow} title={t.research.title} lead={t.research.lead} />
          <Link href={h("/research")} className="btn btn-ghost">{d.nav.research} <ArrowUpRight className="h-4 w-4" aria-hidden /></Link>
        </div>
        <ul className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {t.research.fields.map((f, i) => (
            <Reveal as="li" key={f.title} delay={(i % 3) * 0.06} className="border-t border-line py-5">
              <h3 className="flex items-baseline gap-3 font-semibold tracking-tight"><span className="font-mono text-[0.6875rem] text-jade-deep">{String(i + 1).padStart(2, "0")}</span>{f.title}</h3>
              <p className="mt-1.5 pl-8 text-sm leading-relaxed text-muted">{f.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ——— Audience ——— */}
      <section className="bg-paper py-24 sm:py-28" aria-labelledby="audience">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHead id="audience" eyebrow={t.audience.eyebrow} title={t.audience.title} />
          <ul className="mt-12 flex flex-wrap gap-2.5">
            {t.audience.items.map((a, i) => (
              <Reveal as="li" key={a} delay={(i % 5) * 0.05} className="flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-[0.9375rem] font-medium text-ink shadow-[0_0_0_1px_var(--color-line)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-jade-deep"><Check className="h-3 w-3" strokeWidth={3} aria-hidden /></span>
                {a}
              </Reveal>
            ))}
          </ul>
          <Link href={h("/solutions")} className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-jade-deep hover:underline">{d.nav.solutions} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>

      {/* ——— Manifesto ——— */}
      <section className="relative isolate overflow-hidden bg-ink py-28 text-white sm:py-36" aria-labelledby="manifesto">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_80%_20%,rgb(0_200_150/0.22),transparent_70%),radial-gradient(40%_50%_at_10%_90%,rgb(79_107_255/0.16),transparent_70%)]" aria-hidden />
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p id="manifesto" className="font-mono text-xs uppercase tracking-[0.14em] text-jade-bright">{t.manifesto.eyebrow}</p>
          <blockquote className="mt-8 space-y-5">
            {t.manifesto.lines.map((line, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className={i === 0 ? "text-[clamp(1.6rem,3.4vw,2.6rem)] font-medium leading-[1.2] tracking-tight" : i === 4 ? "text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-jade-bright" : "text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-white/70"}>{line}</p>
              </Reveal>
            ))}
          </blockquote>
          <p className="mt-12 flex items-center gap-3 text-sm text-white/50"><span className="h-px w-10 bg-white/30" />NEUVIA · {site.slogan}</p>
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32" aria-labelledby="faq">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{t.faq.eyebrow}</p>
            <h2 id="faq" className="h-section mt-4">{t.faq.title}</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {d.faq.map((f) => (
              <details key={f.q} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[1.0625rem] font-medium tracking-tight">
                  <h3>{f.q}</h3>
                  <Plus className="h-5 w-5 shrink-0 text-ink/50 transition-transform duration-300 group-open:rotate-45 group-open:text-jade-deep" aria-hidden />
                </summary>
                <p className="pb-5 pr-10 text-[0.9375rem] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Early access ——— */}
      <section className="px-3 sm:px-5" aria-labelledby="access">
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-20 sm:px-14 sm:py-24">
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#E9FCF5_0%,#FFFFFF_45%,#E8ECFF_100%)]" aria-hidden />
          <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-jade/30 blur-3xl" aria-hidden />
          <div className="absolute -bottom-32 left-10 -z-10 h-72 w-72 rounded-full bg-iris/20 blur-3xl" aria-hidden />
          <div className="glass mx-auto max-w-3xl px-6 py-12 text-center sm:px-12">
            <p className="eyebrow">{t.access.eyebrow}</p>
            <h2 id="access" className="h-section mt-4">{t.access.title}</h2>
            <p className="lead mx-auto mt-5 max-w-xl">{t.access.lead}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href={h("/early-access")} className="btn btn-primary">{t.access.primary} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link href={h("/contact")} className="btn btn-ghost">{t.access.secondary}</Link>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={[pageLd, faqLd]} />
    </>
  );
}
