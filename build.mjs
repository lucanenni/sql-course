/**
 * Build: sorgenti in src/ -> UN unico file CorsoSQL.html, autonomo.
 *
 *   node build.mjs           build una tantum
 *   node build.mjs --watch   ricostruisce a ogni modifica + server con live-reload
 *
 * - JSX + moduli      -> esbuild (bundle IIFE, minify)
 * - Tailwind          -> CLI (solo le classi usate)
 * - font .woff2       -> inline come data-URI (loader dataurl)
 * - contenuti .md     -> parsati a build time (parse.mjs)
 * - esercizi          -> per ognuno si esegue seed + solution con sql.js e si
 *                        salva il RISULTATO ATTESO in COURSE_DATA (la soluzione
 *                        resta fuori dal bundle)
 * - motore SQLite     -> sql-wasm.js + sql-wasm.wasm (base64) inlineati in index.html
 */
import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import http from 'node:http';
import { parseChapter } from './src/content/parse.mjs';
import { EXERCISES } from './src/content/exercises.js';
import { DATASETS } from './src/content/datasets.js';
import { runSql } from './src/lib/sqlnode.mjs';
import { looksOrdered } from './src/lib/check.js';

const OUT = 'index.html';
const TMP = '.build';
const WATCH = process.argv.includes('--watch');
mkdirSync(TMP, { recursive: true });

const SQLJS_GLUE = 'node_modules/sql.js/dist/sql-wasm.js';
const SQLJS_WASM = 'node_modules/sql.js/dist/sql-wasm.wasm';

// --- contenuti: markdown + esercizi -> COURSE_DATA ----------------------------
async function buildCourse() {
  const files = readdirSync('src/content').filter((f) => /^ch\d+\.md$/.test(f));
  const chapters = [];

  for (const f of files) {
    const ch = parseChapter(readFileSync(`src/content/${f}`, 'utf8'));
    const blocks = [];
    for (const b of ch.blocks) {
      if (b.type !== 'play') { blocks.push(b); continue; }

      const ex = EXERCISES[b.ref];
      if (!ex) throw new Error(`Esercizio "${b.ref}" non trovato (${f})`);
      const dataset = ex.dataset || 'negozio';
      const seedSql = DATASETS[dataset];
      if (!seedSql) throw new Error(`Dataset "${dataset}" non trovato (esercizio ${b.ref})`);

      const out = { type: 'play', id: b.ref, dataset, initialCode: ex.initialCode };
      if (ex.hint) out.hint = ex.hint;
      if (ex.verify) out.verify = ex.verify;
      if (ex.checks) out.checks = ex.checks;

      if (ex.solution) {
        const ref = await runSql({ seedSql, code: ex.solution, verifySql: ex.verify });
        if (ref.error) throw new Error(`Soluzione di "${b.ref}" in errore: ${ref.error}`);
        out.expected = ref.checkData || { columns: [], values: [] };
        out.ordered = ex.ordered != null ? !!ex.ordered : looksOrdered(ex.solution);
      }
      blocks.push(out);
    }
    chapters.push({ id: ch.id, title: ch.title, short: ch.short, section: ch.section, blocks });
  }

  chapters.sort((a, b) => a.id - b.id);
  return chapters;
}

const coursePlugin = (courseData) => ({
  name: 'course-data',
  setup(b) {
    b.onResolve({ filter: /^course:data$/ }, () => ({ path: 'course:data', namespace: 'course' }));
    b.onLoad({ filter: /.*/, namespace: 'course' }, () => ({
      contents: `export const COURSE_DATA = ${JSON.stringify(courseData)};`,
      loader: 'js',
    }));
  },
});

// --- un giro di build --------------------------------------------------------
async function runBuild() {
  const t0 = Date.now();

  const courseData = await buildCourse();

  execFileSync(
    'npx',
    ['tailwindcss', '-c', 'tailwind.config.js', '-i', 'src/tailwind.css', '-o', `${TMP}/tw.css`, '--minify'],
    { stdio: ['ignore', 'ignore', 'inherit'] }
  );

  await esbuild.build({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2019'],
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl' },
    plugins: [coursePlugin(courseData)],
    outfile: `${TMP}/app.js`,
    legalComments: 'none',
    logLevel: 'warning',
  });

  const twCss = readFileSync(`${TMP}/tw.css`, 'utf8');
  const appCss = existsSync(`${TMP}/app.css`) ? readFileSync(`${TMP}/app.css`, 'utf8') : '';
  let appJs = readFileSync(`${TMP}/app.js`, 'utf8');

  if (appJs.includes('</script')) throw new Error('Bundle contiene "</script" non-escaped');
  if (WATCH) appJs += `\n;(function(){try{new EventSource('/__reload').onmessage=function(){location.reload()}}catch(e){}})();`;

  const sqljsGlue = readFileSync(SQLJS_GLUE, 'utf8');
  if (sqljsGlue.includes('</script')) throw new Error('sql-wasm.js contiene "</script"');
  const wasmB64 = readFileSync(SQLJS_WASM).toString('base64');

  const html = readFileSync('src/index.html', 'utf8')
    .replace('/*__CSS__*/', () => `${twCss}\n${appCss}`)
    .replace('//__SQLJS__', () => sqljsGlue)
    .replace('//__WASM_B64__', () => wasmB64)
    .replace('//__APP__', () => appJs);

  writeFileSync(OUT, html);
  console.log(`✓ ${OUT} — ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB  (${Date.now() - t0} ms)`);
}

// --- watch + live reload ----------------------------------------------------
async function watch() {
  const { default: chokidar } = await import('chokidar');
  const clients = new Set();

  http.createServer((req, res) => {
    if (req.url === '/__reload') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write('\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    try {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(readFileSync(OUT));
    } catch {
      res.writeHead(404).end('build in corso…');
    }
  }).listen(5173, () => console.log('  dev  →  http://localhost:5173'));

  const rebuild = async () => {
    try { await runBuild(); clients.forEach((c) => c.write('data: reload\n\n')); }
    catch (e) { console.error('✗', e.message); }
  };

  let timer;
  chokidar.watch(['src'], { ignoreInitial: true }).on('all', () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}

await runBuild();
if (WATCH) await watch();
