/**
 * Self-test degli esercizi (`npm test`).
 * Per ogni esercizio con `solution` verifica che:
 *   1. la soluzione non produca errori e superi gli eventuali check extra;
 *   2. `initialCode` NON produca già il risultato atteso (altrimenti è banale).
 * Usa lo stesso sql.js del browser.
 */
import { EXERCISES } from '../src/content/exercises.js';
import { DATASETS } from '../src/content/datasets.js';
import { runSql } from '../src/lib/sqlnode.mjs';
import { compareResults, looksOrdered, runPredicates } from '../src/lib/check.js';

let fail = 0;
let n = 0;

for (const [id, ex] of Object.entries(EXERCISES)) {
  if (!ex.solution) { console.log(`  ·  ${id}  (esempio, senza soluzione)`); continue; }
  n += 1;

  const seedSql = DATASETS[ex.dataset || 'negozio'];
  if (!seedSql) { fail += 1; console.log(`  ✗  ${id} — dataset "${ex.dataset}" inesistente`); continue; }

  const ordered = ex.ordered != null ? !!ex.ordered : looksOrdered(ex.solution);

  const sol = await runSql({ seedSql, code: ex.solution, verifySql: ex.verify });
  if (sol.error) { fail += 1; console.log(`  ✗  ${id} — soluzione in errore: ${sol.error}`); continue; }

  const expected = sol.checkData || { columns: [], values: [] };
  if (!expected.columns || expected.columns.length === 0) {
    // ammesso solo se c'è un verify che restituisce qualcosa, altrimenti sospetto
    if (!ex.verify) { fail += 1; console.log(`  ✗  ${id} — la soluzione non restituisce colonne (manca 'verify'?)`); continue; }
  }

  const predSol = runPredicates(ex.checks, expected);
  const predFail = predSol.filter((p) => !p.pass);
  if (predFail.length) {
    fail += 1;
    console.log(`  ✗  ${id} — check extra falliti sulla soluzione:`);
    predFail.forEach((p) => console.log(`        ${p.label}${p.error ? ' — ' + p.error : ''}`));
    continue;
  }

  const init = await runSql({ seedSql, code: ex.initialCode, verifySql: ex.verify });
  const initPrimary = !init.error && compareResults(init.checkData, expected, { ordered }).pass;
  const initPred = init.error ? [] : runPredicates(ex.checks, init.checkData);
  const initAllPass = initPrimary && initPred.every((p) => p.pass);

  if (initAllPass) {
    fail += 1;
    console.log(`  ✗  ${id} — initialCode supera già l'esercizio`);
    continue;
  }

  console.log(`  ✓  ${id}`);
}

console.log(fail ? `\n✗ ${fail}/${n} esercizi da sistemare` : `\n✓ ${n} esercizi OK`);
process.exit(fail ? 1 : 0);
