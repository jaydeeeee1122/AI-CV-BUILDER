import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { enhanceText } from '../../services/aiService';

export const PersonalSection = () => {
    const { cvData, updatePersonal, apiKey } = useCV();
    const { fullName, email, phone, summary } = cvData.personal;
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [keywords, setKeywords] = useState('');

    const handleEnhance = async () => {
        setIsEnhancing(true);
        try {
            // Pass keywords as the second argument (context/instructions)
            const enhanced = await enhanceText(summary, apiKey, keywords);
            updatePersonal('summary', enhanced);
        } catch (error) {
            console.error("AI Enhance failed", error);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <section className="editor-section-group">
            <h3>Personal Information</h3>
            <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => updatePersonal('fullName', e.target.value)}
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => updatePersonal('email', e.target.value)}
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label>Phone</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => updatePersonal('phone', e.target.value)}
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label>Keywords / Key Skills (for AI Generation)</label>
                <input
                    type="text"
                    placeholder="e.g. Project Management, React, Leadership, Sales"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="form-input"
                    style={{ marginBottom: '1rem' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ marginBottom: 0 }}>Summary</label>
                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="btn btn-sm btn-outline"
                        style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    >
                        {isEnhancing ? 'Enhancing...' : '✨ AI Enhance'}
                    </button>
                </div>
                <textarea
                    value={summary}
                    onChange={(e) => updatePersonal('summary', e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="Write a draft or leave empty and use keywords above to generate a summary."
                />
            </div>
        </section>
    );
};
