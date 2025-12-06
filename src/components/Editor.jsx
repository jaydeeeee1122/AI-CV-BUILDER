import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { PersonalSection } from './editor/PersonalSection';
import { ExperienceSection } from './editor/ExperienceSection';
import { EducationSection } from './editor/EducationSection';
import { JobDescriptionUpload } from './JobDescriptionUpload';
import { analyzeCV, testApiKey } from '../services/aiService';
import './Editor.css';

export const Editor = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const { apiKey, setApiKey, cvData, jobDescription, aiRecommendations, setAiRecommendations } = useCV();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleTestKey = async () => {
        try {
            const result = await testApiKey(apiKey);
            alert(result);
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    const handleAnalyze = async () => {
        if (!jobDescription) {
            alert("Please upload a Job Description first.");
            return;
        }
        setIsAnalyzing(true);
        try {
            // Construct a simple string representation of the CV
            const cvText = `
                Name: ${cvData.personal.fullName}
                Summary: ${cvData.personal.summary}
                Experience: ${cvData.experience.map(e => `${e.position} at ${e.company}: ${e.description}`).join('\n')}
                Education: ${cvData.education.map(e => `${e.degree} at ${e.school}`).join('\n')}
            `;

            const results = await analyzeCV(cvText, jobDescription, apiKey);
            setAiRecommendations(results);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'personal': return <PersonalSection />;
            case 'experience': return <ExperienceSection />;
            case 'education': return <EducationSection />;
            case 'job-match': return (
                <div>
                    <JobDescriptionUpload />

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !jobDescription}
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        >
                            {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Match'}
                        </button>
                    </div>

                    {aiRecommendations && (
                        <div className="analysis-results" style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Match Score</h3>
                                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: aiRecommendations.score > 70 ? 'green' : 'orange' }}>
                                    {aiRecommendations.score}%
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <h4>⚠️ Missing Keywords</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {aiRecommendations.missingKeywords?.map((kw, i) => (
                                        <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <h4>💡 Recommendations</h4>
                                <ul style={{ paddingLeft: '1.5rem' }}>
                                    {aiRecommendations.recommendations?.map((rec, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4>✨ Tailored Summary</h4>
                                <p style={{ fontStyle: 'italic', color: '#555' }}>{aiRecommendations.tailoredSummary}</p>
                                <button
                                    className="btn btn-sm btn-outline"
                                    style={{ marginTop: '0.5rem' }}
                                    onClick={() => navigator.clipboard.writeText(aiRecommendations.tailoredSummary)}
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
            default: return <PersonalSection />;
        }
    };

    return (
        <div className="editor-container">
            {aiRecommendations && (
                <div style={{
                    background: aiRecommendations.score > 70 ? '#f0fdf4' : '#fff7ed',
                    borderBottom: `1px solid ${aiRecommendations.score > 70 ? '#86efac' : '#fdba74'}`,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontWeight: 'bold', color: aiRecommendations.score > 70 ? '#166534' : '#9a3412' }}>
                        🎯 Job Match Score: {aiRecommendations.score}%
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                        Optimized for: {jobDescription?.fileName || 'Job Description'}
                    </span>
                </div>
            )}

            <div className="api-key-config" style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                    Google Gemini API Key
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Gemini API Key"
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button onClick={handleTestKey} className="btn btn-sm btn-outline">Test Key</button>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.
                </p>
            </div>

            <div className="editor-tabs">
                <button
                    className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                >
                    Personal
                </button>
                <button
                    className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
                    onClick={() => setActiveTab('experience')}
                >
                    Experience
                </button>
                <button
                    className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
                    onClick={() => setActiveTab('education')}
                >
                    Education
                </button>
                <button
                    className={`tab-btn ${activeTab === 'job-match' ? 'active' : ''}`}
                    onClick={() => setActiveTab('job-match')}
                    style={{ borderBottom: activeTab === 'job-match' ? '2px solid var(--primary)' : 'none', color: activeTab === 'job-match' ? 'var(--primary)' : 'inherit' }}
                >
                    🎯 Job Match
                </button>
            </div>

            <div className="editor-content">
                {renderContent()}
            </div>
        </div>
    );
};
