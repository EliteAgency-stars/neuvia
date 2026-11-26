// NEUVIA — 20s vertical promo. Deterministic canvas renderer: draw(t) paints frame at time t (seconds).
// Phrase timings (P) come from the voiceover, injected as window.TIMING.
const W = 1080, H = 1920;
const C = { ink: "#070F0D", ink2: "#0B1714", white: "#FFFFFF", paper: "#F6FAF8", jade: "#00C896", jadeB: "#2BF0B4", jadeD: "#00785A", mint: "#C9F8E8", coral: "#FF5A3C", iris: "#4F6BFF", muted: "#56655F" };
const S = window.STRINGS;
const cv = document.getElementById("c"); cv.width = W; cv.height = H;
const ctx = cv.getContext("2d");
const bg = document.createElement("canvas"); bg.width = W; bg.height = H; const bx = bg.getContext("2d");

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOut = (k) => 1 - Math.pow(1 - k, 3);
const eInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eBack = (k) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// ——— Neural network layout (shared by dark + light acts) ———
const R = rng(42);
const NODES = [];
for (let i = 0; i < 46; i++) {
  const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 400;
  NODES.push({ x: 540 + Math.cos(a) * d * 1.05, y: 1010 + Math.sin(a) * d * 0.95, r: 5 + R() * 4, ph: R() * 6.28, bad: R() < 0.32 });
}
const EDGES = [];
NODES.forEach((n, i) => NODES.forEach((m, j) => { if (j > i && Math.hypot(n.x - m.x, n.y - m.y) < 175 && R() < 0.65) EDGES.push([i, j]); }));
const BAD = NODES.map((n, i) => (n.bad ? i : -1)).filter((i) => i >= 0);

