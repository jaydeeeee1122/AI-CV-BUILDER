import React, { useEffect, useState } from 'react';
import { templateService } from '../../services/templateService';
import { useCV } from '../../context/CVContext';

export const TemplateSelector = () => {
    const {
        activeIndustry,
        setActiveIndustry,
        activeTemplateObject,
        setActiveTemplateObject,
        setActiveTemplate // Keep legacy sync if needed
    } = useCV();

    const [industries, setIndustries] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Industries on Mount
    useEffect(() => {
        const loadIndustries = async () => {
            const data = await templateService.getIndustries();
            setIndustries(data);
            // Default to first industry if none selected
            if (data.length > 0 && !activeIndustry) {
                setActiveIndustry(data[0].id);
            }
        };
        loadIndustries();
    }, []);

    // 2. Fetch Templates when Industry Changes
    useEffect(() => {
        const loadTemplates = async () => {
            if (!activeIndustry) return;
            setLoading(true);
            const data = await templateService.getTemplates(activeIndustry);
            setTemplates(data);
            setLoading(false);
        };
        loadTemplates();
    }, [activeIndustry]);

    // Handler
    const handleTemplateClick = (t) => {
        setActiveTemplateObject(t);
        setActiveTemplate(t.slug);
    };

    return (
        <div className="flex flex-col gap-3 bg-background/50 backdrop-blur px-4 py-3 rounded-xl border shadow-sm w-full">

            {/* Industry Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap mr-2">Industry:</span>
                {industries.map(ind => (
                    <button
                        key={ind.id}
                        onClick={() => setActiveIndustry(ind.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeIndustry === ind.id
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-white/50 text-gray-600 hover:bg-white hover:text-gray-900'
                            }`}
                    >
                        {ind.name}
                    </button>
                ))}
            </div>

            {/* Template Grid */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap mr-2">Template:</span>
                {loading ? (
                    <span className="text-xs text-gray-400 italic">Loading...</span>
                ) : (
                    templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleTemplateClick(t)}
                            className={`group relative flex flex-col items-center gap-1 min-w-[100px] p-2 rounded-lg border transition-all ${activeTemplateObject?.id === t.id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-transparent hover:bg-white/50 hover:border-gray-200'
                                }`}
                        >
                            {/* Mini Preview Mockup */}
                            <div className={`w-full h-12 rounded bg-gray-100 border overflow-hidden relative ${t.component_map_id === 'sidebar' ? 'flex' : ''}`}>
                                {t.component_map_id === 'sidebar' && <div className="w-1/3 h-full bg-gray-300"></div>}
                                {t.component_map_id === 'grid' && <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-gray-200"></div></div>}
                                {t.component_map_id === 'classic' && <div className="w-full h-full p-1 flex flex-col gap-1"><div className="w-full h-1 bg-gray-300"></div><div className="w-2/3 h-1 bg-gray-200"></div></div>}

                                {/* Premium Badge */}
                                {t.is_premium && (
                                    <div className="absolute top-0 right-0 bg-amber-400 text-[8px] font-bold px-1 rounded-bl text-white shadow-sm">PRO</div>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium text-center truncate w-full ${activeTemplateObject?.id === t.id ? 'text-primary' : 'text-gray-600'}`}>
                                {t.name}
                            </span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};
