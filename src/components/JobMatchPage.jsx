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
                alert("CV Rewritten Successfully! Redirecting to Editor...");
                if (onNavigate) {
                    onNavigate('builder');
                } else {
                    console.warn("Navigation function not provided");
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
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>🎯 Job Match & ATS Analysis</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left Column: CV Upload */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginBottom: '1rem', color: '#444' }}>1. Upload Your CV</h2>
                    <div
                        style={{
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            padding: '3rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: cvFileName ? '#f0fdf4' : '#f9f9f9',
                            borderColor: cvFileName ? '#22c55e' : '#ccc'
                        }}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf"
                            onChange={handleCVUpload}
                        />
                        <span style={{ fontSize: '3rem' }}>{cvFileName ? '✅' : '📄'}</span>
                        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                            {cvFileName || "Click to Upload CV (PDF)"}
                        </p>
                    </div>
                    {cvText && (
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Text extracted successfully ({cvText.length} chars).</p>
                        </div>
                    )}
                </div>

                {/* Right Column: JD Upload */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginBottom: '1rem', color: '#444' }}>2. Job Description</h2>
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
                        borderRadius: '50px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Match Score'}
                </button>
            </div>

            {/* Results Section */}
            {aiRecommendations && (
                <div className="analysis-results" style={{ padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Analysis Results</h2>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1rem', color: '#666', display: 'block' }}>ATS Score</span>
                            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: aiRecommendations.score > 70 ? '#22c55e' : '#f97316' }}>
                                {aiRecommendations.score}/100
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Missing Keywords</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {aiRecommendations.missingKeywords?.map((kw, i) => (
                                    <span key={i} style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ color: '#3b82f6', marginBottom: '1rem' }}>💡 Recommendations</h3>
                            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                {aiRecommendations.recommendations?.map((rec, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                        <h3 style={{ color: '#475569', marginBottom: '1rem' }}>✨ Tailored Professional Summary</h3>
                        <p style={{ fontStyle: 'italic', color: '#334155', lineHeight: '1.6', fontSize: '1.1rem' }}>
                            "{aiRecommendations.tailoredSummary}"
                        </p>
                        <button
                            className="btn btn-sm btn-outline"
                            style={{ marginTop: '1rem' }}
                            onClick={() => navigator.clipboard.writeText(aiRecommendations.tailoredSummary)}
                        >
                            Copy to Clipboard
                        </button>
                    </div>

                    {/* Rewrite Button */}
                    <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>🚀 Ready to Apply?</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                            Let AI rewrite your entire CV (Summary & Experience) to perfectly match this job description.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={handleRewrite}
                            disabled={isRewriting}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {isRewriting ? '✨ Rewriting CV...' : '✨ Rewrite My CV for this Job'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