// ——— Text: word-by-word reveal ———
function words(c, text, { x, y, size, font = "G7", color = C.white, t, start, dur, align = "center", maxW = 900, lh = 1.08, hl = {}, track = -0.035 }) {
  c.save();
  c.font = `${size}px ${font}`;
  c.letterSpacing = `${track * size}px`;
  const ws = text.split(" ");
  const lines = []; let line = [];
  for (const w of ws) { const test = [...line, w].join(" "); if (c.measureText(test).width > maxW && line.length) { lines.push(line); line = [w]; } else line.push(w); }
  lines.push(line);
  let idx = 0; const total = ws.length;
  lines.forEach((ln, li) => {
    const lw = c.measureText(ln.join(" ")).width;
    let cx = align === "center" ? x - lw / 2 : x;
    const cy = y + li * size * lh;
    ln.forEach((w) => {
      const k = eOut(prog(t, start + (idx / total) * dur, start + (idx / total) * dur + 0.32));
      const ww = c.measureText(w + " ").width;
      if (k > 0) {
        c.globalAlpha = k;
        c.fillStyle = hl[w.replace(/[^\w"]/g, "")] || color;
        c.filter = k < 1 ? `blur(${(1 - k) * 10}px)` : "none";
        c.fillText(w, cx, cy + (1 - k) * size * 0.35);
      }
      cx += ww; idx++;
    });
  });
  c.restore();
}

function grain(c, t, amt) {
  const r = rng(Math.floor(t * 30) + 7);
  c.save(); c.globalAlpha = amt;
  for (let i = 0; i < 1400; i++) { c.fillStyle = r() > 0.5 ? "#fff" : "#000"; c.fillRect(r() * W, r() * H, 2, 2); }
  c.restore();
}

function network(c, t, { dark, badAmt, healAmt, scan }) {
  c.save();
  c.lineWidth = 1.4;
  for (const [i, j] of EDGES) {
    const a = NODES[i], b = NODES[j];
    c.strokeStyle = dark ? "rgba(255,255,255,0.075)" : "rgba(11,23,20,0.08)";
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
  }
  // pulses along edges
  EDGES.forEach(([i, j], k) => {
    if (k % 3) return;
    const a = NODES[i], b = NODES[j];
    const p = (t * 0.5 + k * 0.137) % 1;
    c.fillStyle = dark ? `rgba(79,107,255,${0.6 * Math.sin(p * Math.PI)})` : `rgba(0,150,112,${0.5 * Math.sin(p * Math.PI)})`;
    c.beginPath(); c.arc(lerp(a.x, b.x, p), lerp(a.y, b.y, p), 3, 0, 6.28); c.fill();
  });
  NODES.forEach((n, i) => {
    const bi = BAD.indexOf(i);
    const isBad = bi >= 0 && badAmt > bi / BAD.length;
    const healed = bi >= 0 && healAmt > bi / BAD.length;
    let col = dark ? "rgba(255,255,255,0.82)" : C.ink2, r = n.r;
    if (isBad && !healed) {
      col = C.coral; r = n.r + 2 + Math.sin(t * 9 + n.ph) * 1.5;
      const rip = (t * 1.6 + n.ph) % 1;
      c.strokeStyle = hexA(C.coral, 0.55 * (1 - rip)); c.lineWidth = 2;
      c.beginPath(); c.arc(n.x, n.y, r + rip * 34, 0, 6.28); c.stroke();
    } else if (healed) {
      col = C.jade; r = n.r + 1.5;
      const g = c.createRadialGradient(n.x, n.y, 0, n.x, n.y, 34);
      g.addColorStop(0, hexA(C.jade, 0.35)); g.addColorStop(1, hexA(C.jade, 0));
      c.fillStyle = g; c.beginPath(); c.arc(n.x, n.y, 34, 0, 6.28); c.fill();
    }
    c.fillStyle = col; c.beginPath(); c.arc(n.x, n.y, r, 0, 6.28); c.fill();
  });
  if (scan > 0) {
    const a0 = t * 2.2;
    c.save(); c.globalAlpha = scan;
    const g = c.createConicGradient(a0, 540, 1010);
    g.addColorStop(0, hexA(C.jade, 0.0)); g.addColorStop(0.08, hexA(C.jade, 0.18)); g.addColorStop(0.1, hexA(C.jade, 0));
    c.fillStyle = g; c.beginPath(); c.arc(540, 1010, 470, 0, 6.28); c.fill();
    c.restore();
  }
  c.restore();
}

function mark(c, x, y, s, t, alpha = 1, inverse = false) {
  // NEUVIA isotype (two nodes in an ascending loop + synapse)
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(s / 32, s / 32); c.translate(16, 16); c.rotate((-32 * Math.PI) / 180); c.translate(-16, -16);
  c.lineCap = "round"; c.lineWidth = 2.4;
  c.strokeStyle = inverse ? "#fff" : C.ink2; c.beginPath(); c.moveTo(8.5, 16); c.bezierCurveTo(11.2, 7.6, 20.8, 7.6, 23.5, 16); c.stroke();
  c.strokeStyle = C.jade; c.beginPath(); c.moveTo(23.5, 16); c.bezierCurveTo(20.8, 24.4, 11.2, 24.4, 8.5, 16); c.stroke();
  c.fillStyle = inverse ? "#fff" : C.ink2; c.beginPath(); c.arc(8.5, 16, 3, 0, 6.28); c.fill();
  c.fillStyle = C.jade; c.beginPath(); c.arc(23.5, 16, 3, 0, 6.28); c.fill();
  c.strokeStyle = C.jade; c.lineWidth = 1.4; c.beginPath(); c.arc(16, 16, 1.7, 0, 6.28); c.stroke();
  c.restore();
}

function wordmark(c, x, y, h, color, alpha = 1) {
  const s = h / 20; c.save(); c.globalAlpha = alpha; c.translate(x - 49 * s, y - 10 * s); c.scale(s, s);
  c.strokeStyle = color; c.lineWidth = 2.6; c.lineJoin = "miter";
  const P = (d) => c.stroke(new Path2D(d));
  P("M0 20V0L14 20V0"); P("M32 0H20V20H32M20 10H30"); P("M38 0V12.5a7 7 0 0 0 14 0V0"); P("M58 0L65 20L72 0"); P("M78 0V20"); P("M84 20L91 0L98 20M86.8 12.5H95.2");
  c.restore();
}

// Liquid-glass panel: blurred backdrop + white body + specular rim
function glass(c, x, y, w, h, r, { dark = false, alpha = 1 } = {}) {
  c.save(); c.globalAlpha = alpha;
  rr(c, x, y, w, h, r); c.clip();
  c.filter = "blur(26px) saturate(160%)"; c.drawImage(bg, 0, 0); c.filter = "none";
  const body = c.createLinearGradient(x, y, x + w, y + h);
  if (dark) { body.addColorStop(0, "rgba(30,44,40,0.62)"); body.addColorStop(1, "rgba(11,23,20,0.5)"); }
  else { body.addColorStop(0, "rgba(255,255,255,0.78)"); body.addColorStop(1, "rgba(255,255,255,0.48)"); }
  c.fillStyle = body; c.fillRect(x, y, w, h);
  const spec = c.createRadialGradient(x + w * 0.2, y, 0, x + w * 0.2, y, w * 0.9);
  spec.addColorStop(0, dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.6)"); spec.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = spec; c.fillRect(x, y, w, h);
  c.restore();
  c.save(); c.globalAlpha = alpha;
  const rim = c.createLinearGradient(x, y, x + w, y + h);
  rim.addColorStop(0, dark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,1)"); rim.addColorStop(0.45, "rgba(255,255,255,0.15)"); rim.addColorStop(0.75, hexA(C.jade, 0.45)); rim.addColorStop(1, dark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.8)");
  c.strokeStyle = rim; c.lineWidth = 2.5; rr(c, x + 1, y + 1, w - 2, h - 2, r - 1); c.stroke();
  c.restore();
}

function draw(t) {
  const P = window.TIMING; // [{s,e}] x7 phrases
  const tLight = P[4].s - 0.15;            // switch to light act at "NEUVIA is building…"
  const wipe = eInOut(prog(t, tLight, tLight + 0.75));
  const dark = wipe < 1;

  // ——— Background layer (also used by glass blur) ———
  bx.save();
  bx.fillStyle = C.ink; bx.fillRect(0, 0, W, H);
  const pulse = t < P[3].s ? 0.5 + 0.5 * Math.pow(Math.max(0, Math.sin(t * Math.PI * 1.3)), 8) : 0.3;
  const vg = bx.createRadialGradient(540, 960, 200, 540, 960, 1300);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, `rgba(120,10,0,${0.10 + 0.22 * pulse * (t < P[4].s ? 1 : 0)})`);
  bx.fillStyle = vg; bx.fillRect(0, 0, W, H);
  if (t >= P[3].s - 0.3) {
    const k = eOut(prog(t, P[3].s - 0.3, P[3].s + 0.6));
    bx.globalAlpha = k * (1 - wipe);
    network(bx, t, { dark: true, badAmt: prog(t, P[3].s, P[3].e - 0.2), healAmt: 0, scan: 0 });
    bx.globalAlpha = 1;
  }
  // light act revealed by a circular wipe from the NEUVIA ring
  if (wipe > 0) {
    bx.save(); bx.beginPath(); bx.arc(540, 1010, wipe * 1500, 0, 6.28); bx.clip();
    bx.fillStyle = C.white; bx.fillRect(0, 0, W, H);
    const au = bx.createRadialGradient(820, 520, 0, 820, 520, 900);
    au.addColorStop(0, hexA(C.jade, 0.22)); au.addColorStop(1, hexA(C.jade, 0));
    bx.fillStyle = au; bx.fillRect(0, 0, W, H);
    const au2 = bx.createRadialGradient(200, 1500, 0, 200, 1500, 800);
    au2.addColorStop(0, hexA(C.iris, 0.12)); au2.addColorStop(1, hexA(C.iris, 0));
    bx.fillStyle = au2; bx.fillRect(0, 0, W, H);
    // grid
    bx.strokeStyle = "rgba(11,23,20,0.045)"; bx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 72) { bx.beginPath(); bx.moveTo(gx, 0); bx.lineTo(gx, H); bx.stroke(); }
    for (let gy = 0; gy < H; gy += 72) { bx.beginPath(); bx.moveTo(0, gy); bx.lineTo(W, gy); bx.stroke(); }
    const netOut = 1 - eOut(prog(t, P[5].s - 0.2, P[5].s + 0.4));
    if (netOut > 0) {
      bx.globalAlpha = netOut;
      network(bx, t, { dark: false, badAmt: 1, healAmt: prog(t, P[4].s + 0.6, P[4].e), scan: prog(t, P[4].s, P[4].s + 0.6) });
      bx.globalAlpha = 1;
    }
    bx.restore();
    // expanding ring edge
    if (wipe < 1) { bx.strokeStyle = hexA(C.jade, 0.9 * (1 - wipe)); bx.lineWidth = 10; bx.beginPath(); bx.arc(540, 1010, wipe * 1500, 0, 6.28); bx.stroke(); }
  }
  bx.restore();
  ctx.drawImage(bg, 0, 0);

  // ——— ACT 1: Hook ———
  if (t < P[3].s + 0.1) {
    const out = 1 - prog(t, P[3].s - 0.25, P[3].s + 0.1);
    ctx.save(); ctx.globalAlpha = out;
    // AI chat bubble, typing a confident (false) answer
    const bIn = eBack(prog(t, 0, 0.45));
    const by = 470;
    ctx.save(); ctx.translate(540, by + 120); ctx.scale(0.9 + 0.1 * bIn, 0.9 + 0.1 * bIn); ctx.translate(-540, -(by + 120));
    ctx.globalAlpha = out * clamp(bIn);
    glass(ctx, 120, by, 840, 250, 44, { dark: true });
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "30px GM"; ctx.fillText(S.assistant, 170, by + 70);
    const answer = S.answer;
    const nChar = Math.floor(prog(t, 0.15, P[0].e) * answer.length);
    ctx.fillStyle = "#fff"; ctx.font = "44px G5"; ctx.fillText(answer.slice(0, nChar) + (Math.floor(t * 3) % 2 ? "▍" : ""), 170, by + 140);
    // confidence meter
    const conf = eOut(prog(t, P[1].s - 0.1, P[1].s + 0.5));
    const lied = prog(t, P[0].s + 0.55, P[0].s + 0.7) > 0;
    ctx.font = "30px GM"; const barW = Math.min(480, 910 - 170 - ctx.measureText(S.confidence.replace("{n}", "99")).width - 36);
    ctx.fillStyle = "rgba(255,255,255,0.12)"; rr(ctx, 170, by + 182, barW, 14, 7); ctx.fill();
    ctx.fillStyle = conf > 0 && t > P[2].s ? C.coral : C.jade; rr(ctx, 170, by + 182, barW * (0.35 + 0.64 * conf), 14, 7); ctx.fill();
    ctx.font = "30px GM"; ctx.fillStyle = t > P[2].s ? C.coral : C.jadeB; ctx.textAlign = "right"; ctx.fillText(S.confidence.replace("{n}", Math.round(35 + 64 * conf)), 910, by + 199); ctx.textAlign = "left";
    ctx.restore();
    // glitch on "lied"
    const g0 = P[S.glitch.phrase].s + S.glitch.offset; const g = prog(t, g0, g0 + 0.4);
    if (g > 0 && g < 1) {
      const r = rng(Math.floor(t * 60));
      for (let i = 0; i < 7; i++) { const sy = r() * 1920, sh = 10 + r() * 60; ctx.drawImage(cv, 0, sy, W, sh, (r() - 0.5) * 80, sy, W, sh); }
      ctx.fillStyle = hexA(C.coral, 0.12 * (1 - g)); ctx.fillRect(0, 0, W, H);
    }
    // headline (3 hook phrases)
    S.hook.forEach((h, i) => {
      if (t < P[i].s - 0.05) return;
      ctx.save();
      if (h.whisper) ctx.globalAlpha = out * (0.55 + 0.1 * Math.sin(t * 8));
      words(ctx, h.text, { x: 540, y: h.y, size: h.size, font: h.font, color: h.color, t, start: P[i].s, dur: h.fixed || (P[i].e - P[i].s), hl: h.hl || {}, maxW: 920 });
      ctx.restore();
    });
    ctx.restore();
  }

  // ——— ACT 2: Silent failures ———
  if (t >= P[3].s - 0.1 && t < tLight + 0.5) {
    const a = eOut(prog(t, P[3].s - 0.1, P[3].s + 0.3)) * (1 - prog(t, tLight - 0.35, tLight + 0.05));
    ctx.save(); ctx.globalAlpha = a;
    words(ctx, S.problem, { x: 540, y: 330, size: 84, t, start: P[3].s, dur: 0.9, hl: S.problemHl, maxW: 920 });
    const tags = S.tags;
    const span = P[3].e - P[3].s;
    tags.forEach((tag, i) => {
      const ts = P[3].s + span * (0.48 + i * 0.17);
      const k = eBack(prog(t, ts, ts + 0.35));
      if (k <= 0) return;
      ctx.save(); ctx.font = "44px GM"; ctx.letterSpacing = "4px";
      const tw = ctx.measureText(tag).width + 70;
      const ty = 1560 + i * 0 ;
      const tx = [540 - 0, 540, 540][i];
      const yy = 1500 + i * 110;
      ctx.translate(tx, yy); ctx.scale(k, k);
      ctx.fillStyle = hexA(C.coral, 0.16); rr(ctx, -tw / 2, -46, tw, 82, 41); ctx.fill();
      ctx.strokeStyle = hexA(C.coral, 0.7); ctx.lineWidth = 2; rr(ctx, -tw / 2, -46, tw, 82, 41); ctx.stroke();
      ctx.fillStyle = "#FF8A73"; ctx.textAlign = "center"; ctx.fillText(tag, 0, 10);
      ctx.restore();
    });
    ctx.restore();
  }

  // ——— ACT 3: NEUVIA resolves ———
  if (t >= tLight && t < P[5].s + 0.2) {
    const a3s = tLight + 0.55; // wait until the white wipe covers the screen
    const a = eOut(prog(t, a3s, a3s + 0.35)) * (1 - prog(t, P[5].s - 0.25, P[5].s + 0.15));
    ctx.save(); ctx.globalAlpha = a;
    mark(ctx, 540 - 46, 250, 92, t, a);
    words(ctx, S.solution, { x: 540, y: 470, size: 86, color: C.ink2, t, start: a3s, dur: (P[4].e - a3s) * 0.42, hl: S.solutionHl, maxW: 900 });
    // status card (liquid glass)
    const steps = S.steps;
    const cs = P[4].s + (P[4].e - P[4].s) * 0.4;
    const k = eBack(prog(t, cs, cs + 0.45));
    if (k > 0) {
      ctx.save(); ctx.translate(540, 1560); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); ctx.translate(-540, -1560);
      glass(ctx, 110, 1440, 860, 240, 52, { alpha: clamp(k) });
      steps.forEach((s, i) => {
        const on = t > cs + 0.25 + i * ((P[4].e - cs) / 3.2);
        const x = 190 + i * 268;
        ctx.globalAlpha = clamp(k);
        ctx.fillStyle = on ? C.jade : "rgba(11,23,20,0.12)"; ctx.beginPath(); ctx.arc(x, 1520, 18, 0, 6.28); ctx.fill();
        if (on) { ctx.strokeStyle = C.ink2; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 8, 1520); ctx.lineTo(x - 2, 1527); ctx.lineTo(x + 9, 1513); ctx.stroke(); }
        if (i < 2) { ctx.fillStyle = on ? C.jade : "rgba(11,23,20,0.12)"; ctx.fillRect(x + 30, 1518, 208, 4); }
        ctx.fillStyle = on ? C.ink2 : "rgba(11,23,20,0.4)"; ctx.font = "35px G6"; ctx.textAlign = "left"; ctx.fillText(s, x - 18, 1600, 250);
      });
      ctx.fillStyle = C.muted; ctx.font = "26px GM"; ctx.fillText(S.layer, 160, 1650, 760);
      ctx.restore();
    }
    ctx.restore();
  }

  // ——— ACT 4: Tagline + CTA ———
  if (t >= P[5].s - 0.2) {
    const k = eOut(prog(t, P[5].s - 0.2, P[5].s + 0.5));
    const up = eInOut(prog(t, P[6].s - 0.2, P[6].s + 0.5));
    ctx.save(); ctx.globalAlpha = k;
    const ly = lerp(820, 470, up);
    mark(ctx, 540 - 80 * (1 - up * 0.35), ly - 210 + up * 60, 160 * (1 - up * 0.35), t, k);
    wordmark(ctx, 540, ly + 20, 60 - up * 18, C.ink2, k);
    words(ctx, S.tagline, { x: 540, y: ly + 170 - up * 30, size: 70 - up * 18, font: "G6", color: C.ink2, t, start: P[5].s, dur: P[5].e - P[5].s, maxW: 860, hl: S.taglineHl });
    ctx.restore();
    if (t >= P[6].s - 0.1) {
      const c = eBack(prog(t, P[6].s, P[6].s + 0.55));
      ctx.save(); ctx.globalAlpha = clamp(c);
      ctx.translate(540, 1150); ctx.scale(0.8 + 0.2 * c, 0.8 + 0.2 * c); ctx.translate(-540, -1150);
      glass(ctx, 100, 860, 880, 560, 64);
      // comment bubble icon
      ctx.fillStyle = C.ink2; rr(ctx, 175, 935, 96, 78, 24); ctx.fill();
      ctx.beginPath(); ctx.moveTo(200, 1010); ctx.lineTo(196, 1040); ctx.lineTo(228, 1010); ctx.fill();
      ctx.fillStyle = C.jadeB; [205, 223, 241].forEach((dx) => { ctx.beginPath(); ctx.arc(dx, 974, 6, 0, 6.28); ctx.fill(); });
      ctx.fillStyle = C.muted; ctx.font = "40px G5"; ctx.textAlign = "left"; ctx.fillText(S.ctaPre, 300, 990, 620);
      // NEU with caret + pulse
      const typed = "NEU".slice(0, Math.floor(prog(t, P[6].s + 0.35, P[6].s + 0.9) * 3 + 0.001));
      const pul = 1 + 0.04 * Math.sin(t * 6);
      ctx.save(); ctx.translate(540, 1215); ctx.scale(pul, pul);
      ctx.font = "250px G7"; ctx.textAlign = "center"; ctx.letterSpacing = "-6px";
      const g = ctx.createLinearGradient(-260, 0, 260, 0); g.addColorStop(0, C.jadeD); g.addColorStop(1, C.jade);
      ctx.fillStyle = g; ctx.fillText(`“${typed}”`, 0, 70);
      ctx.restore();
      ctx.fillStyle = C.ink2; ctx.font = "44px G6"; ctx.textAlign = "center"; ctx.fillText(S.ctaPost, 540, 1360);
      ctx.restore();
      const f = eOut(prog(t, P[6].s + 0.6, P[6].s + 1.1));
      ctx.save(); ctx.globalAlpha = f; ctx.textAlign = "center";
      ctx.fillStyle = C.ink2; ctx.font = "38px GM"; ctx.fillText("neuvia.co", 540, 1480);
      ctx.fillStyle = "rgba(11,23,20,0.45)"; ctx.font = "24px G4"; ctx.fillText(S.disclaimer, 540, 1524, 900);
      ctx.restore();
    }
  }

  grain(ctx, t, dark ? 0.06 : 0.025);
  // fade in / out
  const fade = Math.max(1 - prog(t, 0, 0.25), prog(t, window.DURATION - 0.3, window.DURATION));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
}
window.draw = draw;
