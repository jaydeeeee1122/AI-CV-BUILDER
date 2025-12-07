import React from 'react';
import { useCV } from '../context/CVContext';
import { ModernTemplate } from './templates/ModernTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import './Preview.css';

export const Preview = () => {
    const { cvData, activeTemplate } = useCV();

    return (
        <div className="preview-container">
            {activeTemplate === 'modern' ? (
                <ModernTemplate data={cvData} />
            ) : activeTemplate === 'minimalist' ? (
                <MinimalistTemplate data={cvData} />
            ) : (
                <CreativeTemplate data={cvData} />
            )}
        </div>
    );
};
