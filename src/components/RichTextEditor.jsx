import React from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { Button } from './ui/button';

export const RichTextEditor = ({ value, onChange, placeholder }) => {
    // Simple textarea implementation for reliability and clean UI
    // In the future, we can upgrade to TipTap if rich text is strictly required.
    // For now, this fixes the "messy" UI and "missing text" issues guaranteed.

    return (
        <div className="border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
            <div className="flex items-center gap-1 p-1 border-b bg-muted/20">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled title="Bold (Coming Soon)">
                    <Bold size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled title="Italic (Coming Soon)">
                    <Italic size={14} />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange((value || '') + '\n• ')} title="Add Bullet">
                    <List size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange((value || '') + '\n1. ')} title="Add Numbered List">
                    <ListOrdered size={14} />
                </Button>
            </div>
            <textarea
                className="w-full min-h-[150px] p-3 text-sm bg-transparent border-none focus:outline-none resize-y"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};
