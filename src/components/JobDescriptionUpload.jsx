import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useCV } from '../context/CVContext';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const JobDescriptionUpload = () => {
    const { setJobDescription, jobDescription } = useCV();
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setFileName(file.name);

        try {
            if (file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                setJobDescription({ type: 'text', content: text, fileName: file.name });
            } else if (file.type.startsWith('image/')) {
                const base64 = await convertToBase64(file);
                setJobDescription({ type: 'image', content: base64, fileName: file.name });
            } else {
                // Assume text
                const text = await file.text();
                setJobDescription({ type: 'text', content: text, fileName: file.name });
            }
        } catch (error) {
            console.error("Error processing file:", error);
            alert("Failed to read file. Please try copying the text manually.");
        } finally {
            setLoading(false);
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

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.5)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>📄</span> Job Description
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Upload PDF/Image or paste text to get tailored analysis.
            </p>

            <div className="form-group">
                <div
                    style={{
                        border: '2px dashed var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--background)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    onClick={() => fileInputRef.current.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf,.jpg,.jpeg,.png,.txt"
                        onChange={handleFileUpload}
                    />
                    {loading ? (
                        <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Processing...</span>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{fileName || "Upload File"}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Or paste job description here..."
                    value={jobDescription?.type === 'text' ? jobDescription.content : ''}
                    onChange={(e) => setJobDescription({ type: 'text', content: e.target.value, fileName: 'Manual Entry' })}
                    style={{ resize: 'vertical', fontSize: '0.875rem', background: 'white' }}
                />
            </div>
        </div>
    );
};
