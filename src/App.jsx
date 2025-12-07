
import React, { useState, useEffect, useRef } from 'react';
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

const Layout = ({ children, className = "" }) => (
  <main className={`container flex-1 flex flex-col min-h-0 ${className}`} style={{ paddingBottom: '2rem' }}>
    {children}
  </main>
);

// Main App Component (Authenticated View)
const MainApp = ({ user }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef();
  const { activeTemplate, setActiveTemplate } = useCV();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="h-screen flex flex-col bg-background font-sans overflow-hidden">
      {/* App Navbar */}
      <nav className="flex-none w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
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
      {/* We use flex-1 min-h-0 to ensure children can scroll internally */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-6">
        {activePage === 'dashboard' ? (
          <div className="flex-1 overflow-y-auto min-h-0 container">
            <Dashboard onNavigate={setActivePage} />
          </div>
        ) : activePage === 'editor' ? (
          <Layout className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
              {/* Editor Pane - Scrollable */}
              <div className="order-2 lg:order-1 h-full flex flex-col min-h-0 bg-background/50 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-32">
                  <Editor previewRef={previewRef} />
                </div>
              </div>

              {/* Preview Pane - Sticky/Fixed */}
              <div className={`order-1 lg:order-2 flex flex-col h-full min-h-0 ${isPreviewOpen ? 'fixed inset-0 z-50 bg-background p-4' : 'hidden lg:flex'}`} id="preview-section">
                <div className="flex-none bg-background/95 backdrop-blur z-10 pb-4 border-b mb-4 flex justify-between items-center" id="preview-header">
                  <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
                    <span className="text-primary">👁️</span> Live Preview
                  </h2>
                  <div className="flex gap-2">
                    <TemplateSelector activeTemplate={activeTemplate} onSelect={setActiveTemplate} />
                    <button
                      className="text-sm border px-3 py-1 rounded-md hover:bg-accent hidden lg:block"
                      onClick={() => {
                        const dialog = document.createElement('dialog');
                        dialog.className = 'fixed inset-0 z-[100] w-full h-full bg-background/95 backdrop-blur p-8 overflow-y-auto flex justify-center items-start';
                        dialog.id = 'full-preview-dialog';

                        // Create container
                        const container = document.createElement('div');
                        container.className = 'relative w-full max-w-4xl bg-white shadow-2xl rounded-lg min-h-screen my-8';

                        // Close button
                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'fixed top-4 right-4 z-[101] bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:bg-primary/90';
                        closeBtn.innerText = 'Close Preview';
                        closeBtn.onclick = () => {
                          document.body.removeChild(dialog);
                        };

                        // Cloning content (simple approach for now)
                        // A better way would be using a Portal, but DOM cloning works for static preview
                        const content = document.querySelector('.print-content').cloneNode(true);
                        content.style.transform = 'scale(1)';
                        content.style.margin = '0 auto';

                        container.appendChild(content);
                        dialog.appendChild(closeBtn);
                        dialog.appendChild(container);
                        document.body.appendChild(dialog);
                        dialog.showModal();
                      }}
                    >
                      Maximize
                    </button>
                    <button className="text-sm border px-3 py-1 rounded-md hover:bg-accent lg:hidden" onClick={() => setIsPreviewOpen(false)}>
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-muted/30 rounded-xl p-8 overflow-y-auto flex justify-center border shadow-inner custom-scrollbar relative">
                  {/* Print Container Wrapper */}
                  <div ref={previewRef} className="print-content">
                    <Preview />
                  </div>
                </div>
              </div>

              {/* Mobile Toggle */}
              <button
                className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center text-2xl print:hidden hover:scale-105 transition-transform"
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              >
                {isPreviewOpen ? '✏️' : '👁️'}
              </button>
            </div>
          </Layout>
        ) : activePage === 'tracker' ? (
          <Layout>
            <JobTracker />
          </Layout>
        ) : activePage === 'match' ? (
          <Layout>
            <div className="max-w-7xl mx-auto">
              <JobMatchPage onNavigate={setActivePage} />
            </div>
          </Layout>
        ) : activePage === 'cover-letter' ? (
          <Layout>
            <CoverLetterPage />
          </Layout>
        ) : activePage === 'settings' ? (
          <Layout>
            <SettingsPage />
          </Layout>
        ) : null}
      </div>
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
