import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export const Tabs = ({ defaultValue, className, children, ...props }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={`w-full ${className}`} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ className, children, ...props }) => {
    return (
        <div className={`inline-flex h-12 w-full items-center justify-start rounded-lg bg-muted/50 p-1 text-muted-foreground ${className}`} {...props}>
            {children}
        </div>
    );
};

export const TabsTrigger = ({ value, className, children, ...props }) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);
    const isActive = activeTab === value;

    return (
        <button
            className={`
                inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                ${isActive
                    ? 'bg-background text-foreground shadow-sm border border-border/50'
                    : 'hover:bg-background/50 hover:text-foreground'}
                ${className}
            `}
            onClick={() => setActiveTab(value)}
            {...props}
        >
            {children}
        </button>
    );
};

export const TabsContent = ({ value, className, children, ...props }) => {
    const { activeTab } = useContext(TabsContext);
    if (activeTab !== value) return null;

    return (
        <div
            className={`mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
