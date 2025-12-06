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
        <div className="editor-section-group">
            <h3>Job Description</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Upload a Job Description (PDF, Image) or paste text to get tailored recommendations.
            </p>

            <div className="form-group">
                <div
                    style={{
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f9f9f9',
                        marginBottom: '1rem'
                    }}
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
                        <span>Processing...</span>
                    ) : (
                        <div>
                            <span style={{ fontSize: '2rem' }}>📄</span>
                            <p>{fileName || "Click to Upload PDF or Image"}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label>Or Paste Text</label>
                <textarea
                    className="form-textarea"
                    rows="6"
                    placeholder="Paste job description text here..."
                    value={jobDescription?.type === 'text' ? jobDescription.content : ''}
                    onChange={(e) => setJobDescription({ type: 'text', content: e.target.value, fileName: 'Manual Entry' })}
                />
            </div>
        </div>
    );
};
