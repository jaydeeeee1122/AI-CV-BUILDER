import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { CVProvider } from './context/CVContext';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Modal } from './components/Modal';
import { JobMatchPage } from './components/JobMatchPage';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import './App.css';

function App() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePage, setActivePage] = useState('builder'); // 'builder' | 'job-match' | 'auth'
  const [session, setSession] = useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && activePage === 'auth') {
        setActivePage('builder');
      }
    });

    return () => subscription.unsubscribe();
  }, [activePage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setActivePage('auth');
  };

  return (
    <CVProvider>
      <Layout>
        {/* Navigation Bar */}
        <nav className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          marginBottom: '2rem',
          position: 'sticky',
          top: '1rem',
          zIndex: 10
        }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(to right, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI CV Builder
          </h1>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className={`btn ${activePage === 'builder' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActivePage('builder')}
            >
              📝 Builder
            </button>
            <button
              className={`btn ${activePage === 'job-match' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                if (!session) {
                  setActivePage('auth');
                } else {
                  setActivePage('job-match');
                }
              }}
            >
              🎯 Job Match
            </button>

            {!session ? (
              <button
                className={`btn ${activePage === 'auth' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActivePage('auth')}
              >
                🔐 Login
              </button>
            ) : (
              <button
                className="btn btn-ghost"
                onClick={handleLogout}
                style={{ color: '#ef4444' }}
              >
                Logout
              </button>
            )}
          </div>
        </nav>

        {activePage === 'auth' ? (
          <div style={{ minHeight: '60vh' }}>
            <Auth onAuthSuccess={() => setActivePage('builder')} />
          </div>
        ) : activePage === 'builder' ? (
          <div className="cv-builder-grid">
            <div className="editor-section glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <h2>Editor</h2>
                <p style={{ fontSize: '0.875rem' }}>Refine your professional details below.</p>
              </div>
              <Editor />
            </div>

            <div className="preview-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Live Preview</h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  Full Screen
                </button>
              </div>
              <div style={{
                transform: 'scale(0.85)',
                transformOrigin: 'top center',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden'
              }}>
                <Preview />
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <JobMatchPage onNavigate={setActivePage} />
          </div>
        )}

        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
          <Preview />
        </Modal>
      </Layout>
    </CVProvider>
  );
}

export default App;
