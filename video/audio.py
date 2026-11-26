#!/usr/bin/env python3
"""Voiceover retiming + synced sound design for the NEUVIA promo.

Usage: python3 video/audio.py <voiceover.mp3> [--tempo 1.075] [--merge 3]
- Detects pauses, shortens them, applies tempo and writes build/vo_final.wav + build/timing.json.
- The renderer expects 7 phrases (hook x3, problem, NEUVIA, tagline, CTA). If the voice produces an
  extra pause inside one phrase, pass its segment index with --merge (index of the first part).
- Then synthesizes music/SFX aligned to those phrases, ducks it under the voice and masters to -14 LUFS.
"""
import argparse, json, re, subprocess, numpy as np, os
SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(HERE, 'build'); os.makedirs(B, exist_ok=True)
ap = argparse.ArgumentParser(); ap.add_argument('vo'); ap.add_argument('--tempo', type=float, default=1.075)
ap.add_argument('--merge', type=int, nargs='*', default=[3]); ap.add_argument('--lead', type=float, default=0.25); ap.add_argument('--max', type=float, default=20.0)
A = ap.parse_args()

def load(path, ch=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

# ——— 1. Retime voiceover ———
x = load(A.vo)
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', A.vo, '-af', 'silencedetect=noise=-38dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(v) for v in re.findall(r'silence_start: ([0-9.]+)', log)]; en = [float(v) for v in re.findall(r'silence_end: ([0-9.]+)', log)]
gaps = [(a, b) for a, b in zip(st, en) if a > 0.05]
segs, prev = [], 0.0
for a, b in gaps: segs.append((prev, a)); prev = b
segs.append((prev, len(x) / SR))
out, times, cur = [], [], 0.0
for i, (a, b) in enumerate(segs):
    s = x[int(a * SR):int(b * SR)]; times.append((cur, cur + len(s) / SR)); out.append(s); cur += len(s) / SR
    if i < len(gaps):
        keep = 0.40 if i == 0 else 0.15 if (i in A.merge) else 0.28
        g = x[int(gaps[i][0] * SR):int(gaps[i][0] * SR) + int(keep * SR)]; out.append(g); cur += len(g) / SR
