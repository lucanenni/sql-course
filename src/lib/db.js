// Wrapper di sql.js (SQLite compilato in WebAssembly) per il browser.
//
// Il glue di sql.js e il binario .wasm (base64) sono inlineati in index.html
// dal build:  window.initSqlJs  e  window.__SQL_WASM_B64.
// Nessuna richiesta di rete: tutto gira in memoria, offline, da file://.

let sqlPromise = null;

export function loadSQL() {
    if (!sqlPromise) {
        sqlPromise = (async () => {
            if (typeof window.initSqlJs !== 'function') {
                throw new Error('sql.js non caricato');
            }
            const b64 = window.__SQL_WASM_B64 || '';
            const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
            return window.initSqlJs({ wasmBinary: bin });
        })();
    }
    return sqlPromise;
}

/**
 * Esegue lo schema/seed + il codice dello studente su un DB usa-e-getta.
 * @param seedSql   DDL + INSERT del dataset
 * @param code      SQL scritto dallo studente
 * @param verifySql (opzionale) query eseguita DOPO il codice, il cui risultato
 *                  è quello da confrontare (per esercizi INSERT/UPDATE/DELETE)
 * @returns { resultSets, error, checkData, rowsModified }
 */
export async function runExercise({ seedSql, code, verifySql }) {
    const SQL = await loadSQL();
    const db = new SQL.Database();
    try {
        if (seedSql) db.run(seedSql);

        let resultSets = [];
        let error = null;
        let rowsModified = 0;
        try {
            resultSets = db.exec(code);
            rowsModified = db.getRowsModified();
        } catch (e) {
            error = String((e && e.message) || e);
        }

        let checkData = null;
        if (!error) {
            if (verifySql) {
                const v = db.exec(verifySql);
                checkData = v.length ? v[v.length - 1] : { columns: [], values: [] };
            } else {
                checkData = resultSets.length
                    ? resultSets[resultSets.length - 1]
                    : { columns: [], values: [] };
            }
        }
        return { resultSets, error, checkData, rowsModified };
    } finally {
        db.close();
    }
}

/** Introspezione dello schema di un dataset: [{ name, columns:[{name,type}] }]. */
export async function describeSchema(seedSql) {
    const SQL = await loadSQL();
    const db = new SQL.Database();
    try {
        db.run(seedSql);
        const t = db.exec(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        );
        const names = t.length ? t[0].values.map((r) => r[0]) : [];
        return names.map((name) => {
            const info = db.exec(`PRAGMA table_info("${name}")`);
            const columns = info.length
                ? info[0].values.map((r) => ({ name: r[1], type: r[2] || '' }))
                : [];
            return { name, columns };
        });
    } finally {
        db.close();
    }
}
