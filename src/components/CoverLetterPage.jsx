import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { generateCoverLetter } from '../services/aiService';
import { JobDescriptionUpload } from './JobDescriptionUpload';

export const CoverLetterPage = () => {
    const { cvData, jobDescription, setJobDescription } = useCV();
    const [letter, setLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!jobDescription) {
            alert("Please provide a Job Description first.");
            return;
        }
        setIsGenerating(true);
        try {
            const response = await generateCoverLetter(cvData, jobDescription);
            setLetter(response.coverLetter);
        } catch (error) {
            console.error(error);
            alert("Failed to generate cover letter: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(letter);
        alert("Copied to clipboard!");
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>

            {/* Left Sidebar: Controls */}
            <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                <h2 style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ✉️ Generator
                </h2>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>1. Target Job</h3>
                    <JobDescriptionUpload />
                    {!jobDescription && (
                        <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>
                            * Required for tailoring
                        </p>
                    )}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={isGenerating || !jobDescription}
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '1rem' }}
                >
                    {isGenerating ? '✍️ Writing...' : '✨ Write Cover Letter'}
                </button>

                {letter && (
                    <button
                        className="btn btn-outline"
                        onClick={copyToClipboard}
                        style={{ width: '100%' }}
                    >
                        📋 Copy to Clipboard
                    </button>
                )}
            </div>

            {/* Right Main: Editor */}
            <div className="glass-panel" style={{ padding: '3rem', minHeight: '80vh', position: 'relative' }}>
                {!letter ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        opacity: 0.6
                    }}>
                        <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</span>
                        <p>Your AI-generated cover letter will appear here.</p>
                        <p style={{ fontSize: '0.9rem' }}>Tailored to your CV and the specific Job Description.</p>
                    </div>
                ) : (
                    <textarea
                        value={letter}
                        onChange={(e) => setLetter(e.target.value)}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            background: 'transparent',
                            resize: 'none',
                            fontSize: '1.1rem',
                            lineHeight: '1.8',
                            color: '#1e293b',
                            fontFamily: 'Georgia, serif',
                            outline: 'none'
                        }}
                    />
                )}
            </div>
        </div>
    );
};
