
import React from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { CheckCircle2, Wand2, FileText, Target, LayoutTemplate, Share2 } from "lucide-react";

export const LandingPage = ({ onGetStarted, onLogin }) => {
    const templatesRef = React.useRef(null);

    const scrollToTemplates = () => {
        templatesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <FileText size={20} />
                        </div>
                        AI CV Builder
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={onLogin}>Log In</Button>
                        <Button onClick={onGetStarted}>Get Started Free</Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
                <div className="container px-4 text-center">
                    <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-secondary-foreground mb-6 bg-secondary/50 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        New: AI Job Match Score
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        Build a Professional CV<br />
                        <span className="text-primary">in Minutes with AI</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground mb-8">
                        Stop struggling with formatting. Our AI-powered builder writes your resume for you, optimizes it for ATS, and helps you land interviews 2x faster.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <Button size="lg" className="h-12 px-8 text-lg" onClick={onGetStarted}>
                            Build My CV Now
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg" onClick={scrollToTemplates}>
                            View Examples
                        </Button>
                    </div>

                    {/* Hero Image/Preview */}
                    <div className="relative mx-auto max-w-5xl rounded-xl border bg-background shadow-2xl overflow-hidden aspect-video">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10" />
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-accent/20">
                            [Interactive App Preview Screenshot]
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="py-24 bg-secondary/30">
                <div className="container px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose Our Builder?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We combine professional design with cutting-edge AI to give you the unfair advantage in your job search.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Wand2 className="h-10 w-10 text-primary" />}
                            title="AI Writing Assistant"
                            desc="Don't know what to say? Let our AI write professional summaries and experience bullet points for you."
                        />
                        <FeatureCard
                            icon={<Target className="h-10 w-10 text-primary" />}
                            title="ATS Optimization"
                            desc="Get a real-time match score against job descriptions and tailored keyword recommendations."
                        />
                        <FeatureCard
                            icon={<LayoutTemplate className="h-10 w-10 text-primary" />}
                            title="Professional Templates"
                            desc="Choose from field-tested templates designed by HR experts to be readable and impressive."
                        />
                        <FeatureCard
                            icon={<Share2 className="h-10 w-10 text-primary" />}
                            title="Instant Sharing"
                            desc="Publish your CV to a unique link or download as a perfectly formatted PDF in one click."
                        />
                    </div>
                </div>
            </section>

            {/* Templates Preview Section */}
            <section ref={templatesRef} className="py-24 bg-background">
                <div className="container px-4 text-center">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Professional Templates for Every Career</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Choose from our collection of ATS-friendly templates designed to get you hired.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { name: "Modern Professional", color: "bg-blue-100 dark:bg-blue-900/20" },
                            { name: "Executive Suite", color: "bg-slate-100 dark:bg-slate-800/50" },
                            { name: "Creative Designer", color: "bg-purple-100 dark:bg-purple-900/20" }
                        ].map((template, i) => (
                            <div key={i} className="group relative rounded-xl border bg-card shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer" onClick={onGetStarted}>
                                <div className={`aspect-[1/1.414] w-full ${template.color} flex items-center justify-center p-4`}>
                                    <div className="w-full h-full bg-background shadow-lg rounded-sm opacity-90 group-hover:scale-105 transition-transform duration-500 origin-top flex flex-col p-2 space-y-2">
                                        <div className="h-4 w-1/3 bg-foreground/10 rounded"></div>
                                        <div className="h-2 w-full bg-foreground/5 rounded"></div>
                                        <div className="h-2 w-2/3 bg-foreground/5 rounded"></div>
                                        <div className="flex-1 space-y-2 pt-4">
                                            {[1, 2, 3, 4, 5].map(j => (
                                                <div key={j} className="h-1.5 w-full bg-foreground/5 rounded"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-background/90 backdrop-blur border-t translate-y-full group-hover:translate-y-0 transition-transform">
                                    <h3 className="font-semibold">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground">Click to use this template</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing / CTA */}
            <section className="py-24 bg-secondary/30">
                <div className="container px-4 text-center">
                    <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-12 shadow-xl">
                        <h2 className="text-3xl font-bold tracking-tight mb-6">Ready to land your dream job?</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-10">
                            {["Unlimited AI Rewrites", "ATS Compatibility Check", "PDF Downloads", "Cover Letter Generator"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Button size="lg" className="w-full sm:w-auto px-12" onClick={onGetStarted}>
                            Start Building for Free
                        </Button>
                        <p className="mt-4 text-sm text-muted-foreground">No credit card required to start.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 bg-background">
                <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-primary-foreground">
                            <FileText size={14} />
                        </div>
                        AI CV Builder
                    </div>
                    <div className="text-sm text-muted-foreground">
                        © 2025 AI CV Builder. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <Card className="border-0 shadow-lg bg-background/50 backdrop-blur hover:bg-background transition-colors">
        <CardHeader>
            <div className="mb-4">{icon}</div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription className="text-base">{desc}</CardDescription>
        </CardContent>
    </Card>
);
