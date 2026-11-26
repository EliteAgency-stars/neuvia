"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  labels: { model: string; neuvia: string; caption: string; phases: string[] };
};

type Node = { x: number; y: number; layer: number };
type Edge = [number, number];

const LAYERS = [5, 8, 8, 5];
const LAYER_X = [0.07, 0.22, 0.37, 0.52];
const CYCLE = 6.4; // seconds per Observe → Detect → Recommend → Verify loop
const PHASES = [0, 0.3, 0.5, 0.75]; // phase start offsets (fraction of cycle)
const TARGETS = [9, 15, 7, 18, 11, 14];

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildModel() {
  const r = rng(7);
  const nodes: Node[] = [];
  LAYERS.forEach((count, li) => {
    for (let i = 0; i < count; i++) {
      const y = 0.14 + ((i + 0.5) / count) * 0.72 + (r() - 0.5) * 0.04;
      nodes.push({ x: LAYER_X[li] + (r() - 0.5) * 0.025, y, layer: li });
    }
  });
  const edges: Edge[] = [];
  let offset = 0;
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const a0 = offset, a1 = offset + LAYERS[li], b1 = a1 + LAYERS[li + 1];
    for (let a = a0; a < a1; a++) for (let b = a1; b < b1; b++) if (r() < 0.42) edges.push([a, b]);
    offset = a1;
  }
  return { nodes, edges };
}

