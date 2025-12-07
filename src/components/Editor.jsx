
import React, { useState } from 'react';
import { useCV } from '../context/CVContext';
import { enhanceText } from '../services/aiService';
import { useReactToPrint } from 'react-to-print';
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ExperienceSection } from './editor/ExperienceSection';
import { EducationSection } from './editor/EducationSection';

// --- Main Editor Component ---
const Editor = ({ previewRef }) => {
    const {
        cvData, updatePersonal, addExperience, updateExperience, removeExperience,
        addEducation, updateEducation, removeEducation, updateSkills, apiKey, setApiKey, reorderSection,
        saveCV, togglePublish, isSaving, publicUrl, savedId,
        userId, aiProvider, aiModel
    } = useCV();

    const { personal, experience, education, skills } = cvData;
    const [enhancingId, setEnhancingId] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const handlePrint = useReactToPrint({
        contentRef: previewRef,
        documentTitle: `CV_${personal.fullName?.replace(/\s+/g, '_') || 'Resume'}`,
    });

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

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            const currentSkills = Array.isArray(skills) ? skills : [];
            updateSkills([...currentSkills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (index) => {
        const currentSkills = Array.isArray(skills) ? skills : [];
        updateSkills(currentSkills.filter((_, i) => i !== index));
    };

    return (
        <div className="pb-20 space-y-4">
            {/* Header / Actions */}
            <div className="flex justify-between items-center sticky top-0 md:top-[-1rem] z-10 bg-background/95 backdrop-blur py-4 border-b mb-4">
                <h2 className="text-2xl font-bold tracking-tight font-heading">Editor</h2>
                <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={handlePrint} title="Export as PDF" className="bg-primary hover:bg-primary/90">
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

            <ResumeStrength />

            {/* Main Tabs Interface */}
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="personal">Profile</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                {/* Personal & Design Content */}
                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
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
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={personal.summary}
                                    onChange={(e) => updatePersonal('summary', e.target.value)}
                                    placeholder="Experienced professional with a track record of..."
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Media Content */}
                <TabsContent value="media">
                    <Card>
                        <CardHeader>
                            <CardTitle>Photo & Media</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Upload a professional photo for your CV.</p>
                            <PhotoUpload />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Experience Content */}
                {/* Experience Content */}
                <TabsContent value="experience">
                    <ExperienceSection />
                </TabsContent>

                {/* Education Content */}
                <TabsContent value="education">
                    <EducationSection />
                </TabsContent>

                {/* Skills Content */}
                <TabsContent value="skills">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-2">
                                <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add a skill (e.g. React, Project Management)"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                />
                                <Button onClick={handleAddSkill}>Add</Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(skills) && skills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm group animate-in fade-in zoom-in-95">
                                        <span>{skill}</span>
                                        <button
                                            onClick={() => handleRemoveSkill(index)}
                                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {(!skills || skills.length === 0) && (
                                    <p className="text-muted-foreground text-sm italic">No skills added yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Share Modal */}
            {
                isShareModalOpen && (
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
                )
            }
        </div >
    );
};

export default Editor;
