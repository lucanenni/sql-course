import React from 'react';

// Rende un result set di sql.js ({ columns, values }) come tabella.
const ResultTable = ({ data, maxRows = 200 }) => {
    if (!data || !data.columns || data.columns.length === 0) return null;
    const rows = data.values || [];
    const shown = rows.slice(0, maxRows);

    return (
        <div className="overflow-auto max-h-[340px]">
            <table className="result-table">
                <thead>
                    <tr>{data.columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
                </thead>
                <tbody>
                    {shown.map((row, r) => (
                        <tr key={r}>
                            {row.map((v, c) => {
                                const isNull = v === null || v === undefined;
                                const isNum = typeof v === 'number';
                                return (
                                    <td key={c} className={isNull ? 'is-null' : isNum ? 'is-num' : ''}>
                                        {isNull ? 'NULL' : String(v)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {rows.length > maxRows && (
                <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.08em]" style={{ color: 'var(--text-faint)' }}>
                    … prime {maxRows} righe di {rows.length}
                </p>
            )}
        </div>
    );
};

export { ResultTable };
