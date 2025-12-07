
import React, { useState, useEffect } from 'react';
import { useCV } from '../context/CVContext';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
// Removed RadioGroup import to fix missing dependency error
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const SettingsPage = () => {
    const { aiProvider, setAiProvider, aiModel, setAiModel } = useCV();
    const [testStatus, setTestStatus] = useState(null); // 'loading', 'success', 'error'
    const [statusMessage, setStatusMessage] = useState("");

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setStatusMessage("Testing connection...");

        // Simple test call to enhance
        try {
            const response = await fetch('http://localhost:3000/api/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: aiProvider,
                    model: aiModel
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTestStatus('success');
                setStatusMessage(`Success! Response: ${data.text.substring(0, 50)}...`);
            } else {
                const err = await response.json();
                throw new Error(err.error || "Request failed");
            }
        } catch (error) {
            console.error(error);
            setTestStatus('error');
            setStatusMessage(`Error: ${error.message}. Make sure Ollama is running if selected.`);
        }
    };

    return (
        <div className="container py-8 max-w-2xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>AI Provider Configuration</CardTitle>
                    <CardDescription>Choose between Cloud (Gemini) or Local (Ollama) AI models.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Replaced RadioGroup with standard HTML radio inputs + styling */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${aiProvider === 'gemini' ? 'border-primary bg-accent' : 'border-muted bg-popover'}`}>
                            <input
                                type="radio"
                                name="aiProvider"
                                value="gemini"
                                checked={aiProvider === 'gemini'}
                                onChange={(e) => setAiProvider(e.target.value)}
                                className="sr-only"
                            />
                            <span className="mb-2 text-2xl">☁️</span>
                            <span className="font-semibold">Gemini (Cloud)</span>
                            <span className="text-xs text-muted-foreground mt-1">Fast & Reliable</span>
                        </label>

                        <label className={`cursor-pointer flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${aiProvider === 'ollama' ? 'border-primary bg-accent' : 'border-muted bg-popover'}`}>
                            <input
                                type="radio"
                                name="aiProvider"
                                value="ollama"
                                checked={aiProvider === 'ollama'}
                                onChange={(e) => setAiProvider(e.target.value)}
                                className="sr-only"
                            />
                            <span className="mb-2 text-2xl">💻</span>
                            <span className="font-semibold">Ollama (Local)</span>
                            <span className="text-xs text-muted-foreground mt-1">Free & Private</span>
                        </label>
                    </div>

                    {aiProvider === 'ollama' && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="model">Local Model Name</Label>
                                <Input
                                    id="model"
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value)}
                                    placeholder="llama3, mistral, etc."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Make sure you have pulled this model: <code>ollama pull {aiModel || 'llama3'}</code>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                        <Button variant="outline" onClick={handleTestConnection} disabled={testStatus === 'loading'}>
                            {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                        </Button>

                        {statusMessage && (
                            <div className={`text-sm flex items-center gap-2 ${testStatus === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                                {testStatus === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                {statusMessage}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