export function NeuralField({ labels }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(2);

  useEffect(() => {
    const el = canvas.current, box = wrap.current;
    if (!el || !box) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { nodes, edges } = buildModel();
    const signals = Array.from({ length: 26 }, (_, i) => ({ e: (i * 7) % edges.length, t: (i * 0.137) % 1, v: 0.18 + ((i * 31) % 10) / 40 }));
    let W = 0, H = 0, raf = 0, visible = true, last = performance.now(), clock = reduce ? CYCLE * 0.6 : 0, lastPhase = -1;

    const resize = () => {
      const rect = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      el.width = Math.round(W * dpr); el.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw();
    };

    const ring = () => {
      const cx = W * 0.8, cy = H * 0.5, rad = Math.min(H * 0.2, W * 0.14);
      const pts = Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad };
      });
      return { cx, cy, rad, pts };
    };

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      const t = clock;
      const cycleIndex = Math.floor(t / CYCLE);
      const f = (t % CYCLE) / CYCLE;
      const ph = f >= PHASES[3] ? 3 : f >= PHASES[2] ? 2 : f >= PHASES[1] ? 1 : 0;
      if (ph !== lastPhase) { lastPhase = ph; setPhase(ph); }
      const target = TARGETS[cycleIndex % TARGETS.length];
      const P = (n: Node) => ({ x: n.x * W, y: n.y * H });
      const { cx, cy, rad, pts } = ring();

      // model edges
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = "rgba(11,23,20,0.09)";
      ctx!.beginPath();
      for (const [a, b] of edges) { const A = P(nodes[a]), B = P(nodes[b]); ctx!.moveTo(A.x, A.y); ctx!.lineTo(B.x, B.y); }
      ctx!.stroke();

      // signals flowing through the model
      for (const s of signals) {
        const [a, b] = edges[s.e]; const A = P(nodes[a]), B = P(nodes[b]);
        const x = A.x + (B.x - A.x) * s.t, y = A.y + (B.y - A.y) * s.t;
        ctx!.fillStyle = `rgba(79,107,255,${0.25 + 0.55 * Math.sin(Math.PI * s.t)})`;
        ctx!.beginPath(); ctx!.arc(x, y, 1.8, 0, Math.PI * 2); ctx!.fill();
      }

      // probe lines (NEUVIA observing the model)
      const T = P(nodes[target]);
      const probeAlpha = ph === 0 ? 0.1 + 0.25 * Math.sin((f / PHASES[1]) * Math.PI) : 0.08;
      ctx!.setLineDash([3, 5]);
      ctx!.strokeStyle = `rgba(0,150,112,${probeAlpha})`;
      ctx!.beginPath();
      [16, 18, 21, 22, 24, 25, 13, 9, 7].forEach((ni, i) => { const N = P(nodes[ni]); const S = pts[(6 + i) % 9]; ctx!.moveTo(S.x, S.y); ctx!.lineTo(N.x, N.y); });
      ctx!.stroke();
      ctx!.setLineDash([]);

      // intervention beam
      if (ph === 2) {
        const k = (f - PHASES[2]) / (PHASES[3] - PHASES[2]);
        const S = pts[7];
        const grad = ctx!.createLinearGradient(S.x, S.y, T.x, T.y);
        grad.addColorStop(0, "rgba(0,200,150,0.0)");
        grad.addColorStop(Math.min(k, 1), "rgba(0,200,150,0.75)");
        grad.addColorStop(Math.min(k + 0.02, 1), "rgba(0,200,150,0)");
        ctx!.strokeStyle = grad; ctx!.lineWidth = 2;
        ctx!.beginPath(); ctx!.moveTo(S.x, S.y); ctx!.quadraticCurveTo((S.x + T.x) / 2, Math.min(S.y, T.y) - H * 0.12, T.x, T.y); ctx!.stroke();
        ctx!.lineWidth = 1;
      }

      // model nodes
      nodes.forEach((n, i) => {
        const p = P(n);
        let color = "rgba(11,23,20,0.78)", r = 3.2;
        if (i === target) {
          if (ph === 1 || ph === 2) {
            color = "#FF5A3C"; r = 4.4;
            const rr = 6 + ((t * 18) % 16);
            ctx!.strokeStyle = `rgba(255,90,60,${0.5 * (1 - (rr - 6) / 16)})`;
            ctx!.beginPath(); ctx!.arc(p.x, p.y, rr, 0, Math.PI * 2); ctx!.stroke();
          } else if (ph === 3) {
            color = "#00C896"; r = 4.4;
            const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
            g.addColorStop(0, "rgba(0,200,150,0.35)"); g.addColorStop(1, "rgba(0,200,150,0)");
            ctx!.fillStyle = g; ctx!.beginPath(); ctx!.arc(p.x, p.y, 18, 0, Math.PI * 2); ctx!.fill();
          }
        }
        ctx!.fillStyle = color; ctx!.beginPath(); ctx!.arc(p.x, p.y, r, 0, Math.PI * 2); ctx!.fill();
      });

      // NEUVIA ring
      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad * 1.9);
      glow.addColorStop(0, "rgba(0,200,150,0.16)"); glow.addColorStop(1, "rgba(0,200,150,0)");
      ctx!.fillStyle = glow; ctx!.beginPath(); ctx!.arc(cx, cy, rad * 1.9, 0, Math.PI * 2); ctx!.fill();
      ctx!.strokeStyle = "rgba(0,160,120,0.35)"; ctx!.lineWidth = 1.2;
      ctx!.beginPath(); pts.forEach((p, i) => { const q = pts[(i + 1) % 9]; ctx!.moveTo(p.x, p.y); ctx!.lineTo(q.x, q.y); ctx!.moveTo(p.x, p.y); ctx!.lineTo(cx, cy); }); ctx!.stroke();
      const spin = t * 0.6;
      ctx!.strokeStyle = "rgba(0,200,150,0.5)"; ctx!.lineWidth = 1.5;
      ctx!.beginPath(); ctx!.arc(cx, cy, rad * 1.28, spin, spin + Math.PI * 0.6); ctx!.stroke();
      ctx!.beginPath(); ctx!.arc(cx, cy, rad * 1.28, spin + Math.PI, spin + Math.PI * 1.6); ctx!.stroke();
      ctx!.lineWidth = 1;
      pts.forEach((p) => { ctx!.fillStyle = "#00C896"; ctx!.beginPath(); ctx!.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx!.fill(); });
      ctx!.fillStyle = "#0B1714"; ctx!.beginPath(); ctx!.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx!.fill();
      ctx!.strokeStyle = "#00C896"; ctx!.lineWidth = 2; ctx!.beginPath(); ctx!.arc(cx, cy, 9, 0, Math.PI * 2); ctx!.stroke(); ctx!.lineWidth = 1;
    }

    const loop = (now: number) => {
      const dt = Math.max(0, Math.min((now - last) / 1000, 0.05)); last = now;
      clock += dt;
      for (const s of signals) { s.t += s.v * dt; if (s.t >= 1) { s.t = 0; s.e = (s.e + 11) % edges.length; } }
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();
    if (reduce) { draw(); return () => ro.disconnect(); }

    const io = new IntersectionObserver(([entry]) => {
      const was = visible; visible = entry.isIntersecting && !document.hidden;
      if (visible && !was) { last = performance.now(); raf = requestAnimationFrame(loop); }
      if (!visible) cancelAnimationFrame(raf);
    });
    io.observe(box);
    const onVis = () => { visible = !document.hidden; if (visible) { last = performance.now(); raf = requestAnimationFrame(loop); } else cancelAnimationFrame(raf); };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const tone = phase === 1 || phase === 2 ? (phase === 1 ? "bg-coral" : "bg-jade") : phase === 3 ? "bg-jade" : "bg-iris";

  return (
    <figure className="relative h-full w-full">
      <div ref={wrap} className="absolute inset-0">
        <canvas ref={canvas} className="h-full w-full" aria-hidden />
      </div>
      <span className="absolute left-[4%] top-[4%] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/55">{labels.model}</span>
      <span className="absolute right-[6%] top-[14%] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-jade-deep">{labels.neuvia}</span>
      <div className="glass absolute bottom-[10%] right-[4%] flex items-center gap-3 px-4 py-3 sm:right-[8%]" aria-live="off">
        <span className={`h-2 w-2 rounded-full ${tone} transition-colors duration-500`} aria-hidden />
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/50">NEUVIA · {String(phase + 1).padStart(2, "0")}/04</p>
          <p className="text-[0.8125rem] font-medium text-ink">{labels.phases[phase]}</p>
        </div>
      </div>
      <figcaption className="absolute bottom-0 left-[4%] text-[0.6875rem] text-ink/45">{labels.caption}</figcaption>
    </figure>
  );
}
