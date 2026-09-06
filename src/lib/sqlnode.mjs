// Esecuzione SQL lato Node (build + self-test), con lo stesso sql.js del browser.
import initSqlJs from 'sql.js';

let SQL = null;
async function getSQL() {
    if (!SQL) SQL = await initSqlJs();
    return SQL;
}

/**
 * Esegue seed + code (+ verify) su un DB usa-e-getta.
 * @returns { resultSets, error, checkData, rowsModified }
 */
export async function runSql({ seedSql, code, verifySql }) {
    const S = await getSQL();
    const db = new S.Database();
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
