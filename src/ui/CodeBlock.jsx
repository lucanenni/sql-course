import React from 'react';

// Blocco di codice statico (non eseguibile), per mostrare la sintassi.
const CodeBlock = ({ code }) => (
    <div className="my-7 border" style={{ borderColor: 'var(--border-strong)' }}>
        <pre className="p-4 text-[13px] font-mono overflow-x-auto m-0 leading-relaxed" style={{ background: 'var(--code-bg)' }}>
            <code className="block" style={{ color: 'var(--text-primary)' }}>{code}</code>
        </pre>
    </div>
);

export { CodeBlock };
