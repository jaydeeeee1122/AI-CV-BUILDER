import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { CVProvider } from './context/CVContext';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Modal } from './components/Modal';
import './App.css';

function App() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <CVProvider>
      <Layout>
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
        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
          <Preview />
        </Modal>
      </Layout>
    </CVProvider>
  );
}

export default App;
