
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

        // 1. Basics (20%)
        if (personal.fullName) score += 5;
        if (personal.email) score += 5;
        if (personal.phone) score += 5;
        if (personal.summary && personal.summary.length > 50) {
            score += 5;
        } else {
            suggestions.push("Add a professional summary (50+ chars) to introduce yourself.");
        }

        // 2. Experience (40%)
        if (experience.length > 0) score += 20;
        else suggestions.push("Add at least one work experience.");

        if (experience.length >= 2) score += 10;

        const detailedExp = experience.filter(e => e.description && e.description.length > 100);
        if (detailedExp.length === experience.length && experience.length > 0) {
            score += 10;
        } else if (experience.length > 0) {
            suggestions.push("Describe your work achievements in more detail.");
        }

        // 3. Skills (20%)
        if (skills.length >= 3) score += 10;
        else suggestions.push("List at least 3 key skills.");

        if (skills.length >= 6) score += 10;

        // 4. Education (20%)
        if (education.length > 0) score += 20;
        else suggestions.push("Add your educational background.");

        return { score, suggestions };
    }, [cvData]);

    const getScoreColor = (s) => {
        if (s < 50) return "text-red-500";
        if (s < 80) return "text-amber-500";
        return "text-green-500";
    };

    return (
        <Card className="mb-6 bg-gradient-to-br from-background to-secondary/20 border-primary/10">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                        <TrendingUp size={16} /> Resume Strength
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
                        {analysis.suggestions.slice(0, 2).map((sugg, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <AlertCircle size={14} className="mt-0.5 text-amber-500 shrink-0" />
                                <span>{sugg}</span>
                            </div>
                        ))}
                        {analysis.suggestions.length > 2 && (
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                + {analysis.suggestions.length - 2} more improvements available
                            </p>
                        )}
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
