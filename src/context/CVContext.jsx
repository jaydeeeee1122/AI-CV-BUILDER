import React, { createContext, useContext, useState } from 'react';

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

    const [cvData, setCvData] = useState({
        personal: {
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '+1 234 567 890',
            summary: 'Experienced professional with a passion for technology.',
        },
        experience: [
            {
                id: 1,
                title: 'Software Engineer',
                company: 'Tech Corp',
                startDate: '01-01-2020',
                endDate: 'Present',
                description: 'Developed scalable web applications using React and Node.js.',
            },
        ],
        education: [
            {
                id: 1,
                degree: 'B.S. Computer Science',
                school: 'University of Technology',
                year: '2019',
            },
        ],
    });

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

    return (
        <CVContext.Provider
            value={{
                cvData,
                setCvData, // Expose this to allow full overwrite
                apiKey,
                setApiKey,
                jobDescription,
                setJobDescription,
                aiRecommendations,
                setAiRecommendations,
                updatePersonal,
                addExperience,
                updateExperience,
                removeExperience,
                addEducation,
                updateEducation,
                removeEducation,
            }}
        >
            {children}
        </CVContext.Provider>
    );
};
