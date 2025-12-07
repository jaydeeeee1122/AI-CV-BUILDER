import React, { useState, useEffect } from 'react';
import { useCV } from '../../context/CVContext';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp, GraduationCap, School, Calendar } from "lucide-react";
import { cn } from "../../lib/utils";

// --- Sortable Item with Accordion Logic ---
const SortableEducationItem = ({ id, education, isOpen, onToggle, onUpdate, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Parse existing year string if start/end not explicitly set
    // Expected format: "YYYY - YYYY" or "YYYY - Present"
    const getInitialYears = () => {
        if (education.startYear && education.endYear) return { start: education.startYear, end: education.endYear, current: education.isCurrent };

        if (education.year) {
            const parts = education.year.split(' - ');
            if (parts.length === 2) {
                const s = parts[0].trim();
                const e = parts[1].trim();
                return {
                    start: s.match(/^\d{4}$/) ? s : '',
                    end: e.match(/^\d{4}$/) ? e : '',
                    current: e.toLowerCase() === 'present'
                };
            }
        }
        return { start: '', end: '', current: false };
    };

    const initial = getInitialYears();

    // Local state for the inputs to ensure smooth interaction before syncing
    const [startYear, setStartYear] = useState(initial.start);
    const [endYear, setEndYear] = useState(initial.end);
    const [isCurrent, setIsCurrent] = useState(initial.current);

    // Sync effect: Update the main 'year' string whenever specific fields change
    useEffect(() => {
        if (startYear || endYear || isCurrent) {
            let yearString = '';
            if (startYear) {
                yearString = `${startYear}`;
                if (isCurrent) {
                    yearString += ` - Present`;
                } else if (endYear) {
                    yearString += ` - ${endYear}`;
                }

                // Only update if changed to avoid infinite loops if parent updates cause re-render
                if (education.year !== yearString) {
                    onUpdate('year', yearString);
                    onUpdate('startYear', startYear);
                    onUpdate('endYear', endYear);
                    onUpdate('isCurrent', isCurrent);
                }
            }
        }
    }, [startYear, endYear, isCurrent]);

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear + 5; i >= 1970; i--) {
        years.push(i.toString());
    }

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
                            <span className="font-semibold text-foreground text-sm truncate">{education.school || '(No School)'}</span>
                            <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                {education.degree && <GraduationCap size={10} />}
                                {education.degree || '(No Degree)'}
                            </span>
                        </div>
                        <div className="hidden md:flex items-center text-xs text-muted-foreground">
                            <Calendar size={12} className="mr-2" />
                            {education.year || 'Year'}
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
                    <div className="px-6 pb-6 pt-4 border-t bg-muted/5 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <School size={14} className="text-primary" /> School / University
                                </Label>
                                <Input
                                    value={education.school}
                                    onChange={(e) => onUpdate('school', e.target.value)}
                                    placeholder="e.g. Stanford University"
                                    className="bg-background border-muted-foreground/20 focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground">
                                        <GraduationCap size={14} className="text-primary" /> Degree
                                    </Label>
                                    <Input
                                        value={education.degree}
                                        onChange={(e) => onUpdate('degree', e.target.value)}
                                        placeholder="e.g. Bachelor of Science in CS"
                                        className="bg-background border-muted-foreground/20 focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar size={14} className="text-primary" /> Duration
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                value={startYear}
                                                onChange={(e) => setStartYear(e.target.value)}
                                            >
                                                <option value="">Start Year</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                                                value={endYear}
                                                onChange={(e) => setEndYear(e.target.value)}
                                                disabled={isCurrent}
                                            >
                                                <option value="">End Year</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id={`current-${id}`}
                                            checked={isCurrent}
                                            onChange={(e) => setIsCurrent(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`current-${id}`} className="text-sm text-muted-foreground cursor-pointer select-none">
                                            I am currently studying here
                                        </label>
                                    </div>
                                    {/* Duration Calculation Display */}
                                    {startYear && (endYear || isCurrent) && (
                                        <p className="text-xs text-primary/80 mt-1 font-medium">
                                            Duration: {
                                                isCurrent
                                                    ? `${currentYear - parseInt(startYear)} years (Present)`
                                                    : parseInt(endYear) > parseInt(startYear)
                                                        ? `${parseInt(endYear) - parseInt(startYear)} years`
                                                        : ''
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const EducationSection = () => {
    const { cvData, addEducation, updateEducation, removeEducation, reorderSection } = useCV();
    const [openId, setOpenId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            reorderSection('education', active.id, over.id);
        }
    };

    const toggleOpen = (id) => {
        setOpenId(prev => prev === id ? null : id);
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>Education</CardTitle>
                    <p className="text-sm text-muted-foreground">Your academic background and qualifications.</p>
                </div>
                <Button size="sm" onClick={addEducation}>
                    <Plus size={16} className="mr-2" /> Add Education
                </Button>
            </CardHeader>
            <CardContent className="px-0">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={cvData.education.map(edu => edu.id)} strategy={verticalListSortingStrategy}>
                        {cvData.education.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/20">
                                <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-muted-foreground font-medium">No education added yet</p>
                                <Button variant="link" onClick={addEducation}>+ Add your first degree</Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cvData.education.map((edu) => (
                                    <SortableEducationItem
                                        key={edu.id}
                                        id={edu.id}
                                        education={edu}
                                        isOpen={openId === edu.id}
                                        onToggle={() => toggleOpen(edu.id)}
                                        onUpdate={(field, val) => updateEducation(edu.id, field, val)}
                                        onRemove={() => removeEducation(edu.id)}
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
