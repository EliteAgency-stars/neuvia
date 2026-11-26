// Renders the canvas animation frame-by-frame (deterministic) and pipes JPEGs into ffmpeg.
// node render.js stills t1,t2,...   |   node render.js video out.mp4 audio.wav
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const dir = __dirname, build = path.join(dir, 'build');
const LANG = process.env.VIDEO_LANG || 'en';
const T = JSON.parse(fs.readFileSync(path.join(build, `timing-${LANG}.json`), 'utf8'));
const STR = fs.readFileSync(path.join(dir, 'strings', `${LANG}.json`), 'utf8');
// Fonts are embedded from the local geist package (no network access needed).
const fontDir = path.join(dir, '..', 'node_modules', 'geist', 'dist', 'fonts');
const FONTS = { G4: 'geist-sans/Geist-Regular.woff2', G5: 'geist-sans/Geist-Medium.woff2', G6: 'geist-sans/Geist-SemiBold.woff2', G7: 'geist-sans/Geist-Bold.woff2', GM: 'geist-mono/GeistMono-Medium.woff2' };
const fontCss = Object.entries(FONTS).map(([k, f]) => `@font-face{font-family:${k};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(fontDir, f)).toString('base64')})}`).join('');
const html = `<!doctype html><html><head><style>${fontCss}html,body{margin:0;background:#000}canvas{display:block}</style></head>
<body><canvas id="c"></canvas><script>window.STRINGS=${STR};window.TIMING=${JSON.stringify(T.timing)};window.DURATION=${T.duration};</script><script>${fs.readFileSync(path.join(dir, 'scene.js'), 'utf8')}</script></body></html>`;
(async () => {
  const [mode, a1, a2] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.setContent(html);
  await page.evaluate(async () => { for (const f of ['G4','G5','G6','G7','GM']) await document.fonts.load(`40px ${f}`); });
  const frame = (t) => page.evaluate((t) => { window.draw(t); return document.getElementById('c').toDataURL('image/jpeg', 0.94).split(',')[1]; }, t);
  if (mode === 'stills') {
    for (const s of a1.split(',')) fs.writeFileSync(path.join(build, `still-${LANG}-${s}.jpg`), Buffer.from(await frame(parseFloat(s)), 'base64'));
  } else {
    const fps = 30, N = Math.round(T.duration * fps);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', a2,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
      '-c:a', 'aac', '-b:a', '192k', '-shortest', a1], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < N; i++) {
      const buf = Buffer.from(await frame(i / fps), 'base64');
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 120 === 0) console.log(`frame ${i}/${N}`);
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
})();
