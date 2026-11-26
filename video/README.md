# NEUVIA promo video (9:16, ≤20 s)

Code-rendered motion graphics in the NEUVIA identity + ElevenLabs voiceover + synthesized sound design.

| Step | Command |
|---|---|
| 1. Voiceover | ElevenLabs `eleven_v4`, voice *Alexander – warm grounded narrator* (`UMnEnzK9QLLdRwnUyxMW`). Save the MP3. |
| 2. Retime + sound design | `python3 video/audio.py path/to/voiceover.mp3` → `build/timing.json`, `build/audio_final.wav` (−14 LUFS) |
| 3. Preview frames | `node video/render.js stills 1.6,8.6,12.6,18.8` |
| 4. Render | `node video/render.js video video/build/NEUVIA-promo.mp4 video/build/audio_final.wav` |

`scene.js` holds the animation (`draw(t)`), timed from the 7 voiceover phrases:
hook ×3 → silent failures → NEUVIA resolves → tagline → CTA (“Reply NEU”).
For another language, translate the on-screen strings in `scene.js` and generate a new voiceover;
everything else re-syncs automatically. `build/` and rendered MP4s are not versioned.

EN script: “Your AI just lied to you. Confidently. And nobody noticed. / Every day, AI fails in silence… hallucinations, drift, false certainty. / NEUVIA is building a second intelligence that watches, detects, and helps correct them. / Intelligence caring for intelligence. / Reply “NEU” to this video to learn more.”
