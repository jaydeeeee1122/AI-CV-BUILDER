import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { CVProvider } from './context/CVContext';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Modal } from './components/Modal';
import { JobMatchPage } from './components/JobMatchPage';
import './App.css';

function App() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activePage, setActivePage] = useState('builder'); // 'builder' | 'job-match'

  return (
    <CVProvider>
      <Layout>
        {/* Navigation Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          marginBottom: '2rem'
        }}>
          <button
            className={`btn ${activePage === 'builder' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActivePage('builder')}
          >
            📝 CV Builder
          </button>
          <button
            className={`btn ${activePage === 'job-match' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActivePage('job-match')}
          >
            🎯 Job Match & Analysis
          </button>
        </div>

        {activePage === 'builder' ? (
          <div className="cv-builder-grid">
            <div className="editor-section">
              <h2>Editor</h2>
              <Editor />
            </div>
            <div className="preview-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Preview</h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  Full Screen
                </button>
              </div>
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%' }}>
                <Preview />
              </div>
            </div>
          </div>
        ) : (
          <JobMatchPage onNavigate={setActivePage} />
        )}

        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
          <Preview />
        </Modal>
      </Layout>
    </CVProvider>
  );
}

export default App;
