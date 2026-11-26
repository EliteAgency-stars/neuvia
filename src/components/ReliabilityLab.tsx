"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FlaskConical, Info } from "lucide-react";
import { DEFAULT_PARAMS, SCENARIOS, simulate, type ScenarioId, type SimParams } from "@/lib/simulation";

const TABS = ["Initial state", "Anomalies", "Recommendations", "Simulated outcome", "Limitations", "Methodology"] as const;
const MODES = ["Observe only", "Recommend", "Authorized regulation"];

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[0.8125rem] font-medium text-ink/80">{label}</label>
        <output htmlFor={id} className="font-mono text-xs tabular-nums text-ink">{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range mt-2 w-full"
        style={{ background: `linear-gradient(to right, var(--color-jade) ${pct}%, var(--color-line) ${pct}%)` }}
      />
    </div>
  );
}

function Chart({ data, detectedAt, threshold, reduce }: { data: ReturnType<typeof simulate>["series"]; detectedAt: number | null; threshold: number; reduce: boolean | null }) {
  const W = 640, H = 260, pl = 40, pr = 14, pt = 16, pb = 30;
  const n = data.length;
  const x = (i: number) => pl + (i / (n - 1)) * (W - pl - pr);
  const yMin = 0.3;
  const y = (v: number) => pt + (1 - (Math.max(v, yMin) - yMin) / (1 - yMin)) * (H - pt - pb);
  const line = (k: "baseline" | "assisted") => data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[k]).toFixed(1)}`).join("");
  const area = `${line("assisted")}L${x(n - 1)},${H - pb}L${x(0)},${H - pb}Z`;
  const key = data.map((d) => d.assisted).join(",").length + "-" + data[n - 1].assisted;
  const ticks = [0.4, 0.6, 0.8, 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Simulated reliability over ${n} steps. Baseline ends at ${Math.round(data[n - 1].baseline * 100)}%, NEUVIA-assisted ends at ${Math.round(data[n - 1].assisted * 100)}%.${detectedAt !== null ? ` Anomaly detected at step ${detectedAt}.` : " No anomaly detected."}`}>
      <defs>
        <linearGradient id="lab-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00C896" stopOpacity="0.22" />
          <stop offset="1" stopColor="#00C896" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#E2EBE7" />
          <text x={pl - 8} y={y(t) + 4} textAnchor="end" className="fill-ink/45 font-mono text-[10px]">{Math.round(t * 100)}</text>
        </g>
      ))}
      <line x1={pl} x2={W - pr} y1={y(threshold)} y2={y(threshold)} stroke="#FF5A3C" strokeDasharray="4 4" strokeOpacity="0.6" />
      <text x={W - pr} y={y(threshold) - 6} textAnchor="end" className="fill-coral font-mono text-[10px]">detection threshold</text>
      {detectedAt !== null && (
        <g>
          <line x1={x(detectedAt)} x2={x(detectedAt)} y1={pt} y2={H - pb} stroke="#0B1714" strokeOpacity="0.25" />
          <rect x={x(detectedAt) - 34} y={pt - 2} width="68" height="16" rx="8" fill="#0B1714" />
          <text x={x(detectedAt)} y={pt + 9} textAnchor="middle" className="fill-white font-mono text-[9px]">detected · {detectedAt}</text>
        </g>
      )}
      <motion.path key={"a" + key} d={area} fill="url(#lab-area)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      <motion.path key={"b" + key} d={line("baseline")} fill="none" stroke="#0B1714" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="5 4" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path key={"c" + key} d={line("assisted")} fill="none" stroke="#00B386" strokeWidth="2.4" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
      <text x={pl} y={H - 8} className="fill-ink/45 font-mono text-[10px]">step 0</text>
      <text x={W - pr} y={H - 8} textAnchor="end" className="fill-ink/45 font-mono text-[10px]">step {n - 1}</text>
    </svg>
  );
}

