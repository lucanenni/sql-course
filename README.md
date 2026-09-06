# SQL da Zero

Corso interattivo di SQL in una singola pagina. 11 capitoli più 2 palestre,
query eseguite nel browser con **SQLite compilato in WebAssembly** (sql.js),
esercizi verificati automaticamente confrontando il risultato, progressi salvati
in `localStorage`, routing per capitoli linkabili.

**Online:** https://lucanenni.github.io/sql-course/

## Come si usa il corso

Apri **`index.html`** in un browser. È un **file unico e autonomo** (~1,6 MB):
font, CSS, JavaScript, il motore SQLite e il suo binario `.wasm` sono tutti
inlineati — **nessuna risorsa esterna**, funziona offline e da `file://`.

Ogni esercizio gira su un database SQLite usa-e-getta, ri-seminato da zero a ogni
esecuzione: si può sperimentare (anche `INSERT`/`UPDATE`/`DELETE`) senza rompere
niente.

## Sviluppo

`index.html` è **generato**: si modificano i sorgenti in `src/` e si ricompila.

```bash
npm install
npm test      # self-test: ogni soluzione supera l'esercizio, l'initialCode no
npm run build # genera index.html  (esegue prima npm test)
npm run dev   # watch + server con live-reload su http://localhost:5173
```

### Struttura

```
src/
  index.html            Template. Segnaposto per CSS, bundle JS, sql-wasm.js e wasm base64.
  main.jsx              Entry: importa CSS/font/modo SQL di CodeMirror, monta <App>.
  fonts.css            @font-face dei variable font (subset latin, inlineati).
  custom.css           Token tema, reticolo, primitivi, tabella dei risultati, pannello schema.
  lib/
    router.js          Hash routing (#/capitolo/N).
    theme.jsx          ThemeProvider / useTheme (persiste, rispetta prefers-color-scheme).
    progress.js        useCourseProgress (localStorage 'sqc:progress').
    audio.js           Chime di completamento.
    db.js              sql.js nel browser: loadSQL, runExercise, describeSchema.
    sqlnode.mjs        Stesso sql.js lato Node (build + test).
    check.js           compareResults / looksOrdered / runPredicates — confronto dei risultati.
    scrollspy.js       useScrollSpy per l'indice.
  ui/
    App, Navbar, Dashboard, ChapterView, Celebration, ErrorBoundary
    Playground.jsx     Editor CodeMirror (modo SQL) + esecuzione su sql.js + confronto.
    ResultTable.jsx    Rende un result set { columns, values }.
    SchemaPanel.jsx    Pannello a scomparsa con lo schema del dataset.
    Block.jsx          Rende un blocco (h2/p/ul/callout/diff/code/play).
    Callout, DiffWidget, CodeBlock, Icon
  content/
    ch00.md … ch10.md  Capitoli del percorso principale (dominio: negozio online).
    ch20.md, ch21.md   Palestre (Biblioteca, Musica).
    datasets.js        I 3 dataset: schema + dati come stringhe SQL.
    exercises.js       Esercizi: dataset, initialCode, solution, verify, checks, hint.
    parse.mjs          Markdown -> blocchi (build time).
build.mjs              Tailwind CLI + esbuild -> index.html. Calcola il risultato
                       atteso di ogni esercizio con sql.js e lo mette in COURSE_DATA
                       (la soluzione NON finisce nel bundle).
test/exercises.mjs     Self-test degli esercizi.
```

### Scrivere i contenuti

**Prosa** → `src/content/chNN.md`. Markdown; `<` `>` `&` sono letterali. Frontmatter:
`id`, `title`, `short`, `section` (`corso` | `palestra`). Sintassi extra:

| Sintassi | Effetto |
|---|---|
| `## Titolo` / `### Titolo` | heading (id = slug, usato dall'indice) |
| `` `code` `` `**bold**` `_corsivo_` `[testo](url)` | inline |
| `::: tip Titolo` … `:::` | callout (`info` \| `tip` \| `warning` \| `analogy`) |
| `::: exercise <id>` | inserisce l'esercizio con quell'id |
| ` ```sql ` … ` ``` ` | blocco di codice statico (solo visualizzazione) |
| ` ```diff-demo Etichetta ` … `@@@` … ` ``` ` | blocco prima/dopo |

**Esercizi** → `src/content/exercises.js`:

```js
'c1-colonne': {
  dataset: 'negozio',        // chiave in datasets.js (default: 'negozio')
  initialCode: `SELECT ...`,  // template literal, nessun escaping
  solution:    `SELECT nome, prezzo FROM prodotti;`,
  ordered: false,             // opz.: forza confronto ordinato (default: c'è ORDER BY?)
  verify:  `SELECT ...`,      // opz.: per INSERT/UPDATE/DELETE — si confronta questo
  checks: [ { label: '...', assert: "cols.includes('prezzo')" } ], // opz.
  hint: '...',
}
```

Il controllo principale confronta il **result set** dello studente con quello
prodotto dalla `solution` sullo stesso database (ordine ignorato se la soluzione
non ha `ORDER BY`). I `checks` extra sono espressioni booleane con `rows` (righe
come oggetti) e `cols` (nomi colonna minuscoli). Quando tutti gli esercizi di un
capitolo passano, il capitolo si completa da solo.

**Dataset** → `src/content/datasets.js`. Ogni voce è una stringa SQL (DDL +
`INSERT`) eseguita su un DB pulito prima di ogni esercizio.
