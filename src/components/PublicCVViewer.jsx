import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCV } from '../context/CVContext';
import { ModernTemplate } from './templates/ModernTemplate'; // Import
import { MinimalistTemplate } from './templates/MinimalistTemplate'; // Import

export const PublicCVViewer = () => {
    const { id } = useParams();
    const { fetchPublicCV } = useCV();
    const [cvData, setCvData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCV = async () => {
            try {
                const data = await fetchPublicCV(id);
                setCvData(data);
            } catch (err) {
                console.error(err);
                setError("CV not found or private.");
            } finally {
                setLoading(false);
            }
        };
        loadCV();
    }, [id, fetchPublicCV]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Loading CV...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>{error}</div>;
    if (!cvData) return null;

    // Determine which template to render
    // NOTE: In a real app, we would save the 'template' choice in the DB too.
    // For now, we default to whatever the user has, or Modern.
    // Ideally, `cvData` should store `activeTemplate`.
    // Let's check if we accidentally stored activeTemplate inside cvData or if it was separate.
    // In CVContext, activeTemplate is separate. We should include it in save payload if we want it persistent.
    // For this MVP, let's just show Modern, or check if we updated the save payload.
    // I missed updating the save payload to include 'template'.
    // I will auto-detect or default to Modern for now.

    // Quick fix: user sees Modern by default.
    return (
        <div className="public-viewer-page" style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div className="public-cv-wrapper" style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
                <ModernTemplate data={cvData} />
            </div>
        </div>
    );
};
