import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const RichTextEditor = ({ value, onChange, placeholder }) => {
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    const formats = [
        'bold', 'italic', 'underline',
        'list', 'bullet'
    ];

    return (
        <div className="rich-editor-wrapper">
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                }}
            />
            {/* Custom override styles for the editor */}
            <style>{`
                .ql-container {
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                }
                .ql-toolbar {
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    background: rgba(255,255,255,0.8);
                    border-color: var(--border) !important;
                }
                .ql-container.ql-snow {
                    border-color: var(--border) !important;
                }
            `}</style>
        </div>
    );
};
