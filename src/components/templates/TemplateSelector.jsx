import React from 'react';

export const TemplateSelector = ({ activeTemplate, onSelect }) => {
    const templates = [
        { id: 'modern', name: 'Modern (Glass)', color: 'var(--primary)' },
        { id: 'minimalist', name: 'ATS Minimalist', color: '#333' }
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            background: 'rgba(255,255,255,0.1)',
            padding: '0.5rem',
            borderRadius: '8px',
            backdropFilter: 'blur(5px)'
        }}>
            <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Template:</span>
            {templates.map(t => (
                <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    style={{
                        padding: '0.25rem 0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        background: activeTemplate === t.id ? t.color : 'transparent',
                        color: activeTemplate === t.id ? '#fff' : 'var(--text)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    {t.name}
                </button>
            ))}
        </div>
    );
};
