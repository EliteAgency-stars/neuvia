import { describe, expect, it } from "vitest";
import { simulate, SCENARIOS, DEFAULT_PARAMS, ncriScore, NCRI_PROFILES } from "@/lib/simulation";

describe("Cognitive Reliability Lab simulation", () => {
  it("is deterministic for identical inputs", () => {
    for (const s of SCENARIOS) expect(simulate(s.id, DEFAULT_PARAMS)).toEqual(simulate(s.id, DEFAULT_PARAMS));
  });

  it("keeps every value within [0,1] and honours the iteration count", () => {
    for (const s of SCENARIOS) {
      const r = simulate(s.id, { ...DEFAULT_PARAMS, iterations: 33, errorRate: 1, uncertainty: 1, complexity: 1, contextK: 256 });
      expect(r.series).toHaveLength(33);
      for (const p of r.series) {
        expect(p.baseline).toBeGreaterThanOrEqual(0);
        expect(p.baseline).toBeLessThanOrEqual(1);
        expect(p.assisted).toBeGreaterThanOrEqual(0);
        expect(p.assisted).toBeLessThanOrEqual(1);
      }
    }
  });

  it("detects anomalies under high pressure and not under trivial conditions", () => {
    const hard = simulate("reasoning-loops", { ...DEFAULT_PARAMS, complexity: 1, errorRate: 1, uncertainty: 1, contextK: 256 });
    expect(hard.detectedAt).not.toBeNull();
    const easy = simulate("overconfidence", { contextK: 4, complexity: 0, uncertainty: 0, errorRate: 0, iterations: 20, intervention: 1 });
    expect(easy.detectedAt).toBeNull();
    expect(easy.verification).toBe("not-applicable");
  });

  it("observe-only mode never changes the outcome", () => {
    const r = simulate("tool-failure", { ...DEFAULT_PARAMS, errorRate: 1, intervention: 0 });
    for (const p of r.series) expect(p.assisted).toBeCloseTo(p.baseline, 6);
  });

  it("authorized regulation is at least as reliable as recommendation in the tail", () => {
    const p = { ...DEFAULT_PARAMS, errorRate: 0.9, complexity: 0.9 };
    const rec = simulate("context-degradation", { ...p, intervention: 1 });
    const reg = simulate("context-degradation", { ...p, intervention: 2 });
    expect(reg.final.assisted).toBeGreaterThanOrEqual(rec.final.assisted);
    expect(reg.final.overheadPct).toBeGreaterThan(rec.final.overheadPct);
  });

  it("clamps out-of-range parameters", () => {
    const r = simulate("behavioral-drift", { contextK: 99999, complexity: 5, uncertainty: -3, errorRate: 2, iterations: 1000, intervention: 9 });
    expect(r.series).toHaveLength(60);
  });

  it("computes a bounded NCRI aggregate", () => {
    for (const v of Object.values(NCRI_PROFILES)) {
      const s = ncriScore(v);
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    }
  });
});
