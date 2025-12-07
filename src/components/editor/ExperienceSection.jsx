import React, { useState, useEffect } from 'react';
import { useCV } from '../../context/CVContext';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RichTextEditor } from '../RichTextEditor';
import { PhrasePicker } from '../PhrasePicker';
import { enhanceText } from '../../services/aiService';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Building2, Calendar, Briefcase } from "lucide-react";
import { cn } from "../../lib/utils";

// --- Helper to format "YYYY-MM" to "MM/YYYY" ---
const formatMonthYear = (val) => {
    if (!val) return '';
    const [year, month] = val.split('-');
    return `${month}/${year}`;
};

// --- Helper to parse "MM/YYYY" to "YYYY-MM" for input value ---
const parseMonthYear = (val) => {
    if (!val) return '';
    const parts = val.split('/');
    if (parts.length === 2) {
        return `${parts[1]}-${parts[0]}`;
    }
    return '';
};

// --- Helper to calculate duration ---
const calculateDuration = (start, end, isCurrent) => {
    if (!start) return '';

    // Parse Start
    const [startYear, startMonth] = start.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1);

    // Parse End
    let endDate = new Date();
    if (!isCurrent && end) {
        const [endYear, endMonth] = end.split('-').map(Number);
        endDate = new Date(endYear, endMonth - 1);
    } else if (!isCurrent && !end) {
        return ''; // Incomplete range
    }

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
        years -= 1;
        months += 12;
    }
    // Add 1 month to be inclusive? Convention varies, usually 0-based diff is fine or +1. 
    // Let's stick to simple diff for now, maybe +1 approx. in future if requested.

    // Format
    let result = '';
    if (years > 0) result += `${years} yr${years > 1 ? 's' : ''} `;
    if (months > 0) result += `${months} mo${months > 1 ? 's' : ''}`;

    return result.trim() || '0 mos';
};


