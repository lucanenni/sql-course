// Confronto dei risultati di una query. Modulo puro (nessuna dipendenza):
// usato sia dal Playground nel browser sia dal self-test in Node.
//
// Un "result set" ha la forma restituita da sql.js:  { columns: string[], values: any[][] }
// (quando una query non restituisce righe: { columns: [], values: [] }).

const norm = (s) => String(s).trim().toLowerCase();

// canonicalizza un valore per il confronto (numeri "quasi uguali" -> stessa chiave)
function canonVal(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') {
        if (!isFinite(v)) return String(v);
        return Math.abs(v) < 1e-9 ? 0 : Number(v.toFixed(6));
    }
    if (v instanceof Uint8Array) return '<blob:' + v.length + '>';
    return String(v);
}

// { columns, values } -> array di righe come oggetti { colonna_minuscola: valore }
function toRows(rs) {
    if (!rs || !rs.columns) return [];
    const cols = rs.columns.map(norm);
    return (rs.values || []).map((row) => {
        const o = {};
        cols.forEach((c, i) => { o[c] = row[i]; });
        return o;
    });
}

function rowKey(row, cols) {
    return JSON.stringify(cols.map((c) => canonVal(row[c])));
}

/**
 * Confronta il risultato dello studente con quello atteso.
 * @param got      result set dello studente
 * @param expected result set atteso (precalcolato dalla soluzione)
 * @param opts.ordered  se true, l'ordine delle righe conta
 * @returns { pass, reason }  reason: messaggio in italiano quando pass === false
 */
export function compareResults(got, expected, opts = {}) {
    const ordered = !!opts.ordered;
    const gCols = (got && got.columns ? got.columns : []).map(norm);
    const eCols = (expected && expected.columns ? expected.columns : []).map(norm);

    const gSet = [...gCols].sort();
    const eSet = [...eCols].sort();
    if (gSet.length !== eSet.length || gSet.some((c, i) => c !== eSet[i])) {
        if (gCols.length === 0) return { pass: false, reason: 'la query non ha restituito nessuna colonna' };
        return {
            pass: false,
            reason: `le colonne non coincidono — attese [${eCols.join(', ')}], ottenute [${gCols.join(', ')}]`,
        };
    }

    const gRows = toRows(got);
    const eRows = toRows(expected);
    if (gRows.length !== eRows.length) {
        return { pass: false, reason: `righe attese: ${eRows.length}, ottenute: ${gRows.length}` };
    }

    if (ordered) {
        for (let i = 0; i < eRows.length; i++) {
            if (rowKey(gRows[i], eCols) !== rowKey(eRows[i], eCols)) {
                return { pass: false, reason: `la riga ${i + 1} non coincide (controlla anche l'ordinamento)` };
            }
        }
        return { pass: true };
    }

    // confronto come multiset
    const bag = new Map();
    for (const r of eRows) {
        const k = rowKey(r, eCols);
        bag.set(k, (bag.get(k) || 0) + 1);
    }
    for (const r of gRows) {
        const k = rowKey(r, eCols);
        const n = bag.get(k);
        if (!n) return { pass: false, reason: 'alcune righe non corrispondono a quelle attese' };
        bag.set(k, n - 1);
    }
    return { pass: true };
}

// vero se la query contiene un ORDER BY di primo livello (euristica sufficiente qui)
export function looksOrdered(sql) {
    return /\border\s+by\b/i.test(String(sql || ''));
}

// valuta i check extra dell'esercizio: espressioni booleane con `rows` e `cols` nello scope
export function runPredicates(predicates, resultSet) {
    if (!predicates || !predicates.length) return [];
    const rows = toRows(resultSet);
    const cols = (resultSet && resultSet.columns ? resultSet.columns : []).map(norm);
    return predicates.map((p) => {
        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('rows', 'cols', `return !!( ${p.assert} );`);
            return { label: p.label, pass: fn(rows, cols) };
        } catch (e) {
            return { label: p.label, pass: false, error: String((e && e.message) || e) };
        }
    });
}
