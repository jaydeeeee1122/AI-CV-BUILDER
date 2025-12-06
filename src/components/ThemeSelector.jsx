import React from 'react';
import { useCV } from '../context/CVContext';

const COLORS = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Slate', value: '#334155' },
    { name: 'Black', value: '#000000' },
];

export const ThemeSelector = () => {
    const { cvData, updatePersonal } = useCV();
    const currentColor = cvData.personal.themeColor || '#2563eb';

    const handleColorChange = (color) => {
        updatePersonal('themeColor', color);
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Accent Color</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {COLORS.map((color) => (
                    <button
                        key={color.name}
                        onClick={() => handleColorChange(color.value)}
                        title={color.name}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: color.value,
                            border: currentColor === color.value ? '2px solid white' : '2px solid transparent',
                            boxShadow: currentColor === color.value ? `0 0 0 2px ${color.value}` : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
