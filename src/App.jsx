import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CVProvider, useCV } from './context/CVContext';
import Editor from './components/Editor';
import { Preview } from './components/Preview';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { JobTracker } from './components/JobTracker';
import { JobMatchPage } from './components/JobMatchPage';
import { CoverLetterPage } from './components/CoverLetterPage';
import { PublicCVViewer } from './components/PublicCVViewer';
import { Dashboard } from './components/Dashboard'; // Import Dashboard
import { CreditDisplay } from './components/CreditDisplay';
import { buyCredits } from './services/stripeService';
import { supabase } from './lib/supabase';
import { TemplateSelector } from './components/templates/TemplateSelector'; // Import TemplateSelector
import './App.css';

const Layout = ({ children }) => (
  <main className="container" style={{ padding: '2rem 0', flex: 1 }}>
    {children}
  </main>
);

// Main App Component (Authenticated View)
const MainApp = ({ user }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { activeTemplate, setActiveTemplate } = useCV();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Navbar */}
      <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: 0 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          <div
            className="logo"
            style={{ fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setActivePage('dashboard')}
          >
            <span style={{ fontSize: '1.5rem' }}>📄</span> CV Builder
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Navigation Links (Desktop) */}
            <div className="nav-links" style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setActivePage('dashboard')} className={`btn btn-ghost ${activePage === 'dashboard' ? 'active' : ''}`}>Dashboard</button>
              <button onClick={() => setActivePage('editor')} className={`btn btn-ghost ${activePage === 'editor' ? 'active' : ''}`}>Editor</button>
              <button onClick={() => setActivePage('tracker')} className={`btn btn-ghost ${activePage === 'tracker' ? 'active' : ''}`}>Jobs</button>
            </div>

            <div style={{ width: '1px', height: '20px', background: '#ccc' }}></div>

            {/* User Actions */}
            <CreditDisplay userId={user?.id} />
            <button onClick={buyCredits} className="btn btn-sm btn-primary">Buy Credits</button>
            <button onClick={handleLogout} className="btn btn-sm btn-ghost">Log Out</button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <Layout>
        {activePage === 'dashboard' ? (
          <Dashboard onNavigate={setActivePage} />
        ) : activePage === 'editor' ? (
          <div className="cv-builder-grid">
            <div className={`editor-section ${isPreviewOpen ? 'hidden-mobile' : 'visible-mobile'}`}>
              <Editor />
            </div>

            <div className={`preview-section ${isPreviewOpen ? 'visible-mobile' : 'hidden-mobile'}`}>
              <div sticky="true" style={{ position: 'sticky', top: '2rem' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Live Preview</h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <TemplateSelector activeTemplate={activeTemplate} onSelect={setActiveTemplate} />
                    <button className="btn btn-sm btn-outline" onClick={() => setIsPreviewOpen(false)}>
                      Actual Size
                    </button>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', minHeight: '600px', display: 'flex', justifyContent: 'center', background: '#525659' }}>
                  {/* Dark background for preview area like a PDF viewer */}
                  <Preview />
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              className="mobile-preview-toggle"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            >
              {isPreviewOpen ? '✏️ Edit' : '👁️ Preview'}
            </button>
          </div>
        ) : activePage === 'tracker' ? (
          <JobTracker />
        ) : activePage === 'match' ? (
          <div className="glass-panel p-6">
            <JobMatchPage onNavigate={setActivePage} />
          </div>
        ) : activePage === 'cover-letter' ? (
          <CoverLetterPage />
        ) : null}
      </Layout>
    </div>
  );
};


// Main App Component that provides Context and handles routing
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    }).catch(() => {
      console.warn("Auth session check failed (likely due to missing keys). Defaulting to guest.");
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'gray' }}>Loading App...</div>
    </div>
  );

  return (
    <Router>
      <CVProvider>
        <Routes>
          <Route path="/" element={
            user ? <MainApp user={user} /> : (
              showAuth ? (
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                  <nav style={{ padding: '1.5rem 0' }}>
                    <div className="container">
                      <button onClick={() => setShowAuth(false)} className="btn btn-ghost">← Back to Home</button>
                    </div>
                  </nav>
                  <Auth onAuthSuccess={() => window.location.reload()} />
                </div>
              ) : (
                <LandingPage
                  onGetStarted={() => setShowAuth(true)}
                  onLogin={() => setShowAuth(true)}
                />
              )
            )
          } />
          <Route path="/view/:id" element={<PublicCVViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CVProvider>
    </Router>
  );
}

export default App;
