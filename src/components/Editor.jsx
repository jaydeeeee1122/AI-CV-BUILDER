import React from 'react';
import { useCV } from '../context/CVContext';
import { PersonalSection } from './editor/PersonalSection';
import { ExperienceSection } from './editor/ExperienceSection';
import { EducationSection } from './editor/EducationSection';
import { testApiKey } from '../services/aiService';
import './Editor.css';

export const Editor = () => {
    const { apiKey, setApiKey } = useCV();

    const handleTestKey = async () => {
        try {
            const result = await testApiKey(apiKey);
            alert(result);
        } catch (error) {
            alert(`API Key Test Failed:\n${error.message}\n\nPlease ensure you enabled the "Generative Language API" in your Google Cloud Console.`);
        }
    };

    return (
        <div className="editor-container">
            <div className="form-group" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <label style={{ color: 'var(--primary)' }}>Google Gemini API Key</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="password"
                        placeholder="Enter your Gemini API Key for AI features"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button onClick={handleTestKey} className="btn btn-outline btn-sm">
                        Test Key
                    </button>
                </div>
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                    Get key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.
                </small>
            </div>

            <PersonalSection />
            <hr className="divider" />
            <ExperienceSection />
            <hr className="divider" />
            <EducationSection />
        </div>
    );
};
