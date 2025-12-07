
import React, { useMemo } from 'react';
import { useCV } from '../context/CVContext';
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export const ResumeStrength = () => {
    const { cvData } = useCV();
    const { personal, experience, education, skills } = cvData;

    const analysis = useMemo(() => {
        let score = 0;
        const suggestions = [];

        // 1. Basics (15%) - Reduced from 20%
        if (personal.fullName) score += 5;
        if (personal.email) score += 5;
        if (personal.phone) score += 5;

        // 2. Summary (15%)
        if (personal.summary && personal.summary.length > 100) {
            score += 15;
        } else {
            suggestions.push("Expand your summary (100+ chars) to clearly state your value.");
        }

        // 3. Experience (40%)
        if (experience.length > 0) score += 10;
        else suggestions.push("Add at least one work experience.");

        if (experience.length >= 2) score += 10;

        // Quality Check: Look for numbers/metrics (e.g. "20%", "5 teams")
        const hasMetrics = experience.some(e => /\d+|%/.test(e.description || ''));
        if (hasMetrics) score += 10;
        else suggestions.push("Include numbers or metrics in your experience (e.g., 'Increased sales by 20%').");

        const detailedExp = experience.filter(e => e.description && e.description.length > 150);
        if (detailedExp.length === experience.length && experience.length > 0) {
            score += 10;
        } else if (experience.length > 0) {
            suggestions.push("Describe your work achievements in more detail (150+ chars).");
        }

        // 4. Skills (15%)
        if (skills.length >= 5) score += 5;
        else suggestions.push("List at least 5 key skills.");

        if (skills.length >= 8) score += 10;

        // 5. Education (15%)
        if (education.length > 0) score += 15;
        else suggestions.push("Add your educational background.");

        return { score: Math.min(100, score), suggestions };
    }, [cvData]);

    const getScoreColor = (s) => {
        if (s < 60) return "text-red-500";
        if (s < 85) return "text-amber-500";
        return "text-green-500";
    };

    return (
        <Card className="mb-6 bg-gradient-to-br from-background to-secondary/20 border-primary/10">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <TrendingUp size={16} /> Resume Completeness
                    </CardTitle>
                    <span className={`text-2xl font-black ${getScoreColor(analysis.score)}`}>
                        {analysis.score}%
                    </span>
                </div>
                <Progress value={analysis.score} className="h-2" />
            </CardHeader>
            <CardContent>
                {analysis.suggestions.length > 0 ? (
                    <div className="space-y-2 mt-2">
                        {analysis.suggestions.slice(0, 3).map((sugg, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <AlertCircle size={14} className="mt-0.5 text-amber-500 shrink-0" />
                                <span className="flex-1">{sugg}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-2">
                        <CheckCircle2 size={16} />
                        Excellent! Your resume profile is very strong.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
