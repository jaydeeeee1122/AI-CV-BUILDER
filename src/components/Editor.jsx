import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { enhanceText } from '../services/aiService';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PhrasePicker } from './PhrasePicker';
import { PhotoUpload } from './PhotoUpload';
import { RichTextEditor } from './RichTextEditor';
import { ThemeSelector } from './ThemeSelector';
import { FontSelector } from './FontSelector';

// --- Sortable Item Component ---
const SortableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: '1rem',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        padding: '1rem'
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                {...attributes}
                {...listeners}
                style={{
                    cursor: 'grab',
                    marginBottom: '0.5rem',
                    padding: '0.25rem',
                    background: '#f8fafc',
                    borderRadius: '0.25rem',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.8rem'
                }}
            >
                ⋮⋮ Drag to Reorder
            </div>
            {children}
        </div>
    );
};

// --- Main Editor Component ---
const Editor = () => {
    const {
        cvData, updatePersonal, addExperience, updateExperience,
        addEducation, updateEducation, apiKey, setApiKey, reorderSection,
        saveCV, togglePublish, isSaving, publicUrl, savedId
    } = useCV();

    const { personal, experience, education, skills } = cvData;
    const [enhancingId, setEnhancingId] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Draggable Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event, section) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            reorderSection(section, active.id, over.id);
        }
    };

    const handleAIEnhance = async (id, text, type) => {
        if (!text || !apiKey) return;
        setEnhancingId(id);
        try {
            const enhanced = await enhanceText(text, apiKey);
            if (type === 'experience') {
                updateExperience(id, 'description', enhanced);
            }
        } catch (error) {
            console.error("Enhancement failed", error);
        } finally {
            setEnhancingId(null);
        }
    };

    return (
        <div className="editor-pane">
            <div className="editor-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Editor</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => window.print()} className="btn btn-outline" title="Export as PDF">
                        🖨️ PDF
                    </button>
                    <button onClick={saveCV} className="btn btn-outline" disabled={isSaving}>
                        {isSaving ? 'Saving...' : '💾 Save'}
                    </button>
                    <button onClick={() => setIsShareModalOpen(true)} className="btn btn-primary">
                        🚀 Share
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="modal-overlay" onClick={() => setIsShareModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Share Your CV</h3>
                        <p>Publish your CV to get a shareable link.</p>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '1rem 0' }}>
                            <input
                                type="text"
                                readOnly
                                value={publicUrl ? `${window.location.origin}/view/${savedId}` : 'Not published yet'}
                                style={{ flex: 1 }}
                            />
                            <button onClick={togglePublish} className="btn btn-primary">
                                {publicUrl ? 'Unpublish' : 'Publish Now'}
                            </button>
                        </div>
                        <button onClick={() => setIsShareModalOpen(false)} style={{ width: '100%' }} className="btn btn-ghost">Close</button>
                    </div>
                </div>
            )}

            <div className="form-section glass-panel p-6 mb-6">
                <h3>Personal & Theme</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <ThemeSelector />
                    <FontSelector />
                </div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        value={personal.fullName}
                        onChange={(e) => updatePersonal('fullName', e.target.value)}
                        placeholder="John Doe"
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        value={personal.email}
                        onChange={(e) => updatePersonal('email', e.target.value)}
                        placeholder="john@example.com"
                    />
                </div>
                <div className="form-group">
                    <label>Summary</label>
                    <textarea
                        value={personal.summary}
                        onChange={(e) => updatePersonal('summary', e.target.value)}
                        placeholder="Experienced professional..."
                        rows={4}
                    />
                </div>
                <PhotoUpload />
            </div>

            <div className="form-section glass-panel p-6 mb-6">
                <h3>Experience</h3>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'experience')}>
                    <SortableContext items={experience.map(exp => exp.id)} strategy={verticalListSortingStrategy}>
                        {experience.map((exp) => (
                            <SortableItem key={exp.id} id={exp.id}>
                                <div className="experience-item-editor">
                                    <input
                                        value={exp.title}
                                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                        placeholder="Job Title"
                                        style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}
                                    />
                                    <input
                                        value={exp.company}
                                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                        placeholder="Company"
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <input
                                            value={exp.startDate}
                                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                            placeholder="Start Date"
                                        />
                                        <input
                                            value={exp.endDate}
                                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                            placeholder="End Date"
                                        />
                                    </div>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Description & Achievements</label>
                                        <RichTextEditor
                                            value={exp.description}
                                            onChange={(val) => updateExperience(exp.id, 'description', val)}
                                        />
                                        <PhrasePicker onSelect={(phrase) => updateExperience(exp.id, 'description', (exp.description || '') + ' ' + phrase)} />

                                        <button
                                            onClick={() => handleAIEnhance(exp.id, exp.description, 'experience')}
                                            className="btn-ai-enhance"
                                            style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.8rem' }}
                                            disabled={enhancingId === exp.id}
                                        >
                                            {enhancingId === exp.id ? '✨ Enhancing...' : '✨ Enhance with AI'}
                                        </button>
                                    </div>
                                </div>
                            </SortableItem>
                        ))}
                    </SortableContext>
                </DndContext>

                <button onClick={addExperience} className="btn-add">+ Add Experience</button>
            </div>

            <div className="form-section glass-panel p-6">
                <h3>Education</h3>
                {education.map((edu) => (
                    <div key={edu.id} className="education-item-editor" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <input
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                            placeholder="University / School"
                            style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}
                        />
                        <input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Degree"
                            style={{ marginBottom: '0.5rem' }}
                        />
                        <input
                            value={edu.year}
                            onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                            placeholder="Graduation Year"
                        />
                    </div>
                ))}
                <button onClick={addEducation} className="btn-add">+ Add Education</button>
            </div>
        </div>
    );
};

export default Editor;
