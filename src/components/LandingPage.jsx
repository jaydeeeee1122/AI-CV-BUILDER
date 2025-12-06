import React from 'react';

export const LandingPage = ({ onGetStarted, onLogin }) => {
    return (
        <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <nav style={{ padding: '1.5rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #4f46e5, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AI CV Builder
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onLogin} className="btn btn-ghost">Sign In</button>
                        <button onClick={onGetStarted} className="btn btn-primary">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ padding: '5rem 0', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                        Build Your Professional Resume<br />
                        <span style={{ color: '#4f46e5' }}>in Minutes with AI</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Beat the ATS, impress recruiters, and land your dream job with our AI-powered resume builder and cover letter generator.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button onClick={onGetStarted} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Build My CV Now
                        </button>
                        <button className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            View Samples
                        </button>
                    </div>

                    {/* Hero Image / Preview */}
                    <div style={{
                        marginTop: '4rem',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1rem',
                        padding: '1rem',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ background: '#e2e8f0', height: '400px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            {/* Placeholder for a screenshot - using text for now */}
                            [App Preview Screenshot Workspace]
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section style={{ padding: '5rem 0', background: 'rgba(255,255,255,0.5)' }}>
                <div className="container">
                    <div className="cv-builder-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        <FeatureCard
                            icon="✨"
                            title="AI Writer"
                            desc="Stuck on what to write? Our AI generates professional summaries and experience bullets tailored to your role."
                        />
                        <FeatureCard
                            icon="🎯"
                            title="ATS Friendly"
                            desc="Don't get filtered out. Our templates are designed to pass Applicant Tracking Systems with ease."
                        />
                        <FeatureCard
                            icon="✉️"
                            title="Cover Letters"
                            desc="Instantly generate personalized cover letters that match your CV to the specific job description."
                        />
                        <FeatureCard
                            icon="📊"
                            title="Job Tracker"
                            desc="Keep track of every application, interview, and offer in one organized dashboard."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ marginTop: 'auto', padding: '2rem 0', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <div className="container" style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    © 2025 AI CV Builder. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-panel p-6" style={{ padding: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
        <p>{desc}</p>
    </div>
);
