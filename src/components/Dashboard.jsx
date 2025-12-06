import React, { useEffect, useState } from 'react';
import { useCV } from '../context/CVContext';
import { supabase } from '../lib/supabase';
import { CreditDisplay } from './CreditDisplay';

export const Dashboard = ({ onNavigate }) => {
    const { fetchUserCVs, loadCV, createNewCV, deleteCV, cvData } = useCV();
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                try {
                    const data = await fetchUserCVs(user.id);
                    setCvs(data || []);
                } catch (error) {
                    console.error("Error loading CVs:", error);
                }
            }
            setLoading(false);
        };
        init();
    }, [fetchUserCVs]);

    const handleEdit = async (id) => {
        await loadCV(id);
        onNavigate('editor');
    };

    const handleCreateNew = () => {
        createNewCV();
        onNavigate('editor');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this CV?")) {
            await deleteCV(id);
            setCvs(prev => prev.filter(c => c.id !== id));
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container container fade-in" style={{ padding: '2rem 0' }}>
            <h1 className="mb-8">Welcome Back</h1>

            <div className="cv-builder-grid">
                {/* Section 1: Quick Actions */}
                <div className="glass-panel p-6">
                    <h2 className="mb-4">Quick Actions</h2>
                    <div className="flex gap-4 flex-wrap" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handleCreateNew} className="btn btn-primary">
                            + New Resume
                        </button>
                        <button onClick={() => onNavigate('match')} className="btn btn-outline">
                            🎯 Job Match
                        </button>
                        <button onClick={() => onNavigate('cover-letter')} className="btn btn-outline">
                            ✉️ Cover Letter
                        </button>
                        <button onClick={() => onNavigate('tracker')} className="btn btn-outline">
                            📋 Job Tracker
                        </button>
                    </div>
                </div>

                {/* Section 2: My CVs */}
                <div className="glass-panel p-6" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>My Resumes</h2>
                        <span className="text-muted">{cvs.length} Documents</span>
                    </div>

                    {cvs.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-slate-300 rounded-lg">
                            <p>You haven't saved any resumes yet.</p>
                            <button onClick={handleCreateNew} className="btn btn-primary mt-4">Create Your First CV</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {cvs.map((cv) => (
                                <div key={cv.id} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '200px'
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                            {cv.content.personal?.fullName || 'Untitled User'}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            {cv.content.personal?.summary?.substring(0, 60)}...
                                        </p>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.5 }}>
                                            Last Updated: {new Date(cv.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button onClick={() => handleEdit(cv.id)} className="btn btn-sm btn-primary" style={{ flex: 1 }}>
                                            Edit
                                        </button>
                                        {cv.is_public && (
                                            <a href={`/view/${cv.id}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                👁️
                                            </a>
                                        )}
                                        <button onClick={() => handleDelete(cv.id)} className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }}>
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