y = np.concatenate(out); thr = 10 ** (-45 / 20); idx = np.where(np.abs(y) > thr)[0]; y = y[:idx[-1] + int(0.12 * SR)]
y.astype(np.float32).tofile(os.path.join(B, 'vo_tight.f32'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', os.path.join(B, 'vo_tight.f32'), '-af', f'atempo={A.tempo}', '-ar', str(SR), os.path.join(B, 'vo_final.wav')], check=True)
phr, i = [], 0
while i < len(times):
    if i in A.merge and i + 1 < len(times): phr.append((times[i][0], times[i + 1][1])); i += 2
    else: phr.append(times[i]); i += 1
assert len(phr) == 7, f'expected 7 phrases, got {len(phr)} — adjust --merge'
timing = [{'s': round(A.lead + a / A.tempo, 3), 'e': round(A.lead + b / A.tempo, 3)} for a, b in phr]
vo = load(os.path.join(B, 'vo_final.wav')); D = round(min(A.max, A.lead + len(vo) / SR + 0.35), 2)
json.dump({'timing': timing, 'duration': D, 'lead': A.lead, 'vo': len(vo) / SR}, open(os.path.join(B, 'timing.json'), 'w'), indent=1)
print('VO', round(len(vo) / SR, 2), 's · video', D, 's')

# ——— 2. Sound design ———
P = timing; n = int(D * SR); t = np.arange(n) / SR; L = np.zeros(n); R = np.zeros(n); rng = np.random.default_rng(7)
def env(a, d, ln):
    e = np.ones(ln); a_, d_ = int(a * SR), int(d * SR)
    if a_: e[:a_] = np.linspace(0, 1, a_)
    if d_: e[-d_:] *= np.linspace(1, 0, d_)
    return e
def add(sig, start, gain=1.0, pan=0.0):
    i0 = int(start * SR); j = min(n, i0 + len(sig)); s = sig[:j - i0] * gain
    L[i0:j] += s * (1 - max(pan, 0)); R[i0:j] += s * (1 + min(pan, 0))
def thump(f0=52, dur=0.28):
    k = np.arange(int(dur * SR)) / SR; f = f0 * (1 + 1.5 * np.exp(-k * 30)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k * 14)
tl = P[4]['s'] - 0.15
dl = int(tl * SR) + int(0.6 * SR); tt = t[:dl]; lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * tt)
drone = (np.sin(2 * np.pi * 55 * tt) + 0.8 * np.sin(2 * np.pi * 55.35 * tt) + 0.35 * np.sin(2 * np.pi * 110.2 * tt) + 0.12 * np.sin(2 * np.pi * 164.8 * tt)) * lfo
add(drone * env(1.2, 0.6, dl) * np.linspace(0.8, 1.25, dl) * 0.10, 0)
hb = 0.3
while hb < P[3]['s'] - 0.2: add(thump(), hb, 0.55); add(thump(48), hb + 0.24, 0.38); hb += 0.82
gl = int(0.4 * SR); gn = np.round(rng.standard_normal(gl) * 3) / 3; gn *= (np.sin(np.arange(gl) / SR * 2 * np.pi * 31) > 0) * np.exp(-np.arange(gl) / SR * 6)
add(gn * 0.10, P[0]['s'] + 0.45, pan=-0.3); add(np.roll(gn, 800) * 0.08, P[0]['s'] + 0.45, pan=0.3)
k = np.arange(int(0.7 * SR)) / SR; add(np.sin(2 * np.pi * np.cumsum(1318 * (1 - 0.12 * np.clip((k - 0.25) * 3, 0, 1))) / SR) * np.exp(-k * 5) * 0.09, P[1]['s'] + 0.05, pan=0.2)
click = np.sin(2 * np.pi * 3800 * np.arange(int(0.02 * SR)) / SR) * np.exp(-np.arange(int(0.02 * SR)) / SR * 300); tk = P[3]['s']
while tk < tl - 0.3: add(click * 0.05, tk, pan=0.4 if int(tk * 4) % 2 else -0.4); tk += 0.25
span = P[3]['e'] - P[3]['s']
for i in range(3): ts = P[3]['s'] + span * (0.48 + i * 0.17); add(thump(70, 0.22) * 0.5, ts); add(gn[:int(0.08 * SR)] * 0.05, ts)
rl = int(1.3 * SR); rn = rng.standard_normal(rl); kk = np.linspace(0, 1, rl); yy = np.zeros(rl); a = 0.0
for i in range(rl): a += (0.01 + 0.4 * kk[i] ** 2) * (rn[i] - a); yy[i] = a
add(yy * kk ** 2 * 0.6, tl - 1.25)
k = np.arange(int(2.2 * SR)) / SR
add(np.sin(2 * np.pi * np.cumsum(45 * (1 + 2 * np.exp(-k * 20))) / SR) * np.exp(-k * 2.6) * 0.7, tl)
add(sum(np.sin(2 * np.pi * fr * k) * np.exp(-k * (1.4 + 0.3 * j)) for j, fr in enumerate([1046.5, 1318.5, 1568, 1975.5])) * 0.18 * 0.35, tl, pan=0.15)
pl = n - int(tl * SR); kp = np.arange(pl) / SR; chord = [130.81, 196.0, 246.94, 293.66, 329.63]
pad = sum(np.sin(2 * np.pi * fr * kp) + 0.5 * np.sin(2 * np.pi * fr * 1.003 * kp + 0.7) for fr in chord) / len(chord)
add(pad * env(1.5, 1.2, pl) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.2 * kp)) * 0.11, tl)
notes = [659.25, 783.99, 987.77, 1174.66, 987.77, 783.99]; ta = tl + 0.35; i = 0
while ta < D - 0.6:
    kq = np.arange(int(0.6 * SR)) / SR; fr = notes[i % 6]; add((np.sin(2 * np.pi * fr * kq) + 0.3 * np.sin(2 * np.pi * 2 * fr * kq)) * np.exp(-kq * 7) * 0.045, ta, pan=0.35 if i % 2 else -0.35); ta += 0.375; i += 1
for j in range(3): kb = np.arange(int(0.12 * SR)) / SR; add(np.sin(2 * np.pi * (1567.98 + j * 196) * kb) * np.exp(-kb * 30) * 0.08, P[6]['s'] + 0.35 + j * 0.18)
kb = np.arange(int(1.8 * SR)) / SR; add((np.sin(2 * np.pi * 1046.5 * kb) + 0.4 * np.sin(2 * np.pi * 2093 * kb) + 0.2 * np.sin(2 * np.pi * 3139.5 * kb)) * np.exp(-kb * 2.2) * 0.07, P[6]['s'] + 0.95)
music = np.stack([L, R], 1)
vfull = np.zeros(n); i0 = int(A.lead * SR); vfull[i0:i0 + len(vo)] = vo[:n - i0]
e = np.convolve(np.abs(vfull), np.ones(int(0.08 * SR)) / int(0.08 * SR), 'same'); music *= (1 - 0.45 * np.clip(e / 0.06, 0, 1))[:, None]
music /= max(1e-6, np.abs(music).max()) / 0.5
mix = np.tanh((music * 0.55 + np.stack([vfull, vfull], 1)) * 1.1) / np.tanh(1.1)
mix.astype(np.float32).tofile(os.path.join(B, 'mix.f32'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', os.path.join(B, 'mix.f32'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', str(SR), '-c:a', 'pcm_s16le', os.path.join(B, 'audio_final.wav')], check=True)
print('audio →', os.path.join(B, 'audio_final.wav'))
