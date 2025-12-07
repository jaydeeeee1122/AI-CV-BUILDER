import React from 'react';
import { useCV } from '../context/CVContext';
import { Type } from 'lucide-react';

export const FontSizeSelector = () => {
    const { cvData, updatePersonal } = useCV();
    const currentSize = cvData.personal.themeFontSize || 'medium';

    const sizes = [
        { id: '8pt', label: '8', value: '8pt' },
        { id: '10pt', label: '10', value: '10pt' },
        { id: '12pt', label: '12', value: '12pt' },
    ];

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Type size={14} /> Font Size
            </h4>
            <div className="flex bg-secondary/30 rounded-lg p-1 gap-1">
                {sizes.map((size) => (
                    <button
                        key={size.id}
                        onClick={() => updatePersonal('themeFontSize', size.id)}
                        className={`
                            flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                            ${currentSize === size.id
                                ? 'bg-white shadow-sm text-primary font-bold'
                                : 'text-muted-foreground hover:bg-white/50'}
                        `}
                        title={`Set font size to ${size.id}`}
                    >
                        {size.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
