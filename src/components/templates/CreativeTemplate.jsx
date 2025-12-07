
import React from 'react';

export const CreativeTemplate = ({ data }) => {
    const { personal, experience, education, skills, theme = 'modern' } = data;

    // Theme colors map
    const colors = {
        modern: { primary: '#2563eb', secondary: '#f1f5f9', text: '#0f172a' },
        professional: { primary: '#0f172a', secondary: '#e2e8f0', text: '#334155' },
        creative: { primary: '#7c3aed', secondary: '#f3e8ff', text: '#4c1d95' },
    };

    const currentTheme = colors[theme] || colors.modern;

    return (
        <div
            className="w-full h-full min-h-[1100px] bg-white flex text-sm font-sans"
            style={{ color: currentTheme.text }}
        >
            {/* Sidebar */}
            <div
                className="w-1/3 p-8 flex flex-col gap-6"
                style={{ backgroundColor: currentTheme.primary, color: 'white' }}
            >
                <div className="text-center mb-6">
                    {personal.photo && (
                        <img
                            src={personal.photo}
                            alt="Profile"
                            className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
                        />
                    )}
                    <h1 className="text-2xl font-bold leading-tight mb-2">{personal.fullName}</h1>
                    <p className="opacity-90">{personal.email}</p>
                    <p className="opacity-90">{personal.phone}</p>
                    <p className="opacity-90">{personal.address}</p>
                    {personal.website && <p className="opacity-90 mt-1">{personal.website}</p>}
                </div>

                {skills.length > 0 && (
                    <div>
                        <h3 className="uppercase tracking-widest text-xs font-bold mb-4 border-b border-white/20 pb-1">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-white/20 px-2 py-1 rounded text-xs"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {education.length > 0 && (
                    <div>
                        <h3 className="uppercase tracking-widest text-xs font-bold mb-4 border-b border-white/20 pb-1">Education</h3>
                        <div className="space-y-4">
                            {education.map((edu) => (
                                <div key={edu.id}>
                                    <div className="font-bold">{edu.degree}</div>
                                    <div className="opacity-90 text-xs">{edu.school}, {edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-8">
                {personal.summary && (
                    <div className="mb-8">
                        <h3
                            className="uppercase tracking-widest text-xs font-bold mb-4 border-b pb-1"
                            style={{ borderColor: currentTheme.secondary, color: currentTheme.primary }}
                        >
                            Professional Profile
                        </h3>
                        <p className="leading-relaxed opacity-80 whitespace-pre-wrap">
                            {personal.summary}
                        </p>
                    </div>
                )}

                {experience.length > 0 && (
                    <div>
                        <h3
                            className="uppercase tracking-widest text-xs font-bold mb-6 border-b pb-1"
                            style={{ borderColor: currentTheme.secondary, color: currentTheme.primary }}
                        >
                            Work History
                        </h3>
                        <div className="space-y-6">
                            {experience.map((exp) => (
                                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: currentTheme.secondary }}>
                                    <div
                                        className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white"
                                        style={{ backgroundColor: currentTheme.primary }}
                                    ></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-lg">{exp.title}</h4>
                                        <span className="text-xs font-bold opacity-60 bg-slate-100 px-2 py-1 rounded">
                                            {exp.startDate} - {exp.endDate}
                                        </span>
                                    </div>
                                    <div className="font-medium mb-3 opacity-75">{exp.company}</div>
                                    <div
                                        className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: exp.description }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