// --- Sortable Item with Accordion Logic ---
const SortableExperienceItem = ({ id, experience, isOpen, onToggle, onUpdate, onRemove, onEnhance, isEnhancing }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    // Local state to manage the native date inputs (YYYY-MM format)
    // Synchronized with props (MM/YYYY) on mount/change
    const [startVal, setStartVal] = useState(parseMonthYear(experience.startDate));
    const [endVal, setEndVal] = useState(parseMonthYear(experience.endDate));
    const [isCurrent, setIsCurrent] = useState(experience.endDate?.toLowerCase() === 'present');

    // Sync from props if they change externally (e.g. initial load)
    useEffect(() => {
        setStartVal(parseMonthYear(experience.startDate));
        // Only set endVal if not 'Present'
        if (experience.endDate?.toLowerCase() === 'present') {
            setIsCurrent(true);
            setEndVal('');
        } else {
            setEndVal(parseMonthYear(experience.endDate));
            setIsCurrent(false);
        }
    }, [experience.startDate, experience.endDate]);

    const handleDateChange = (type, val) => {
        if (type === 'start') {
            setStartVal(val);
            onUpdate('startDate', formatMonthYear(val));
        } else {
            setEndVal(val);
            onUpdate('endDate', formatMonthYear(val));
        }
    };

    const handleCurrentChange = (checked) => {
        setIsCurrent(checked);
        if (checked) {
            setEndVal('');
            onUpdate('endDate', 'Present');
        } else {
            // Reset to empty or keep prev? Empty is safer.
            onUpdate('endDate', '');
        }
    };

    const duration = calculateDuration(startVal, endVal, isCurrent);


    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="group mb-4">
            <div className={cn(
                "border rounded-xl bg-card transition-all duration-200 shadow-sm hover:shadow-md",
                isOpen ? "ring-2 ring-primary/5" : ""
            )}>
                {/* Accordion Header / Summary View */}
                <div className="flex items-center p-4 gap-3">
                    {/* Drag Handle */}
                    <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/50 hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors">
                        <GripVertical size={18} />
                    </div>

                    {/* Summary Info (Click to toggle) */}
                    <div className="flex-1 cursor-pointer grid grid-cols-1 md:grid-cols-3 gap-4 items-center" onClick={onToggle}>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-sm truncate">{experience.title || '(No Title)'}</span>
                            <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                {experience.company && <Building2 size={10} />}
                                {experience.company || '(No Company)'}
                            </span>
                        </div>
                        <div className="hidden md:flex items-center text-xs text-muted-foreground">
                            <Calendar size={12} className="mr-2" />
                            {experience.startDate || 'Start'} — {experience.endDate || 'Present'}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                            <Trash2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50" onClick={onToggle}>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                    </div>
                </div>

                {/* Expanded Content Form */}
                {isOpen && (
                    <div className="px-6 pb-6 pt-4 border-t bg-muted/5 animate-in slide-in-from-top-2 duration-200 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase size={14} className="text-primary" /> Job Title
                                </Label>
                                <Input
                                    value={experience.title}
                                    onChange={(e) => onUpdate('title', e.target.value)}
                                    placeholder="e.g. Senior Product Designer"
                                    className="bg-background border-muted-foreground/20 focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Building2 size={14} className="text-primary" /> Company
                                </Label>
                                <Input
                                    value={experience.company}
                                    onChange={(e) => onUpdate('company', e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="bg-background border-muted-foreground/20 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={14} className="text-primary" /> Start Date
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="month"
                                        value={startVal}
                                        onChange={(e) => handleDateChange('start', e.target.value)}
                                        className="bg-background border-muted-foreground/20 focus:border-primary block w-full"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={14} className="text-primary" /> End Date
                                </Label>
                                <div className="space-y-2">
                                    <Input
                                        type="month"
                                        value={endVal}
                                        onChange={(e) => handleDateChange('end', e.target.value)}
                                        disabled={isCurrent}
                                        className="bg-background border-muted-foreground/20 focus:border-primary block w-full disabled:opacity-50"
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`current-exp-${id}`}
                                                checked={isCurrent}
                                                onChange={(e) => handleCurrentChange(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor={`current-exp-${id}`} className="text-xs text-muted-foreground cursor-pointer select-none">
                                                Currently working here
                                            </label>
                                        </div>
                                        {duration && (
                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                {duration}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-end mb-1">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    Key Achievements & Responsibilities
                                </Label>
                                <PhrasePicker onSelect={(phrase) => onUpdate('description', (experience.description || '') + ' ' + phrase)} />
                            </div>

                            <RichTextEditor
                                value={experience.description}
                                onChange={(val) => onUpdate('description', val)}
                                placeholder="• Led a team of..."
                            />

                            <div className="pt-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={onEnhance}
                                    disabled={isEnhancing}
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm transition-all"
                                >
                                    <Sparkles size={14} className="mr-2" />
                                    {isEnhancing ? 'Optimizing with AI...' : '✨ Enhance Description with AI'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ExperienceSection = () => {
    const {
        cvData, addExperience, updateExperience, removeExperience, reorderSection,
        apiKey, userId, aiProvider, aiModel
    } = useCV();

    const [openId, setOpenId] = useState(null); // Track which accordion is open (one at a time or persistent? Let's do single for focus)
    const [enhancingId, setEnhancingId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            reorderSection('experience', active.id, over.id);
        }
    };

    const handleAIEnhance = async (id, text) => {
        if (!text || !apiKey) return;
        setEnhancingId(id);
        try {
            const enhanced = await enhanceText(text, apiKey, { userId, provider: aiProvider, model: aiModel });
            updateExperience(id, 'description', enhanced);
        } catch (error) {
            console.error("Enhancement failed", error);
            alert("AI Enhancement failed. Check console or credit balance.");
        } finally {
            setEnhancingId(null);
        }
    };

    const toggleOpen = (id) => {
        setOpenId(prev => prev === id ? null : id);
    };

    // Auto-open new items? 
    // Effect handling could be added if needed, but for now user manual control is safe.

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>Professional Experience</CardTitle>
                    <p className="text-sm text-muted-foreground">Detailed history of your career path.</p>
                </div>
                <Button size="sm" onClick={() => {
                    addExperience();
                    // Ideally we would setOpenId to the new ID, but ID is generated in context. 
                    // We can rely on user creating it then clicking it.
                }}>
                    <Plus size={16} className="mr-2" /> Add Position
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={cvData.experience.map(exp => exp.id)} strategy={verticalListSortingStrategy}>
                        {cvData.experience.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/20">
                                <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground font-medium">No experience added yet</p>
                                <Button variant="link" onClick={addExperience}>+ Add your first role</Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cvData.experience.map((exp) => (
                                    <SortableExperienceItem
                                        key={exp.id}
                                        id={exp.id}
                                        experience={exp}
                                        isOpen={openId === exp.id}
                                        onToggle={() => toggleOpen(exp.id)}
                                        onUpdate={(field, val) => updateExperience(exp.id, field, val)}
                                        onRemove={() => removeExperience(exp.id)}
                                        onEnhance={() => handleAIEnhance(exp.id, exp.description)}
                                        isEnhancing={enhancingId === exp.id}
                                    />
                                ))}
                            </div>
                        )}
                    </SortableContext>
                </DndContext>
            </CardContent>
        </Card>
    );
};
