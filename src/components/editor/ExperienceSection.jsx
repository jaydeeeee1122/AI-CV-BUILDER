import React, { useState } from 'react';
import { useCV } from '../../context/CVContext';
import { enhanceText } from '../../services/aiService';

export const ExperienceSection = () => {
    const { cvData, addExperience, updateExperience, removeExperience, apiKey } = useCV();
    const [enhancingId, setEnhancingId] = useState(null);

    const handleEnhance = async (id, currentText) => {
        setEnhancingId(id);
        try {
            const enhanced = await enhanceText(currentText, apiKey);
            updateExperience(id, 'description', enhanced);
        } catch (error) {
            console.error("AI Enhance failed", error);
        } finally {
            setEnhancingId(null);
        }
    };

    return (
        <section className="editor-section-group">
            <div className="section-header">
                <h3>Experience</h3>
                <button onClick={addExperience} className="btn btn-primary btn-sm">
                    + Add
                </button>
            </div>

            {cvData.experience.map((exp) => (
                <div key={exp.id} className="experience-item card">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Job Title</label>
                            <input
                                type="text"
                                value={exp.title}
                                onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Company</label>
                            <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="text"
                                placeholder="DD-MM-YYYY"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="text"
                                placeholder="Present or DD-MM-YYYY"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ marginBottom: 0 }}>Description</label>
                            <button
                                onClick={() => handleEnhance(exp.id, exp.description)}
                                disabled={enhancingId === exp.id}
                                className="btn btn-sm btn-outline"
                                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            >
                                {enhancingId === exp.id ? 'Enhancing...' : '✨ AI Enhance'}
                            </button>
                        </div>
                        <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            className="form-textarea"
                            rows="3"
                        />
                    </div>
                    <button
                        onClick={() => removeExperience(exp.id)}
                        className="btn btn-outline btn-sm btn-danger"
                    >
                        Remove
                    </button>
                </div>
            ))}
        </section>
    );
};
