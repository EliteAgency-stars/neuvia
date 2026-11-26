# NEUVIA promo video (9:16, ≤20 s)

Code-rendered motion graphics in the NEUVIA identity + ElevenLabs voiceover + synthesized sound design.

| Step | Command |
|---|---|
| 1. Voiceover | ElevenLabs `eleven_v4`, voice *Alexander – warm grounded narrator* (`UMnEnzK9QLLdRwnUyxMW`). Save the MP3. |
| 2. Retime + sound design | `python3 video/audio.py voiceover.mp3 --lang es --groups 1,1,1,3,1,1,1` → `build/timing-<lang>.json`, `build/audio_final-<lang>.wav` (−14 LUFS, tempo auto-fit to 20 s) |
| 3. Preview frames | `VIDEO_LANG=es node video/render.js stills 1.6,8.6,12.6,18.8` |
| 4. Render | `VIDEO_LANG=es node video/render.js video video/build/NEUVIA-promo-ES.mp4 video/build/audio_final-es.wav` |

`scene.js` holds the animation (`draw(t)`), timed from the 7 voiceover phrases:
hook ×3 → silent failures → NEUVIA resolves → tagline → CTA (“Reply NEU”).
On-screen copy lives in `strings/<lang>.json` (en, es). For another language, add a strings file and a voiceover;
`--groups` tells how many voice segments form each of the 7 phrases (check the gaps the script prints). `build/` and rendered MP4s are not versioned.

EN script: “Your AI just lied to you. Confidently. And nobody noticed. / Every day, AI fails in silence… hallucinations, drift, false certainty. / NEUVIA is building a second intelligence that watches, detects, and helps correct them. / Intelligence caring for intelligence. / Reply “NEU” to this video to learn more.”

ES script (voice *Nilton* `57Zk2fTHX6fnrs8DtTnO`): “La IA que implementaron en tu negocio… te está mintiendo… en silencio. / Cada día, la IA falla sin avisar: alucinaciones, deriva, falsa certeza. / NEUVIA está creando una segunda inteligencia que vigila, detecta y ayuda a corregir. / Inteligencia que cuida de la inteligencia. / Responde “NEU” a este video para saber más.”