export function ReliabilityLab({ disclaimer }: { disclaimer: string }) {
  const [scenario, setScenario] = useState<ScenarioId>("context-degradation");
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Simulated outcome");
  const reduce = useReducedMotion();
  const sc = SCENARIOS.find((s) => s.id === scenario)!;
  const result = useMemo(() => simulate(scenario, params), [scenario, params]);
  const set = <K extends keyof SimParams>(k: K) => (v: SimParams[K]) => setParams((p) => ({ ...p, [k]: v }));
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  const delta = result.final.assisted - result.final.baseline;

  return (
    <div className="glass overflow-hidden !rounded-[1.75rem] p-0">
      <div className="flex items-start gap-3 border-b border-coral/15 bg-coral-soft/70 px-5 py-3.5 text-[0.8125rem] leading-relaxed text-ink/80 sm:px-7" role="note">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-coral" aria-hidden />
        <p><strong className="font-semibold text-ink">Conceptual simulation — not live model performance.</strong> {disclaimer}</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr]">
        {/* Scenarios */}
        <div className="border-b border-line/80 p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="eyebrow mb-3 hidden lg:block">Scenario</p>
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0" role="radiogroup" aria-label="Scenario">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={s.id === scenario}
                onClick={() => setScenario(s.id)}
                className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-left text-[0.8125rem] font-medium transition-all lg:w-full ${
                  s.id === scenario ? "bg-ink text-white shadow-lg shadow-ink/15" : "bg-white/60 text-ink/75 ring-1 ring-line hover:bg-white hover:text-ink"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-jade-deep"><FlaskConical className="h-3.5 w-3.5" aria-hidden /> {sc.indicator}</p>
              <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{sc.name}</h3>
              <p className="mt-1 text-sm text-muted">{sc.short}</p>
            </div>
            <div className="flex gap-1 rounded-full bg-mist p-1" role="radiogroup" aria-label="NEUVIA intervention level">
              {MODES.map((m, i) => (
                <button key={m} role="radio" aria-checked={params.intervention === i} onClick={() => set("intervention")(i)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${params.intervention === i ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
            <Slider label="Context length" value={params.contextK} min={4} max={256} step={4} onChange={set("contextK")} format={(v) => `${v}k tokens`} />
            <Slider label="Task complexity" value={params.complexity} min={0} max={1} step={0.05} onChange={set("complexity")} format={pct} />
            <Slider label="Simulated uncertainty" value={params.uncertainty} min={0} max={1} step={0.05} onChange={set("uncertainty")} format={pct} />
            <Slider label="Error frequency" value={params.errorRate} min={0} max={1} step={0.05} onChange={set("errorRate")} format={pct} />
            <Slider label="Iterations" value={params.iterations} min={10} max={60} step={1} onChange={set("iterations")} format={(v) => `${v} steps`} />
            <div className="flex items-end">
              <button onClick={() => setParams(DEFAULT_PARAMS)} className="text-xs font-medium text-jade-deep underline-offset-4 hover:underline">Reset parameters</button>
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-white/70 p-3 ring-1 ring-line sm:p-4">
            <div className="mb-2 flex flex-wrap items-center gap-4 px-1 text-xs text-muted">
              <span className="flex items-center gap-2"><span className="h-0.5 w-5 bg-[#00B386]" /> NEUVIA-assisted (simulated)</span>
              <span className="flex items-center gap-2"><span className="h-0 w-5 border-t-2 border-dashed border-ink/50" /> Baseline (simulated)</span>
              <span className="ml-auto font-mono">Synthetic reliability index</span>
            </div>
            <Chart data={result.series} detectedAt={result.detectedAt} threshold={result.threshold} reduce={reduce} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Detection", result.detectedAt === null ? "None" : `Step ${result.detectedAt}`],
              ["Baseline (end)", pct(result.final.baseline)],
              ["Assisted (end)", `${pct(result.final.assisted)}${delta > 0.005 ? ` ↑${Math.round(delta * 100)}` : ""}`],
              ["Monitoring overhead", `~${result.final.overheadPct}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-mist/70 px-4 py-3">
                <dt className="text-[0.6875rem] uppercase tracking-[0.08em] text-ink/50">{k}</dt>
                <dd className="mt-1 font-mono text-[1.0625rem] font-medium tabular-nums text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Simulation details">
              {TABS.map((t) => (
                <button key={t} role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="lab-panel" onClick={() => setTab(t)} className={`relative shrink-0 px-3 pb-2.5 pt-1 text-[0.8125rem] font-medium transition-colors ${tab === t ? "text-ink" : "text-ink/50 hover:text-ink/80"}`}>
                  {t}
                  {tab === t && <motion.span layoutId="lab-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-jade" />}
                </button>
              ))}
            </div>
            <div id="lab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="min-h-[150px] pt-4 text-sm leading-relaxed text-ink/80">
              <AnimatePresence mode="wait">
                <motion.div key={tab + scenario} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
                  {tab === "Initial state" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <p>Simulated starting reliability: <strong className="font-mono">{pct(result.initial.reliability)}</strong>. Signals the evaluation layer would observe (with authorization):</p>
                      <ul className="space-y-1.5">{sc.signals.map((s) => <li key={s} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-jade" />{s}</li>)}</ul>
                    </div>
                  )}
                  {tab === "Anomalies" && (
                    <div className="space-y-2">
                      <p>{result.detectedAt === null ? "No anomaly crossed the detection threshold under the current conditions. Try increasing context length, uncertainty or error frequency." : sc.anomaly}</p>
                      <p className="text-muted">Simulated near-threshold alerts discarded as likely false positives: <span className="font-mono">{result.falsePositives}</span>.</p>
                    </div>
                  )}
                  {tab === "Recommendations" && (
                    <ol className="space-y-2">{sc.recommendations.map((r, i) => <li key={r} className="flex gap-3"><span className="font-mono text-xs text-jade-deep">0{i + 1}</span>{r}</li>)}</ol>
                  )}
                  {tab === "Simulated outcome" && (
                    <ol className="relative space-y-2.5 border-l border-line pl-5">
                      {result.events.map((e, i) => (
                        <li key={i} className="relative">
                          <span className={`absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${e.phase === "diagnose" ? "bg-coral" : e.phase === "verify" ? "bg-ink" : e.phase === "observe" ? "bg-iris" : "bg-jade"}`} />
                          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-ink/45">{e.phase} · step {e.step}</span>
                          <p>{e.text}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                  {tab === "Limitations" && (
                    <ul className="space-y-1.5">
                      {[...sc.limitations, "An evaluation layer adds latency, cost and its own failure modes", "Results depend on the access level granted (black-, grey- or white-box)"].map((l) => <li key={l} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />{l}</li>)}
                    </ul>
                  )}
                  {tab === "Methodology" && (
                    <p>
                      Each scenario defines a synthetic risk curve driven by weighted parameters (context, complexity, uncertainty, error frequency) and a growth term over steps. A seeded pseudo-random generator adds noise, so identical inputs give identical outputs. Detection fires when the risk stays above a fixed threshold for more than two consecutive steps. Interventions reduce risk by an illustrative, scenario-specific factor, ramped over four steps, and add monitoring overhead. Verification compares the final 20% of steps. None of these constants are empirical.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
