/**
 * NEUVIA Cognitive Reliability Lab — deterministic synthetic simulation.
 *
 * IMPORTANT: this module generates SYNTHETIC data to illustrate how an
 * evaluation layer *could* observe, diagnose, recommend and verify.
 * It is not a model of any real AI system and its outputs are not
 * measurements. Same inputs always produce the same outputs.
 */

export type ScenarioId =
  | "context-degradation"
  | "hallucination-risk"
  | "reasoning-loops"
  | "contradictions"
  | "overconfidence"
  | "tool-failure"
  | "resource-inefficiency"
  | "behavioral-drift";

export type SimParams = {
  contextK: number; // context length in thousands of tokens (4–256)
  complexity: number; // 0–1
  uncertainty: number; // simulated input ambiguity 0–1
  errorRate: number; // injected base error frequency 0–1
  iterations: number; // 10–60 steps
  intervention: number; // 0 = observe only, 1 = recommend, 2 = authorized regulation
};

export type Scenario = {
  id: ScenarioId;
  name: string;
  short: string;
  indicator: string; // primary indicator name
  signals: string[];
  anomaly: string;
  recommendations: string[];
  limitations: string[];
  /** Sensitivities of the primary risk to each parameter. */
  w: { ctx: number; cx: number; unc: number; err: number; growth: number };
  /** Fraction of risk an authorized intervention can plausibly remove (illustrative). */
  efficacy: number;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "context-degradation",
    name: "Context degradation",
    short: "Early instructions lose influence as the context window fills.",
    indicator: "Instruction adherence loss",
    signals: ["Context length per step", "Reference to early instructions", "Answer consistency vs. baseline"],
    anomaly: "Adherence to instructions placed early in the context declines as the context grows past a threshold.",
    recommendations: ["Summarize and re-anchor key instructions", "Retrieve only relevant context instead of appending everything", "Validate the final answer against the original requirements"],
    limitations: ["Real degradation depends on architecture, position of information and task type", "Synthetic curve; not derived from any model's measured behavior"],
    w: { ctx: 0.55, cx: 0.2, unc: 0.1, err: 0.15, growth: 0.9 },
    efficacy: 0.55,
  },
  {
    id: "hallucination-risk",
    name: "Hallucination risk",
    short: "Fluent answers drift away from available evidence.",
    indicator: "Ungrounded claim rate",
    signals: ["Claims without supporting source", "Self-consistency across resamples", "Retrieval coverage"],
    anomaly: "The share of claims not supported by the provided evidence rises with ambiguity and task complexity.",
    recommendations: ["Require citations to provided sources", "Cross-check claims with independent resampling", "Abstain or escalate when evidence is missing"],
    limitations: ["Detecting hallucinations reliably is an open research problem", "Evaluator models can hallucinate themselves"],
    w: { ctx: 0.1, cx: 0.3, unc: 0.4, err: 0.2, growth: 0.4 },
    efficacy: 0.45,
  },
  {
    id: "reasoning-loops",
    name: "Repetitive reasoning loops",
    short: "An agent repeats similar steps without making progress.",
    indicator: "Loop probability",
    signals: ["Step similarity over a sliding window", "Progress toward goal state", "Token spend per step"],
    anomaly: "Consecutive steps become highly similar while measurable progress stalls.",
    recommendations: ["Cap iterations and enforce a progress check", "Reformulate the sub-goal or change strategy", "Escalate to human review after repeated stalls"],
    limitations: ["Some legitimate tasks are naturally iterative", "Similarity thresholds need per-task calibration"],
    w: { ctx: 0.15, cx: 0.4, unc: 0.15, err: 0.3, growth: 1.2 },
    efficacy: 0.7,
  },
  {
    id: "contradictions",
    name: "Contradictory responses",
    short: "Statements within a task become mutually incompatible.",
    indicator: "Contradiction rate",
    signals: ["Pairwise entailment between claims", "Stated facts vs. earlier turns", "Decision reversals"],
    anomaly: "Later statements contradict earlier ones, especially after long contexts or topic shifts.",
    recommendations: ["Maintain an explicit fact ledger for the task", "Run consistency checks before final output", "Surface the contradiction to the user instead of silently choosing"],
    limitations: ["Automatic contradiction detection has false positives", "Some apparent contradictions are legitimate updates"],
    w: { ctx: 0.35, cx: 0.3, unc: 0.2, err: 0.15, growth: 0.7 },
    efficacy: 0.5,
  },
  {
    id: "overconfidence",
    name: "Excessive confidence",
    short: "Expressed certainty exceeds actual accuracy.",
    indicator: "Calibration gap",
    signals: ["Stated or token-level confidence", "Observed accuracy on verifiable items", "Expected calibration error"],
    anomaly: "Confidence stays high while accuracy falls as ambiguity increases.",
    recommendations: ["Recalibrate confidence using held-out verification", "Express uncertainty ranges instead of point answers", "Route low-calibration cases to verification"],
    limitations: ["Token probabilities are not always available", "Calibration measured on one distribution may not transfer"],
    w: { ctx: 0.05, cx: 0.25, unc: 0.55, err: 0.15, growth: 0.3 },
    efficacy: 0.6,
  },
  {
    id: "tool-failure",
    name: "Tool execution failure",
    short: "Silent errors when calling APIs, code or external tools.",
    indicator: "Unhandled tool error rate",
    signals: ["Tool call status codes", "Schema validation of arguments", "Retries and fallbacks"],
    anomaly: "Tool errors are returned but not acknowledged, and the agent continues on invalid results.",
    recommendations: ["Validate tool arguments against schemas", "Make tool errors explicit in the agent's context", "Apply bounded retries and safe fallbacks"],
    limitations: ["Tool behavior depends on external systems outside NEUVIA's control", "Requires access to execution traces (grey-box)"],
    w: { ctx: 0.1, cx: 0.25, unc: 0.1, err: 0.55, growth: 0.5 },
    efficacy: 0.75,
  },
  {
    id: "resource-inefficiency",
    name: "Resource inefficiency",
    short: "Compute and tokens grow faster than useful progress.",
    indicator: "Waste ratio",
    signals: ["Tokens per completed sub-goal", "Latency per step", "Redundant tool calls"],
    anomaly: "Resource consumption accelerates while task progress grows linearly or stalls.",
    recommendations: ["Prune redundant context and calls", "Route simple sub-tasks to smaller models", "Set explicit budgets per task"],
    limitations: ["Efficiency targets trade off against quality", "The evaluation layer itself adds overhead"],
    w: { ctx: 0.35, cx: 0.35, unc: 0.05, err: 0.25, growth: 0.8 },
    efficacy: 0.5,
  },
  {
    id: "behavioral-drift",
    name: "Behavioral drift",
    short: "Behavior changes gradually across time or versions.",
    indicator: "Drift from baseline",
    signals: ["Distribution of outputs vs. reference", "Refusal and policy-adherence rates", "Regression test results"],
    anomaly: "Output distribution diverges progressively from the validated baseline.",
    recommendations: ["Run continuous regression evaluations", "Pin and compare against a reference version", "Require human sign-off before promoting changes"],
    limitations: ["Some drift is intended improvement", "Baselines must be refreshed and versioned"],
    w: { ctx: 0.05, cx: 0.2, unc: 0.25, err: 0.5, growth: 1.0 },
    efficacy: 0.55,
  },
];

