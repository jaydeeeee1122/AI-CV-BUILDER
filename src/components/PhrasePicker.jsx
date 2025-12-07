import React, { useState } from 'react';
import { phraseCategories } from '../data/phraseLibrary';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { BookOpen, Search, PlusCircle } from "lucide-react";
import { Input } from "./ui/input";


export const PhrasePicker = ({ onSelect }) => {
    const [activeCategory, setActiveCategory] = useState(Object.keys(phraseCategories)[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);

    const filteredPhrases = phraseCategories[activeCategory]?.filter(phrase =>
        phrase.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleSelect = (phrase) => {
        onSelect(phrase);
        // Optional: Keep open to allow selecting multiple phrases
        // setOpen(false); 
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    <BookOpen size={14} className="mr-2" />
                    Open Phrase Library
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
                <div className="p-6 pb-2 border-b">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Professional Phrase Library
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for action verbs, leadership, technical skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Categories */}
                    <div className="w-48 border-r bg-muted/30 overflow-y-auto p-2 space-y-1">
                        {Object.keys(phraseCategories).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeCategory === cat
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Phrase List */}
                    <div className="flex-1 overflow-y-auto p-4 bg-background">
                        <div className="space-y-2">
                            {filteredPhrases.length > 0 ? (
                                filteredPhrases.map((phrase, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelect(phrase)}
                                        className="group flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 cursor-pointer transition-all"
                                    >
                                        <PlusCircle className="mt-0.5 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground">
                                            {phrase}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                                    <Search className="h-8 w-8 mb-2 opacity-20" />
                                    <p>No phrases found for "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/10 text-xs text-center text-muted-foreground">
                    Click on a phrase to append it to your description.
                </div>
            </DialogContent>
        </Dialog>
    );
};
