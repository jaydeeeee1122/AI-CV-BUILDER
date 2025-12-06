import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { PersonalSection } from './editor/PersonalSection';
import { ExperienceSection } from './editor/ExperienceSection';
import { EducationSection } from './editor/EducationSection';
import './Editor.css';

export const Editor = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const { aiRecommendations } = useCV();

    const renderContent = () => {
        switch (activeTab) {
            case 'personal': return <PersonalSection />;
            case 'experience': return <ExperienceSection />;
            case 'education': return <EducationSection />;
            default: return <PersonalSection />;
        }
    };

    return (
        <div className="editor-container">
            {aiRecommendations && aiRecommendations.score && (
                <div style={{
                    background: aiRecommendations.score > 70 ? 'rgba(240, 253, 244, 0.8)' : 'rgba(255, 247, 237, 0.8)',
                    border: `1px solid ${aiRecommendations.score > 70 ? '#86efac' : '#fdba74'}`,
                    borderRadius: 'var(--radius)',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <span style={{ fontWeight: 'bold', color: aiRecommendations.score > 70 ? '#166534' : '#9a3412' }}>
                        🎯 Last Match Score: {aiRecommendations.score}%
                    </span>
                </div>
            )}

            <div className="editor-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <button
                    className={`btn btn-sm ${activeTab === 'personal' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('personal')}
                >
                    Personal
                </button>
                <button
                    className={`btn btn-sm ${activeTab === 'experience' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('experience')}
                >
                    Experience
                </button>
                <button
                    className={`btn btn-sm ${activeTab === 'education' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('education')}
                >
                    Education
                </button>
            </div>

            <div className="editor-content">
                {renderContent()}
            </div>
        </div>
    );
};
