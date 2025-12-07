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
        <div className="bg-white/50 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-8 transition-all hover:shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-2xl">📄</span> Job Description
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Upload PDF/Image or paste text to get tailored analysis.
            </p>

            <div className="space-y-6">
                <div
                    className={`
                        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                        ${loading ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20 hover:border-primary hover:bg-primary/5'}
                    `}
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
                        <div className="flex flex-col items-center gap-2 text-primary animate-pulse">
                            <span className="text-sm font-medium">Processing File...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-foreground">{fileName || "Upload File"}</span>
                            <span className="text-xs">
                                {fileName ? 'Click to change' : 'Click to upload PDF or Image'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block text-center">
                        Or paste text directly
                    </label>
                    <textarea
                        className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        rows="6"
                        placeholder="Paste the job description text here..."
                        value={jobDescription?.type === 'text' ? jobDescription.content : ''}
                        onChange={(e) => setJobDescription({ type: 'text', content: e.target.value, fileName: 'Manual Entry' })}
                    />
                </div>
            </div>
        </div>
    );
};
