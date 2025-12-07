import React, { useEffect } from 'react';
import { useCV } from '../context/CVContext';
import { ClassicLayout } from './templates/layouts/ClassicLayout';
import { SidebarLayout } from './templates/layouts/SidebarLayout';
import { GridLayout } from './templates/layouts/GridLayout';
import './Preview.css';

export const Preview = React.forwardRef((props, ref) => {
    const { cvData, activeTemplateObject, activeSection } = useCV();

    // Scroll Sync Effect
    useEffect(() => {
        if (activeSection) {
            // We search inside the preview-container for the ID
            const element = document.getElementById(activeSection);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [activeSection]);

    // Default Fallback if DB hasn't loaded (e.g. initial render)
    // We can show a skeleton or just the Classic Layout with defaults
    if (!activeTemplateObject) {
        return (
            <div className="preview-container flex items-center justify-center h-full text-gray-400">
                <div className="animate-pulse">Loading Template...</div>
            </div>
        );
    }

    const { component_map_id, default_config } = activeTemplateObject;

    // MERGE LOGIC: User > Template Default > System Fallback
    const mergedConfig = {
        ...default_config,
        primaryColor: cvData.personal?.themeColor || default_config?.primaryColor || '#000000',
        // FIX: Use 'themeFont' (from FontSelector) instead of 'font'
        font: cvData.personal?.themeFont || default_config?.font || 'Inter',
        fontSize: cvData.personal?.themeFontSize || '10pt',
    };

    const renderLayout = () => {
        // We pass 'data' (content) and 'mergedConfig' (style) to every layout
        switch (component_map_id) {
            case 'sidebar':
                return <SidebarLayout data={cvData} config={mergedConfig} />;
            case 'grid':
                return <GridLayout data={cvData} config={mergedConfig} />;
            case 'classic':
            default:
                return <ClassicLayout data={cvData} config={mergedConfig} />;
        }
    };

    // Helper to extract purely the font family name for Google Fonts URL
    // e.g. "'Playfair Display', serif" -> "Playfair Display"
    const getGoogleFontName = (fontString) => {
        if (!fontString) return 'Inter';
        // Remove quotes and take the first part before comma
        const family = fontString.split(',')[0].replace(/['"]/g, '').trim();
        return family;
    };

    return (
        <div ref={ref} className="preview-container bg-white shadow-2xl rounded-sm min-h-[1100px] w-full max-w-[800px] mx-auto overflow-hidden text-black print-content">
            <style>{`
                /* Global Font Injection for Preview */
                @import url('https://fonts.googleapis.com/css2?family=${getGoogleFontName(mergedConfig.font).replace(/\s+/g, '+')}:wght@400;700&display=swap');

                .preview-container {
                    font-family: ${mergedConfig.font};
                    font-size: ${mergedConfig.fontSize};
                    line-height: 1.5;
                }

                /* SCALING OVERRIDES: Convert Tailwind REM to EM so they scale with font-size */
                .preview-container .text-xs { font-size: 0.75em; }
                .preview-container .text-sm { font-size: 0.875em; }
                .preview-container .text-base { font-size: 1em; }
                .preview-container .text-lg { font-size: 1.125em; }
                .preview-container .text-xl { font-size: 1.25em; }
                .preview-container .text-2xl { font-size: 1.5em; }
                .preview-container .text-3xl { font-size: 1.875em; }
                .preview-container .text-4xl { font-size: 2.25em; }
            `}</style>
            {renderLayout()}
        </div>
    );
});

Preview.displayName = 'Preview';
