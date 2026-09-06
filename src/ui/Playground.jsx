import React from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql.js';
import 'codemirror/addon/edit/matchbrackets.js';
import { useTheme } from '../lib/theme.jsx';
import { DATASETS, DATASET_LABELS } from '../content/datasets.js';
import { runExercise } from '../lib/db.js';
import { compareResults, runPredicates } from '../lib/check.js';
import { ResultTable } from './ResultTable.jsx';
import { SchemaPanel } from './SchemaPanel.jsx';
import { Icon } from './Icon.jsx';
const { useState, useEffect, useRef, useCallback } = React;

const Playground = ({
    id, initialCode, dataset = 'negozio',
    expected = null, ordered = false, verify = null,
    checks = null, hint = null, onSolved,
}) => {
    const seedSql = DATASETS[dataset] || DATASETS.negozio;
    const datasetLabel = DATASET_LABELS[dataset] || dataset;
    const graded = !!expected;
    const storageKey = 'sqc:code:' + id;

    const readSaved = () => {
        try { const v = localStorage.getItem(storageKey); return v == null ? initialCode : v; }
        catch (e) { return initialCode; }
    };

    const [result, setResult] = useState(null);   // { resultSets, error, checkData, rowsModified }
    const [status, setStatus] = useState('idle');  // idle | running | ok | error
    const [checkResults, setCheckResults] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [dirty, setDirty] = useState(false);
    const { theme } = useTheme();

    const taRef = useRef(null);
    const cmRef = useRef(null);
    const runSeqRef = useRef(0);
    const mountedRef = useRef(true);
    const solvedRef = useRef(false);
    const onSolvedRef = useRef(onSolved);
    useEffect(() => { onSolvedRef.current = onSolved; });

    const run = useCallback(async (code) => {
        const seq = ++runSeqRef.current;
        setStatus('running');
        let r;
        try {
            r = await runExercise({ seedSql, code, verifySql: verify });
        } catch (e) {
            r = { resultSets: [], error: String((e && e.message) || e), checkData: null, rowsModified: 0 };
        }
        if (seq !== runSeqRef.current || !mountedRef.current) return;

        setResult(r);
        setStatus(r.error ? 'error' : 'ok');

        if (graded && !r.error) {
            const primary = compareResults(r.checkData, expected, { ordered });
            const extra = runPredicates(checks, r.checkData);
            const all = [
                { label: 'Il risultato è quello atteso', pass: primary.pass, error: primary.pass ? null : primary.reason },
                ...extra,
            ];
            setCheckResults(all);
            if (all.every((c) => c.pass) && !solvedRef.current) {
                solvedRef.current = true;
                if (onSolvedRef.current) onSolvedRef.current();
            }
        } else if (graded && r.error) {
            setCheckResults([{ label: 'Il risultato è quello atteso', pass: false, error: 'la query ha prodotto un errore' }]);
        } else {
            setCheckResults(null);
        }
    }, [seedSql, verify, graded, expected, ordered, checks]);

    const lastRunRef = useRef(null);

    const runNow = useCallback(() => {
        const code = cmRef.current ? cmRef.current.getValue() : initialCode;
        lastRunRef.current = code;
        setDirty(false);
        run(code);
    }, [run, initialCode]);
    const runNowRef = useRef(runNow);
    useEffect(() => { runNowRef.current = runNow; });

    useEffect(() => {
        mountedRef.current = true;
        if (!taRef.current || cmRef.current) return;
        const exec = () => { runNowRef.current(); return false; };
        cmRef.current = CodeMirror.fromTextArea(taRef.current, {
            mode: 'text/x-sqlite',
            theme: document.documentElement.classList.contains('dark') ? 'dracula' : 'neat',
            lineNumbers: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            extraKeys: { Tab: false, 'Shift-Tab': false, 'Cmd-Enter': exec, 'Ctrl-Enter': exec },
        });
        const initial = readSaved();
        cmRef.current.setValue(initial);
        lastRunRef.current = initial;
        run(initial);
        cmRef.current.on('change', (inst) => {
            const v = inst.getValue();
            try { localStorage.setItem(storageKey, v); } catch (e) {}
            setDirty(v !== lastRunRef.current);
        });
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (cmRef.current) cmRef.current.setOption('theme', theme === 'dark' ? 'dracula' : 'neat');
    }, [theme]);

    const restore = () => {
        try { localStorage.removeItem(storageKey); } catch (e) {}
        solvedRef.current = false;
        if (cmRef.current) cmRef.current.setValue(initialCode);
        lastRunRef.current = initialCode;
        setDirty(false);
        runNow();
    };

    const badge = dirty
        ? { t: 'modifiche non eseguite', c: 'var(--accent-text)' }
        : {
            idle: null,
            running: { t: 'esecuzione', c: 'var(--text-secondary)' },
            ok: { t: 'eseguita', c: 'var(--ok-bright)' },
            error: { t: 'errore', c: 'var(--err)' },
        }[status];

    const allPass = checkResults && checkResults.length && checkResults.every((c) => c.pass);

    // che cosa mostrare nel riquadro di destra
    const lastSet = result && result.resultSets && result.resultSets.length
        ? result.resultSets[result.resultSets.length - 1] : null;

    return (
        <div className="frame my-9" style={{ background: 'var(--code-bg)' }}>
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b font-mono text-[11px] uppercase tracking-[0.12em]"
                 style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-2">
                    <span style={{ width: 7, height: 7, background: 'var(--accent)', flex: 'none' }}></span>
                    query.sql
                </span>
                <div className="flex items-center gap-3">
                    {badge && (
                        <span className="flex items-center gap-1.5" style={{ color: badge.c }}>
                            <span style={{ width: 6, height: 6, background: badge.c, flex: 'none' }}></span>{badge.t}
                        </span>
                    )}
                    <button onClick={runNow} title="Esegui la query (Ctrl/Cmd + Invio)"
                            className="flex items-center gap-1.5 px-2.5 py-1 border transition-colors"
                            style={dirty
                                ? { borderColor: 'var(--accent)', background: 'var(--accent)', color: '#FCF9EF' }
                                : { borderColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                        <Icon name="play" className="w-3 h-3" /> esegui
                    </button>
                    <button onClick={restore} className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors" title="Ripristina il codice iniziale">
                        <Icon name="reset" className="w-3.5 h-3.5" /> reset
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1">
                <div className="border-b md:border-b-0 md:border-r overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                    <label className="sr-only" htmlFor={'ta-' + id}>Editor SQL</label>
                    <textarea id={'ta-' + id} ref={taRef} defaultValue={initialCode}></textarea>
                </div>
                <div style={{ background: 'var(--bg-secondary)' }}>
                    <div className="p-4 font-mono text-[13px] leading-relaxed overflow-auto max-h-[380px] min-h-[150px]" aria-live="polite">
                        {status === 'running' && <div style={{ color: 'var(--text-faint)' }}>…</div>}
                        {status !== 'running' && result && result.error && (
                            <div className="whitespace-pre-wrap break-words" style={{ color: 'var(--err)' }}>
                                <span className="mr-2 select-none">✗</span>{result.error}
                            </div>
                        )}
                        {status !== 'running' && result && !result.error && verify && (
                            <>
                                <p className="mb-1.5 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--text-faint)' }}>
                                    {result.rowsModified > 0 ? `${result.rowsModified} riga/e modificate · ` : ''}stato dopo la modifica
                                </p>
                                {result.checkData && result.checkData.columns.length
                                    ? <ResultTable data={result.checkData} />
                                    : <span style={{ color: 'var(--text-secondary)' }}>(nessuna riga)</span>}
                            </>
                        )}
                        {status !== 'running' && result && !result.error && !verify && lastSet && <ResultTable data={lastSet} />}
                        {status !== 'running' && result && !result.error && !verify && !lastSet && (
                            <div style={{ color: 'var(--text-secondary)' }}>
                                {result.rowsModified > 0
                                    ? `${result.rowsModified} riga/e modificate.`
                                    : 'La query è stata eseguita ma non ha restituito righe.'}
                            </div>
                        )}
                        {!verify && result && result.resultSets && result.resultSets.length > 1 && !result.error && (
                            <p className="mt-2 text-[10.5px] uppercase tracking-[0.08em]" style={{ color: 'var(--text-faint)' }}>
                                mostrata l'ultima di {result.resultSets.length} istruzioni
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {(checkResults || hint) && (
                <div className="px-4 py-3.5 border-t font-serif text-[0.95rem]" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                    {checkResults && (
                        <div className="space-y-2">
                            {checkResults.map((c, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <span className="mt-1" style={{ color: c.pass ? 'var(--ok-bright)' : 'var(--err)' }}>
                                        <Icon name={c.pass ? 'check' : 'x'} className="w-3.5 h-3.5" />
                                    </span>
                                    <span style={{ color: c.pass ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        {c.label}{c.error ? ' — ' + c.error : ''}
                                    </span>
                                </div>
                            ))}
                            {allPass && <span className="pill ok mt-2"><span className="dot"></span>Esercizio risolto</span>}
                        </div>
                    )}
                    {hint && (
                        <div className={checkResults ? 'mt-3.5' : ''}>
                            <button onClick={() => setShowHint((v) => !v)}
                                    className="font-mono text-[10.5px] uppercase tracking-[0.1em] underline"
                                    style={{ color: 'var(--accent-text)' }}>
                                {showHint ? 'Nascondi indizio' : 'Mostra indizio'}
                            </button>
                            {showHint && <p className="mt-2" style={{ color: 'var(--text-secondary)' }}
                                            dangerouslySetInnerHTML={{ __html: hint }} />}
                        </div>
                    )}
                </div>
            )}

            <SchemaPanel seedSql={seedSql} label={datasetLabel} />
        </div>
    );
};

export { Playground };
