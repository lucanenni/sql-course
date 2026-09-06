import React from 'react';
import { describeSchema } from '../lib/db.js';
const { useState, useEffect } = React;

// Pannello a scomparsa con lo schema del dataset dell'esercizio.
const SchemaPanel = ({ seedSql, label }) => {
    const [open, setOpen] = useState(false);
    const [schema, setSchema] = useState(null);

    useEffect(() => {
        if (!open || schema) return;
        let live = true;
        describeSchema(seedSql).then((s) => { if (live) setSchema(s); }).catch(() => {});
        return () => { live = false; };
    }, [open, schema, seedSql]);

    return (
        <div className="border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.1em]"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
                <span>Schema · {label}</span>
                <span>{open ? '−' : '+'}</span>
            </button>
            {open && (
                <div className="px-4 py-3 schema-table" style={{ background: 'var(--bg-secondary)' }}>
                    {!schema && <span style={{ color: 'var(--text-faint)' }}>…</span>}
                    {schema && schema.map((t) => (
                        <div key={t.name} className="mb-1.5">
                            <span className="tbl">{t.name}</span>
                            <span className="col"> (
                                {t.columns.map((c, i) => (
                                    <React.Fragment key={c.name}>
                                        {i > 0 && ', '}
                                        {c.name}
                                        {c.type ? <span className="typ"> {c.type.toLowerCase()}</span> : null}
                                    </React.Fragment>
                                ))}
                            )</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export { SchemaPanel };
