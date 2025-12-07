
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CVProvider, useCV } from './context/CVContext';
import Editor from './components/Editor';
import { Preview } from './components/Preview';
import { JobTracker } from './components/JobTracker';
import { JobMatchPage } from './components/JobMatchPage';
import { CoverLetterPage } from './components/CoverLetterPage';
import { PublicCVViewer } from './components/PublicCVViewer';
import { Dashboard } from './components/Dashboard';
import { CreditDisplay } from './components/CreditDisplay';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { buyCredits } from './services/stripeService';
import { supabase } from './lib/supabase';
import { TemplateSelector } from './components/templates/TemplateSelector';
import { SettingsPage } from './components/SettingsPage';

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
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* App Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => setActivePage('dashboard')}
          >
            <span className="text-2xl">📄</span> CV Builder
          </div>

          <div className="flex items-center gap-6">
            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex gap-1">
              {['dashboard', 'editor', 'tracker', 'match', 'settings'].map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activePage === page
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1).replace('match', 'Match')}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-border hidden md:block"></div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <CreditDisplay userId={user?.id} />
              <button
                onClick={buyCredits}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
              >
                Buy Credits
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <Layout>
        {activePage === 'dashboard' ? (
          <Dashboard onNavigate={setActivePage} />
        ) : activePage === 'editor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-6rem)] overflow-hidden">
            <div className={`overflow-y-auto pr-4 ${isPreviewOpen ? 'hidden lg:block' : 'block'}`}>
              <Editor />
            </div>

            <div className={`flex flex-col ${isPreviewOpen ? 'block' : 'hidden lg:flex'}`}>
              <div className="sticky top-0 z-10 bg-background pb-4 border-b mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Live Preview</h2>
                <div className="flex gap-2">
                  <TemplateSelector activeTemplate={activeTemplate} onSelect={setActiveTemplate} />
                  <button className="text-sm border px-3 py-1 rounded hover:bg-accent" onClick={() => setIsPreviewOpen(false)}>
                    Actual Size
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-zinc-700/50 rounded-lg p-8 overflow-hidden flex justify-center backdrop-blur-sm border border-white/10">
                <Preview />
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center text-2xl"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            >
              {isPreviewOpen ? '✏️' : '👁️'}
            </button>
          </div>
        ) : activePage === 'tracker' ? (
          <JobTracker />
        ) : activePage === 'match' ? (
          <div className="max-w-7xl mx-auto">
            <JobMatchPage onNavigate={setActivePage} />
          </div>
        ) : activePage === 'cover-letter' ? (
          <CoverLetterPage />
        ) : activePage === 'settings' ? (
          <SettingsPage />
        ) : null}
      </Layout>
    </div>
  );
};


// ... (MainApp implementation same)

// Main App Component that provides Context and handles routing
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (logic same)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    }).catch(() => {
      console.warn("Auth session check failed.");
      setLoading(false);
    });

    return () => {
      // authListener.subscription.unsubscribe(); // Corrected in replacement content if needed but keeping logic simple first
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <Router>
      <CVProvider>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage onLoginSuccess={() => window.location.href = '/'} /> : <Navigate to="/" replace />} />
          <Route path="/signup" element={!user ? <SignupPage onSignupSuccess={() => window.location.href = '/'} /> : <Navigate to="/" replace />} />

          <Route path="/" element={
            user ? (
              <MainApp user={user} />
            ) : (
              <LandingPage
                onLogin={() => window.location.href = '/login'}
                onGetStarted={() => window.location.href = '/signup'}
              />
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
