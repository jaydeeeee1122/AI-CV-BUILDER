import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase'; // Import supabase persistence

const CVContext = createContext();

export const useCV = () => {
    const context = useContext(CVContext);
    if (!context) {
        throw new Error('useCV must be used within a CVProvider');
    }
    return context;
};

export const CVProvider = ({ children }) => {
    const [apiKey, setApiKey] = useState('');
    const [jobDescription, setJobDescription] = useState(null); // { type: 'text' | 'image', content: string, fileName: string }
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState('modern');

    // AI Settings
    const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' | 'ollama'
    const [aiModel, setAiModel] = useState('llama3'); // Default local model

    // Auth State
    const [userId, setUserId] = useState(null);

    // Subscription & Usage State
    const [subscription, setSubscription] = useState({
        plan: 'free', // 'free' | 'one_off' | 'weekly' | 'monthly'
        status: 'active',
        credits: 1, // Default 1 CV for free
        expiryDate: null
    });

    const [aiUsage, setAiUsage] = useState({
        iterations: 0, // Track total AI calls for current CV
        maxIterations: 4 // Hard limit for everyone
    });

    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUserId(user.id);
                // In a real app, we would fetch subscription from DB here
                // For now, default to free
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const [cvData, setCvData] = useState({
        personal: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234 567 890',
            summary: 'Experienced professional with a passion for technology.',
            photoUrl: '',
            themeColor: '#2563eb',
            themeFont: 'Inter, sans-serif',
        },
        experience: [
            {
                id: 1,
                title: 'Software Engineer',
                company: 'Tech Corp',
                startDate: '2020-01',
                endDate: 'Present',
                description: 'Developed scalable web applications using React and Node.js.',
            },
        ],
        skills: ["Example Skill 1", "Example Skill 2"],
        education: [
            {
                id: 1,
                degree: 'B.S. Computer Science',
                school: 'University of Technology',
                year: '2019',
            },
        ],
    });

    // Helper: Check if User can use Gemini
    // Rule: Gemini is ONLY for Paid users, and ONLY on 3rd/4th iterations.
    const canUseGemini = () => {
        const isPaid = subscription.plan !== 'free';
        const isLateStage = aiUsage.iterations >= 2; // 0, 1 are early. 2, 3 are late.
        return isPaid && isLateStage;
    };

    const incrementAiUsage = () => {
        setAiUsage(prev => ({ ...prev, iterations: prev.iterations + 1 }));
    };

    const updatePersonal = (field, value) => {
        setCvData((prev) => ({
            ...prev,
            personal: {
                ...prev.personal,
                [field]: value,
            },
        }));
    };

    const addExperience = () => {
        setCvData((prev) => ({
            ...prev,
            experience: [
                ...prev.experience,
                {
                    id: Date.now(),
                    title: '',
                    company: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                },
            ],
        }));
    };

    const updateExperience = (id, field, value) => {
        setCvData((prev) => ({
            ...prev,
            experience: prev.experience.map((exp) =>
                exp.id === id ? { ...exp, [field]: value } : exp
            ),
        }));
    };

    const removeExperience = (id) => {
        setCvData((prev) => ({
            ...prev,
            experience: prev.experience.filter((exp) => exp.id !== id),
        }));
    };

    const addEducation = () => {
        setCvData((prev) => ({
            ...prev,
            education: [
                ...prev.education,
                {
                    id: Date.now(),
                    degree: '',
                    school: '',
                    year: '',
                },
            ],
        }));
    };

    const updateEducation = (id, field, value) => {
        setCvData((prev) => ({
            ...prev,
            education: prev.education.map((edu) =>
                edu.id === id ? { ...edu, [field]: value } : edu
            ),
        }));
    };

    const removeEducation = (id) => {
        setCvData((prev) => ({
            ...prev,
            education: prev.education.filter((edu) => edu.id !== id),
        }));
    };

    const updateSkills = (newSkills) => {
        setCvData((prev) => ({
            ...prev,
            skills: newSkills
        }));
    };



    // New: Reorder function for drag-and-drop
    const reorderSection = (sectionName, newOrder) => {
        setCvData(prev => ({
            ...prev,
            [sectionName]: newOrder
        }));
    };

    // --- Persistence & Sharing ---
    const [savedId, setSavedId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [publicUrl, setPublicUrl] = useState(null);

    const saveCV = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("You must be logged in to save.");
                throw new Error("User not logged in");
            }

            const payload = {
                user_id: user.id,
                content: cvData,
                updated_at: new Date().toISOString()
            };

            let result;
            if (savedId) {
                // Update existing
                result = await supabase
                    .from('cvs')
                    .update(payload)
                    .eq('id', savedId)
                    .select();
            } else {
                // Insert new
                result = await supabase
                    .from('cvs')
                    .insert(payload)
                    .select();
            }

            if (result.error) throw result.error;

            if (result.data && result.data.length > 0) {
                setSavedId(result.data[0].id);
                // Also set the public URL based on this ID
                if (result.data[0].is_public) {
                    setPublicUrl(`${window.location.origin}/view/${result.data[0].id}`);
                }
                // alert('CV Saved Successfully!'); // Optional: Feedback
                return result.data[0].id;
            }
        } catch (error) {
            console.error('Error saving CV:', error);
            alert(`Failed to save CV: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePublish = async () => {
        if (!savedId) {
            alert("Please save your CV first.");
            return;
        }

        try {
            const { data: current, error: fetchError } = await supabase.from('cvs').select('is_public').eq('id', savedId).single();
            if (fetchError) throw fetchError;

            const newStatus = !current.is_public;

            const { error } = await supabase
                .from('cvs')
                .update({ is_public: newStatus })
                .eq('id', savedId);

            if (error) throw error;

            if (newStatus) {
                setPublicUrl(`${window.location.origin}/view/${savedId}`);
            } else {
                setPublicUrl(null);
            }
            return newStatus;
        } catch (error) {
            console.error('Error toggling publish status:', error);
            alert(`Failed to update share status: ${error.message}`);
        }
    };

    // Helper to load a public CV (for the Viewer)
    const fetchPublicCV = async (id) => {
        const { data, error } = await supabase
            .from('cvs')
            .select('content')
            .eq('id', id)
            .eq('is_public', true)
            .single();

        if (error) throw error;
        return data.content;
    };

    // --- Dashboard Helpers ---
    const fetchUserCVs = async (userId) => {
        const { data, error } = await supabase
            .from('cvs')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    };

    const loadCV = async (id) => {
        const { data, error } = await supabase
            .from('cvs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Update context state
        setCvData(data.content);
        setSavedId(data.id);
        if (data.is_public) {
            setPublicUrl(`${window.location.origin}/view/${data.id}`);
        } else {
            setPublicUrl(null);
        }
        return data;
    };

    const createNewCV = () => {
        setSavedId(null);
        setPublicUrl(null);
        // Reset to default
        setCvData({
            personal: { fullName: 'Your Name', email: '', phone: '', summary: '', themeColor: '#2563eb', themeFont: 'Inter, sans-serif' },
            experience: [],
            education: [],
            skills: []
        });
    };

    const deleteCV = async (id) => {
        const { error } = await supabase
            .from('cvs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // If we deleted the current active one, reset
        if (savedId === id) {
            createNewCV();
        }
    };

    const [activeSection, setActiveSection] = useState('personal');
    const [activeIndustry, setActiveIndustry] = useState(null);
    const [activeTemplateObject, setActiveTemplateObject] = useState({
        id: 'default',
        name: 'Modern Clean',
        slug: 'default-modern',
        component_map_id: 'classic',
        default_config: { primaryColor: '#2563eb', font: 'Inter' }
    });

    // Load default template on mount or if none selected? 
    // For now we start empty or default to Tech/Minimal.

    return (
        <CVContext.Provider
            value={{
                cvData,
                setCvData,
                apiKey,
                setApiKey,
                jobDescription,
                setJobDescription,
                aiRecommendations,
                setAiRecommendations,
                activeTemplate, // Legacy ID, maybe keep for fallback
                setActiveTemplate,
                activeTemplateObject, // New DB Object
                setActiveTemplateObject,
                activeIndustry,
                setActiveIndustry,
                aiProvider,
                setAiProvider,
                aiModel,
                setAiModel,
                userId,
                // Subscription & AI State
                subscription,
                setSubscription,
                aiUsage,
                incrementAiUsage,
                canUseGemini,
                // UI State
                activeSection,
                setActiveSection,
                // Actions
                updatePersonal,
                addExperience,
                updateExperience,
                removeExperience,
                addEducation,
                updateEducation,
                removeEducation,
                updateSkills,
                reorderSection,
                saveCV,
                togglePublish,
                fetchPublicCV,
                savedId,
                isSaving,
                publicUrl,
                fetchUserCVs,
                loadCV,
                createNewCV,
                deleteCV,
            }}
        >
            {children}
        </CVContext.Provider>
    );
};
