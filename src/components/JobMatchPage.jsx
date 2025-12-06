import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useCV } from '../context/CVContext';
import { analyzeCV, rewriteCV } from '../services/aiService';
import { JobDescriptionUpload } from './JobDescriptionUpload';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const JobMatchPage = ({ onNavigate }) => {
    const { apiKey, jobDescription, aiRecommendations, setAiRecommendations, setCvData } = useCV();
    const [cvText, setCvText] = useState('');
    const [cvFileName, setCvFileName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const fileInputRef = useRef(null);

    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert("Please upload a PDF file for your CV.");
            return;
        }

        setCvFileName(file.name);
        try {
            const text = await extractTextFromPDF(file);
            setCvText(text);
        } catch (error) {
            console.error("Error reading CV PDF:", error);
            alert("Failed to read CV PDF.");
        }
    };

    const extractTextFromPDF = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    };

    const handleAnalyze = async () => {
        if (!cvText) {
            alert("Please upload your CV first.");
            return;
        }
        if (!jobDescription) {
            alert("Please upload a Job Description.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const results = await analyzeCV(cvText, jobDescription, apiKey);
            setAiRecommendations(results);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRewrite = async () => {
        if (!confirm("This will OVERWRITE your current CV in the editor. Are you sure?")) return;

        setIsRewriting(true);
        try {
            const rewrittenCV = await rewriteCV(cvText, jobDescription, apiKey);

            // Validate structure roughly
            if (rewrittenCV.personal && rewrittenCV.experience) {
                setCvData(rewrittenCV);

                // --- NEW: Generate new ATS Score ---
                // Convert structured data back to text for analysis
                const newCvText = `
                    ${rewrittenCV.personal.fullName}
                    ${rewrittenCV.personal.email} ${rewrittenCV.personal.phone}
                    ${rewrittenCV.personal.summary}
                    
                    Skills: ${(rewrittenCV.skills || []).join(', ')}
                    
                    Experience:
                    ${rewrittenCV.experience.map(e => `${e.title} at ${e.company}\n${e.description}`).join('\n')}
                    
                    Education:
                    ${rewrittenCV.education.map(e => `${e.degree} at ${e.school}`).join('\n')}
                `;

                const newAnalysis = await analyzeCV(newCvText, jobDescription, apiKey);
                setAiRecommendations(newAnalysis);

                // Show success and redirect
                const confirmMsg = `CV Rewritten!\n\n🚀 NEW ATS SCORE: ${newAnalysis.score}/100\n\nGo to Editor to see changes?`;
                if (confirm(confirmMsg)) {
                    if (onNavigate) {
                        onNavigate('builder');
                    }
                }
            } else {
                throw new Error("AI returned invalid CV structure.");
            }
        } catch (error) {
            console.error(error);
            alert("Rewrite Failed: " + error.message);
        } finally {
            setIsRewriting(false);
        }
    };

    return (
        <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Job Match Analysis
                </h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                    Upload your CV and a Job Description to get an ATS match score and recommendations.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Left Column: CV Upload */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>1</div>
                        <h3>Your CV</h3>
                    </div>

                    <div
                        style={{
                            border: '2px dashed var(--border)',
                            borderRadius: 'var(--radius)',
                            padding: '3rem 1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: cvFileName ? 'rgba(240, 253, 244, 0.5)' : 'var(--background)',
                            borderColor: cvFileName ? '#22c55e' : 'var(--border)',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => !cvFileName && (e.currentTarget.style.borderColor = 'var(--primary)')}
                        onMouseLeave={(e) => !cvFileName && (e.currentTarget.style.borderColor = 'var(--border)')}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf"
                            onChange={handleCVUpload}
                        />
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
                            {cvFileName ? '✅' : '📄'}
                        </span>
                        <p style={{ fontWeight: '600', color: cvFileName ? '#166534' : 'var(--text-main)' }}>
                            {cvFileName || "Click to Upload PDF CV"}
                        </p>
                    </div>
                    {cvText && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '500' }}>✓ Text extracted successfully</p>
                        </div>
                    )}
                </div>

                {/* Right Column: JD Upload */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>2</div>
                        <h3>Job Description</h3>
                    </div>
                    <JobDescriptionUpload />
                </div>
            </div>

            {/* Analyze Button */}
            <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                <button
                    className="btn btn-primary"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !cvText || !jobDescription}
                    style={{
                        padding: '1rem 3rem',
                        fontSize: '1.2rem',
                        borderRadius: '99px',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    {isAnalyzing ? 'Analyzing Match...' : '🚀 Analyze Match Score'}
                </button>
            </div>

            {/* Results Section */}
            {aiRecommendations && (
                <div className="glass-panel" style={{ padding: '2.5rem', animation: 'fadeIn 0.5s ease-out', marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Analysis Results</h2>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>ATS Score</span>
                            <span style={{ fontSize: '4rem', fontWeight: '800', color: aiRecommendations.score > 70 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>
                                {aiRecommendations.score}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <div>
                            <h3 style={{ color: '#ef4444', marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ⚠️ Missing Keywords
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {aiRecommendations.missingKeywords?.map((kw, i) => (
                                    <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ color: '#3b82f6', marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                💡 AI Recommendations
                            </h3>
                            <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
                                {aiRecommendations.recommendations?.map((rec, i) => (
                                    <li key={i} style={{ marginBottom: '0.75rem' }}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.6)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>✨ Tailored Professional Summary</h3>
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => navigator.clipboard.writeText(aiRecommendations.tailoredSummary)}
                            >
                                Copy
                            </button>
                        </div>
                        <p style={{ fontStyle: 'italic', color: '#334155', lineHeight: '1.8', fontSize: '1.1rem' }}>
                            "{aiRecommendations.tailoredSummary}"
                        </p>
                    </div>

                    {/* Rewrite Button */}
                    <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Ready to optimize?</h3>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                            Let AI automatically rewrite your CV content (Summary & Experience) to perfectly target this job description and improve your ATS score.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={handleRewrite}
                            disabled={isRewriting}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
                            }}
                        >
                            {isRewriting ? '✨ Rewriting CV...' : '✨ Auto-Rewrite CV'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