export const DEFAULT_PARAMS: SimParams = { contextK: 64, complexity: 0.55, uncertainty: 0.45, errorRate: 0.3, iterations: 40, intervention: 1 };

export type StepPoint = { step: number; baseline: number; assisted: number; overhead: number };
export type SimEvent = { step: number; phase: "observe" | "diagnose" | "recommend" | "regulate" | "verify"; text: string };

export type SimResult = {
  series: StepPoint[];
  detectedAt: number | null;
  threshold: number;
  initial: { reliability: number; risk: number };
  final: { baseline: number; assisted: number; overheadPct: number };
  falsePositives: number;
  events: SimEvent[];
  verification: "improved" | "no-change" | "not-applicable";
};

/** Small deterministic PRNG (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

function hashParams(id: string, p: SimParams) {
  const s = `${id}|${p.contextK}|${p.complexity.toFixed(2)}|${p.uncertainty.toFixed(2)}|${p.errorRate.toFixed(2)}|${p.iterations}|${p.intervention}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function simulate(id: ScenarioId, input: SimParams): SimResult {
  const sc = SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
  const p: SimParams = {
    contextK: clamp(input.contextK, 4, 256),
    complexity: clamp(input.complexity),
    uncertainty: clamp(input.uncertainty),
    errorRate: clamp(input.errorRate),
    iterations: Math.round(clamp(input.iterations, 10, 60)),
    intervention: Math.round(clamp(input.intervention, 0, 2)),
  };
  const rand = seeded(hashParams(id, p));
  const ctxNorm = Math.log2(p.contextK / 4) / Math.log2(64); // 0 at 4k, 1 at 256k
  const pressure = sc.w.ctx * ctxNorm + sc.w.cx * p.complexity + sc.w.unc * p.uncertainty + sc.w.err * p.errorRate;
  const threshold = 0.32;
  const lag = 2; // observation window before a diagnosis is possible
  const strength = [0, 0.6, 1][p.intervention];

  const series: StepPoint[] = [];
  const events: SimEvent[] = [{ step: 0, phase: "observe", text: `Baseline established. Monitoring: ${sc.signals.join(", ")}.` }];
  let detectedAt: number | null = null;
  let aboveCount = 0;
  let falsePositives = 0;
  let assistedRisk = 0;

  for (let i = 0; i < p.iterations; i++) {
    const progress = i / (p.iterations - 1);
    const noise = (rand() - 0.5) * 0.06;
    const spike = rand() < p.errorRate * 0.12 ? 0.08 * rand() : 0;
    const baselineRisk = clamp(0.04 + pressure * (0.35 + sc.w.growth * progress ** 1.35) + noise + spike, 0, 0.95);

    if (detectedAt === null) {
      aboveCount = baselineRisk > threshold ? aboveCount + 1 : 0;
      if (aboveCount > lag) {
        detectedAt = i;
        events.push({ step: i, phase: "diagnose", text: `Anomaly: ${sc.anomaly}` });
        events.push({ step: i, phase: "recommend", text: `Recommended: ${sc.recommendations[0]}.` });
        if (p.intervention === 2) events.push({ step: i + 1, phase: "regulate", text: "Authorized intervention applied within operator-defined bounds. Action logged and reversible." });
        if (p.intervention === 0) events.push({ step: i, phase: "observe", text: "Observe-only mode: anomaly reported to operator, no action taken." });
      } else if (baselineRisk > threshold * 0.85 && rand() < 0.08) {
        falsePositives++;
      }
    }

    let overhead = 0.03; // monitoring always costs something
    if (detectedAt !== null && i > detectedAt) {
      const ramp = clamp((i - detectedAt) / 4);
      const reduction = sc.efficacy * strength * ramp;
      assistedRisk = clamp(baselineRisk * (1 - reduction) + (strength > 0 ? 0.015 : 0));
      overhead += strength * 0.06;
    } else {
      assistedRisk = baselineRisk;
    }
    series.push({ step: i, baseline: +(1 - baselineRisk).toFixed(4), assisted: +(1 - assistedRisk).toFixed(4), overhead: +overhead.toFixed(4) });
  }

  const tail = series.slice(-Math.max(5, Math.round(p.iterations * 0.2)));
  const mean = (k: "baseline" | "assisted" | "overhead") => tail.reduce((s, x) => s + x[k], 0) / tail.length;
  const fb = mean("baseline"), fa = mean("assisted");
  let verification: SimResult["verification"] = "not-applicable";
  if (detectedAt !== null) {
    verification = fa - fb > 0.02 ? "improved" : "no-change";
    events.push({
      step: p.iterations - 1,
      phase: "verify",
      text:
        verification === "improved"
          ? "Post-intervention check: simulated reliability above baseline; no new anomaly introduced in this scenario."
          : p.intervention === 0
            ? "Verification not applicable: no intervention was performed (observe-only)."
            : "Post-intervention check: no meaningful simulated improvement. Escalate to human review.",
    });
  } else {
    events.push({ step: p.iterations - 1, phase: "verify", text: "No anomaly crossed the detection threshold under these conditions." });
  }

  return {
    series,
    detectedAt,
    threshold: 1 - threshold,
    initial: { reliability: series[0].baseline, risk: +(1 - series[0].baseline).toFixed(4) },
    final: { baseline: +fb.toFixed(4), assisted: +fa.toFixed(4), overheadPct: Math.round(mean("overhead") * 100) },
    falsePositives,
    events,
    verification,
  };
}

/** NCRI — synthetic illustrative profiles (not measurements). */
export const NCRI_DIMENSIONS = [
  "Logical consistency",
  "Contextual stability",
  "Uncertainty calibration",
  "Behavioral robustness",
  "Operational efficiency",
  "Goal integrity",
  "Tool reliability",
] as const;

export const NCRI_PROFILES = {
  "Synthetic profile A": [0.82, 0.58, 0.46, 0.71, 0.64, 0.88, 0.52],
  "Synthetic profile B": [0.66, 0.79, 0.73, 0.55, 0.81, 0.7, 0.77],
  "Synthetic profile C": [0.74, 0.42, 0.61, 0.83, 0.47, 0.76, 0.69],
} as const;

/** Weighted aggregate. Weights are placeholders pending research. */
export function ncriScore(values: readonly number[], weights: readonly number[] = NCRI_DIMENSIONS.map(() => 1)) {
  const tw = weights.reduce((a, b) => a + b, 0);
  return values.reduce((s, v, i) => s + clamp(v) * (weights[i] ?? 0), 0) / (tw || 1);
}
