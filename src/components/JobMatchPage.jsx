import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useCV } from '../context/CVContext';
import { analyzeCV, rewriteCV } from '../services/aiService';
import { JobDescriptionUpload } from './JobDescriptionUpload';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Progress } from "./ui/progress";
import { Upload, FileText, CheckCircle2, AlertTriangle, Lightbulb, Sparkles, ArrowRight, Wand2 } from "lucide-react";

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export const JobMatchPage = ({ onNavigate }) => {
    const {
        apiKey, jobDescription, aiRecommendations, setAiRecommendations, setCvData,
        userId, aiProvider, aiModel
    } = useCV();
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
            const results = await analyzeCV(cvText, jobDescription, {
                userId,
                provider: aiProvider,
                model: aiModel
            });
            setAiRecommendations(results);
        } catch (error) {
            console.error(error);
            if (error.message.includes("402") || error.message.includes("credits")) {
                alert("Insufficient Credits. Please purchase more.");
            } else {
                alert(error.message);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRewrite = async () => {
        if (!confirm("This will OVERWRITE your current CV in the editor. Are you sure?")) return;

        setIsRewriting(true);
        try {
            const rewrittenCV = await rewriteCV(cvText, jobDescription, {
                userId,
                provider: aiProvider,
                model: aiModel
            });

            // Validate structure roughly
            if (rewrittenCV.personal && rewrittenCV.experience) {
                setCvData(rewrittenCV);

                // --- NEW: Generate new ATS Score ---
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

                const newAnalysis = await analyzeCV(newCvText, jobDescription, {
                    userId,
                    provider: aiProvider,
                    model: aiModel
                });
                setAiRecommendations(newAnalysis);

                // Show success and redirect
                const confirmMsg = `CV Rewritten!\n\n🚀 NEW ATS SCORE: ${newAnalysis.score}/100\n\nGo to Editor to see changes?`;
                if (confirm(confirmMsg)) {
                    if (onNavigate) {
                        onNavigate('editor');
                    }
                }
            } else {
                throw new Error("AI returned invalid CV structure.");
            }
        } catch (error) {
            console.error(error);
            if (error.message.includes("402") || error.message.includes("credits")) {
                alert("Insufficient Credits. Please purchase more.");
            } else {
                alert("Rewrite Failed: " + error.message);
            }
        } finally {
            setIsRewriting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Job Match Analysis
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Upload your CV and a Job Description to get an ATS match score and recommendations.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: CV Upload */}
                <Card className="border-2 border-dashed shadow-sm hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
                            Your CV
                        </CardTitle>
                        <CardDescription>Upload your current resume (PDF)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`
                                rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all
                                ${cvFileName ? 'bg-green-50 border-green-500/50' : 'bg-muted/50 border-muted-foreground/20 hover:bg-muted/70'}
                            `}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf"
                                onChange={handleCVUpload}
                            />
                            {cvFileName ? (
                                <div className="space-y-2">
                                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                                    <p className="font-semibold text-green-700">{cvFileName}</p>
                                    <p className="text-sm text-green-600">Click to change</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="h-12 w-12 bg-background rounded-full flex items-center justify-center mx-auto shadow-sm">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">Click to upload PDF</p>
                                        <p className="text-sm text-muted-foreground mt-1">or drag and drop here</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: JD Upload */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">2</span>
                            Job Description
                        </CardTitle>
                        <CardDescription>Paste or upload the job details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JobDescriptionUpload />
                    </CardContent>
                </Card>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center py-8">
                <Button
                    size="lg"
                    className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all flex flex-col items-center justify-center gap-1"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !cvText || !jobDescription}
                >
                    {isAnalyzing ? (
                        <>Analyzing Match...</>
                    ) : (
                        <>
                            <div className="flex items-center">
                                <Sparkles className="mr-2 h-5 w-5" /> Analyze Match Score
                            </div>
                            <span className="text-xs opacity-80">(Cost: 10 Credits)</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Results Section */}
            {aiRecommendations && (
                <div className="animate-in slide-in-from-bottom-5 duration-500">
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/20 shadow-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                        <CardContent className="p-8">
                            {/* Score Header */}
                            <div className="flex flex-col md:flex-row justify-between items-center border-b pb-8 mb-8 gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
                                    <p className="text-muted-foreground">Here's how your CV matches the job description.</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">ATS Match Score</div>
                                        <div className={`text-5xl font-black ${aiRecommendations.score > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                                            {aiRecommendations.score}%
                                        </div>
                                    </div>
                                    <div className="w-32 h-32 relative">
                                        {/* Circular progress placeholder or library if we had one, for now text is good */}
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray={377}
                                                strokeDashoffset={377 - (377 * aiRecommendations.score) / 100}
                                                className={aiRecommendations.score > 70 ? 'text-green-500' : 'text-amber-500'}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-destructive">
                                        <AlertTriangle className="h-5 w-5" /> Missing Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {aiRecommendations.missingKeywords?.map((kw, i) => (
                                            <span key={i} className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-blue-500">
                                        <Lightbulb className="h-5 w-5" /> AI Recommendations
                                    </h3>
                                    <ul className="space-y-3">
                                        {aiRecommendations.recommendations?.map((rec, i) => (
                                            <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                                                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <Card className="mt-8 bg-muted/30 border-dashed">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" /> Tailored Professional Summary
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(aiRecommendations.tailoredSummary)}>
                                            Copy
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-background p-4 rounded-md border text-sm italic text-muted-foreground leading-relaxed">
                                        "{aiRecommendations.tailoredSummary}"
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-12 text-center border-t pt-8">
                                <h3 className="text-xl font-bold mb-2">Ready to optimize?</h3>
                                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                                    Let AI automatically rewrite your CV content (Summary & Experience) to perfectly target this job description.
                                </p>
                                <Button
                                    size="lg"
                                    onClick={handleRewrite}
                                    disabled={isRewriting}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-auto py-3 px-8 shadow-lg shadow-indigo-500/25 flex flex-col items-center"
                                >
                                    {isRewriting ? (
                                        <>Rewriting CV...</>
                                    ) : (
                                        <>
                                            <div className="flex items-center">
                                                <Wand2 className="mr-2 h-5 w-5" /> Auto-Rewrite CV for Higher Score
                                            </div>
                                            <span className="text-xs opacity-80">(Cost: 10 Credits)</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
