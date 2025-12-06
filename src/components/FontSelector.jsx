import React from 'react';
import { useCV } from '../context/CVContext';

const FONTS = [
    { name: 'Modern (Inter)', value: "'Inter', sans-serif" },
    { name: 'Clean (Open Sans)', value: "'Open Sans', sans-serif" },
    { name: 'Standard (Roboto)', value: "'Roboto', sans-serif" },
    { name: 'Formal (Merriweather)', value: "'Merriweather', serif" },
    { name: 'Elegant (Playfair Display)', value: "'Playfair Display', serif" },
];

export const FontSelector = () => {
    const { cvData, updatePersonal } = useCV();
    const currentFont = cvData.personal.themeFont || "'Inter', sans-serif";

    const handleChange = (e) => {
        updatePersonal('themeFont', e.target.value);
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Typography</h4>
            <select
                value={currentFont}
                onChange={handleChange}
                className="form-input"
                style={{
                    width: '100%',
                    fontFamily: currentFont, // Preview the font in the dropdown itself
                    fontSize: '0.9rem'
                }}
            >
                {FONTS.map(font => (
                    <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
