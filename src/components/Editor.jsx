
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
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { GripVertical, Sparkles, Plus, Trash2, Printer, Save, Share2 } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ResumeStrength } from "./ResumeStrength";

// --- Sortable Item Component ---
const SortableItem = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4 mb-4 shadow-sm group">
            <div
                {...attributes}
                {...listeners}
                className="flex items-center justify-center py-2 mb-2 bg-muted/50 rounded cursor-grab text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
                <GripVertical size={16} />
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
        saveCV, togglePublish, isSaving, publicUrl, savedId,
        userId, aiProvider, aiModel // Get these from context
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
            // Pass userId and provider settings to the service
            const enhanced = await enhanceText(text, apiKey, {
                userId,
                provider: aiProvider,
                model: aiModel
            });

            if (type === 'experience') {
                updateExperience(id, 'description', enhanced);
            } else if (type === 'summary') {
                updatePersonal('summary', enhanced);
            }
        } catch (error) {
            console.error("Enhancement failed", error);
            if (error.message.includes("402") || error.message.includes("credits")) {
                alert("Insufficient Credits. Please purchase more or wait for the free tier refill.");
            }
        } finally {
            setEnhancingId(null);
        }
    };

    return (
        <div className="pb-20 space-y-6">
            <div className="flex justify-between items-center sticky top-0 md:top-[-1rem] z-10 bg-background/95 backdrop-blur py-4 border-b mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Editor</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()} title="Export as PDF">
                        <Printer size={16} className="mr-2" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveCV} disabled={isSaving}>
                        <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" onClick={() => setIsShareModalOpen(true)}>
                        <Share2 size={16} className="mr-2" /> Share
                    </Button>
                </div>
            </div>

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsShareModalOpen(false)}>
                    <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle>Share Your CV</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">Publish your CV to get a shareable link.</p>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={publicUrl ? `${window.location.origin}/view/${savedId}` : 'Not published yet'}
                                />
                                <Button onClick={togglePublish}>
                                    {publicUrl ? 'Unpublish' : 'Publish'}
                                </Button>
                            </div>
                            <Button variant="ghost" className="w-full" onClick={() => setIsShareModalOpen(false)}>Close</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            <ResumeStrength />

            <Card>
                <CardHeader>
                    <CardTitle>Personal & Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <ThemeSelector />
                        <FontSelector />
                    </div>

                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                            value={personal.fullName}
                            onChange={(e) => updatePersonal('fullName', e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            value={personal.email}
                            onChange={(e) => updatePersonal('email', e.target.value)}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Summary</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={personal.summary}
                            onChange={(e) => updatePersonal('summary', e.target.value)}
                            placeholder="Experienced professional..."
                            rows={4}
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAIEnhance('summary', personal.summary, 'summary')}
                            disabled={enhancingId === 'summary'}
                            className="w-full"
                        >
                            <Sparkles size={14} className="mr-2" />
                            {enhancingId === 'summary' ? 'Enhancing...' : 'Enhance with AI'}
                        </Button>
                    </div>
                    <PhotoUpload />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Experience</CardTitle>
                    <Button size="sm" variant="ghost" onClick={addExperience}><Plus size={16} /></Button>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'experience')}>
                        <SortableContext items={experience.map(exp => exp.id)} strategy={verticalListSortingStrategy}>
                            {experience.map((exp) => (
                                <SortableItem key={exp.id} id={exp.id}>
                                    <div className="space-y-3">
                                        <Input
                                            value={exp.title}
                                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                            placeholder="Job Title"
                                            className="font-bold"
                                        />
                                        <Input
                                            value={exp.company}
                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                            placeholder="Company"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                value={exp.startDate}
                                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                placeholder="Start Date"
                                            />
                                            <Input
                                                value={exp.endDate}
                                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                placeholder="End Date"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Description & Achievements</Label>
                                            <RichTextEditor
                                                value={exp.description}
                                                onChange={(val) => updateExperience(exp.id, 'description', val)}
                                            />
                                            <PhrasePicker onSelect={(phrase) => updateExperience(exp.id, 'description', (exp.description || '') + ' ' + phrase)} />

                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleAIEnhance(exp.id, exp.description, 'experience')}
                                                disabled={enhancingId === exp.id}
                                                className="w-full"
                                            >
                                                <Sparkles size={14} className="mr-2" />
                                                {enhancingId === exp.id ? 'Enhancing...' : 'Enhance with AI'}
                                            </Button>
                                        </div>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </DndContext>

                    <Button variant="outline" className="w-full mt-4" onClick={addExperience}>
                        <Plus size={16} className="mr-2" /> Add Experience
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Education</CardTitle>
                    <Button size="sm" variant="ghost" onClick={addEducation}><Plus size={16} /></Button>
                </CardHeader>
                <CardContent>
                    {education.map((edu) => (
                        <div key={edu.id} className="mb-6 pb-6 border-b last:border-0 last:pb-0 last:mb-0 space-y-3">
                            <Input
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                placeholder="University / School"
                                className="font-bold"
                            />
                            <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                placeholder="Degree"
                            />
                            <Input
                                value={edu.year}
                                onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                placeholder="Graduation Year"
                            />
                        </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4" onClick={addEducation}>
                        <Plus size={16} className="mr-2" /> Add Education
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Editor;
