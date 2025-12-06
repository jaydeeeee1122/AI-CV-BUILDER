import React from 'react';
import { useCV } from '../context/CVContext';
import { ModernTemplate } from './templates/ModernTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import './Preview.css';

export const Preview = () => {
    const { cvData, activeTemplate } = useCV();

    return (
        <div className="preview-container">
            {activeTemplate === 'modern' ? (
                <ModernTemplate data={cvData} />
            ) : (
                <MinimalistTemplate data={cvData} />
            )}
        </div>
    );
};
