
import React, { useEffect, useState } from 'react';
import { useCV } from '../context/CVContext';
import { supabase } from '../lib/supabase';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Plus, Target, FileText, ClipboardList, Trash2, Eye, Edit2, Settings } from "lucide-react";

export const Dashboard = ({ onNavigate }) => {
    const { fetchUserCVs, loadCV, createNewCV, deleteCV } = useCV();
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

    if (loading) return (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading Dashboard...
        </div>
    );

    return (
        <div className="container py-8 space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>

            {/* Section 1: Quick Actions */}
            <Card className="bg-muted/40 border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Button onClick={handleCreateNew} className="gap-2 h-auto py-4 flex flex-col items-center justify-center text-center">
                        <Plus size={24} className="mb-1" /> New Resume
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('match')} className="gap-2 h-auto py-4 flex flex-col items-center justify-center text-center">
                        <Target size={24} className="mb-1" /> Job Match
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('cover-letter')} className="gap-2 h-auto py-4 flex flex-col items-center justify-center text-center">
                        <FileText size={24} className="mb-1" /> Cover Letter
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('tracker')} className="gap-2 h-auto py-4 flex flex-col items-center justify-center text-center">
                        <ClipboardList size={24} className="mb-1" /> Job Tracker
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('settings')} className="gap-2 h-auto py-4 flex flex-col items-center justify-center text-center" title="Configure AI Provider">
                        <Settings size={24} className="mb-1" /> Settings
                    </Button>
                </CardContent>
            </Card>

            {/* Section 2: My CVs */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">My Resumes</h2>
                    <span className="text-muted-foreground text-sm font-medium">{cvs.length} Documents</span>
                </div>

                {cvs.length === 0 ? (
                    <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center h-64">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">No resumes yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Create your first professional resume today with our AI-powered builder.
                        </p>
                        <Button onClick={handleCreateNew}>Create Your First CV</Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cvs.map((cv) => (
                            <Card key={cv.id} className="flex flex-col hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg leading-tight truncate">
                                        {cv.content.personal?.fullName || 'Untitled User'}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 h-10">
                                        {cv.content.personal?.summary || 'No summary provided...'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="text-xs text-muted-foreground">
                                        Last Updated: {new Date(cv.updated_at).toLocaleDateString()}
                                    </div>
                                </CardContent>
                                <CardFooter className="grid grid-cols-3 gap-2 border-t pt-4 bg-muted/20">
                                    <Button size="sm" onClick={() => handleEdit(cv.id)} className="w-full gap-2">
                                        <Edit2 size={14} /> Edit
                                    </Button>

                                    {cv.is_public ? (
                                        <a
                                            href={`/view/${cv.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full"
                                        >
                                            <Button size="sm" variant="outline" className="w-full gap-2">
                                                <Eye size={14} /> View
                                            </Button>
                                        </a>
                                    ) : (
                                        <Button size="sm" variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
                                            <Eye size={14} /> Private
                                        </Button>
                                    )}

                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(cv.id)} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 size={14} />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
