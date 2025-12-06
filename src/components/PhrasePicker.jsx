import React, { useState } from 'react';
import { phraseCategories } from '../data/phraseLibrary';

export const PhrasePicker = ({ onSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState(Object.keys(phraseCategories)[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPhrases = phraseCategories[activeCategory].filter(phrase =>
        phrase.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            top: '0',
            right: '-320px',
            width: '300px',
            height: '100%',
            zIndex: 50,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
        }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>📚 Phrase Library</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', overflowX: 'auto', padding: '0.5rem', gap: '0.5rem', borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}>
                {Object.keys(phraseCategories).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            background: activeCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                            color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div style={{ padding: '0.5rem' }}>
                <input
                    type="text"
                    placeholder="Search phrases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                />
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {filteredPhrases.length > 0 ? (
                    filteredPhrases.map((phrase, idx) => (
                        <div
                            key={idx}
                            onClick={() => onSelect(phrase)}
                            style={{
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                background: 'rgba(255,255,255,0.4)',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'transparent'; }}
                        >
                            <span style={{ marginRight: '0.5rem' }}>⊕</span>
                            {phrase}
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        No phrases found.
                    </div>
                )}
            </div>
        </div>
    );
};
