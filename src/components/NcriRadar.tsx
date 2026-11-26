"use client";

import { useState } from "react";
import { NCRI_DIMENSIONS, NCRI_PROFILES, ncriScore } from "@/lib/simulation";

type ProfileName = keyof typeof NCRI_PROFILES;

export function NcriRadar() {
  const names = Object.keys(NCRI_PROFILES) as ProfileName[];
  const [active, setActive] = useState<ProfileName>(names[0]);
  const [compare, setCompare] = useState(false);
  const S = 340, c = S / 2, R = 120, n = NCRI_DIMENSIONS.length;
  const pt = (i: number, v: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v] as const;
  };
  const poly = (vals: readonly number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const values = NCRI_PROFILES[active];
  const other = names.find((x) => x !== active)!;

  return (
    <div className="glass grid gap-8 !rounded-[1.75rem] p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
      <div>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-coral">Synthetic data · not a measurement</p>
        <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Synthetic profile">
          {names.map((nm) => (
            <button key={nm} role="radio" aria-checked={active === nm} onClick={() => setActive(nm)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${active === nm ? "bg-ink text-white" : "bg-white/70 text-ink/70 ring-1 ring-line hover:text-ink"}`}>
              {nm}
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="accent-[#00C896]" /> Overlay {other}
        </label>
        <table className="mt-6 w-full text-sm">
          <caption className="sr-only">Dimension values for {active}</caption>
          <tbody>
            {NCRI_DIMENSIONS.map((d, i) => (
              <tr key={d} className="border-b border-line/70 last:border-0">
                <th scope="row" className="py-2 text-left font-normal text-ink/75">{d}</th>
                <td className="py-2 text-right font-mono tabular-nums">{values[i].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 flex items-baseline justify-between rounded-2xl bg-mist/80 px-4 py-3 text-sm">
          <span className="text-ink/70">Unweighted aggregate (placeholder weights)</span>
          <span className="font-mono text-lg font-medium">{ncriScore(values).toFixed(2)}</span>
        </p>
      </div>
      <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-full max-w-[380px]" role="img" aria-label={`Radar chart of ${active} across seven synthetic reliability dimensions.`}>
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon key={r} points={poly(NCRI_DIMENSIONS.map(() => r))} fill="none" stroke="#E2EBE7" />
        ))}
        {NCRI_DIMENSIONS.map((d, i) => {
          const [x, y] = pt(i, 1);
          const [lx, ly] = pt(i, 1.2);
          return (
            <g key={d}>
              <line x1={c} y1={c} x2={x} y2={y} stroke="#E2EBE7" />
              <text x={lx} y={ly} textAnchor={lx < c - 10 ? "end" : lx > c + 10 ? "start" : "middle"} dominantBaseline="middle" className="fill-ink/60 text-[9.5px]">{d}</text>
            </g>
          );
        })}
        {compare && <polygon points={poly(NCRI_PROFILES[other])} fill="rgba(79,107,255,0.10)" stroke="#4F6BFF" strokeWidth="1.5" strokeDasharray="4 3" />}
        <polygon points={poly(values)} fill="rgba(0,200,150,0.20)" stroke="#00B386" strokeWidth="2" strokeLinejoin="round" style={{ transition: "all .6s cubic-bezier(.22,1,.36,1)" }} />
        {values.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="#00B386" strokeWidth="2" />;
        })}
      </svg>
    </div>
  );
}
