import React from 'react';

export const SidebarLayout = ({ data, config }) => {
    const { personal, experience, education, skills } = data;
    const { primaryColor = '#2563eb', font = 'Roboto' } = config || {};

    return (
        <div className="flex h-full min-h-[1000px]" style={{ fontFamily: font }} id="resume-preview">
            {/* Sidebar (Left) */}
            <aside style={{ backgroundColor: primaryColor }} className="w-1/3 text-white p-6 flex flex-col gap-6" id="section-personal">
                <div className="text-center">
                    {/* Placeholder for Photo if we add it later */}
                    <div className="w-24 h-24 bg-white/20 mx-auto rounded-full mb-4 flex items-center justify-center text-2xl font-bold border-2 border-white">
                        {personal.fullName ? personal.fullName[0] : 'CV'}
                    </div>
                    <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">{personal.fullName}</h1>
                    <div className="text-xs space-y-1 opacity-90">
                        <div>{personal.email}</div>
                        <div>{personal.phone}</div>
                        <div>{personal.linkedin}</div>
                    </div>
                </div>

                {/* Skills in Sidebar */}
                {skills?.length > 0 && (
                    <section id="section-skills">
                        <h3 className="text-sm font-bold uppercase border-b border-white/30 pb-1 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s, i) => (
                                <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education in Sidebar */}
                {education?.length > 0 && (
                    <section id="section-education">
                        <h3 className="text-sm font-bold uppercase border-b border-white/30 pb-1 mb-3">Education</h3>
                        <div className="space-y-3">
                            {education.map(edu => (
                                <div key={edu.id} className="text-sm">
                                    <div className="font-bold">{edu.school}</div>
                                    <div className="opacity-80">{edu.degree}</div>
                                    <div className="opacity-60 text-xs">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </aside>

            {/* Main Content (Right) */}
            <main className="w-2/3 p-8 bg-white text-gray-800">
                {personal.summary && (
                    <div className="mb-8">
                        <h2 style={{ color: primaryColor }} className="text-lg font-bold uppercase border-b-2 mb-3 pb-1">Profile</h2>
                        <p className="text-sm leading-relaxed">{personal.summary}</p>
                    </div>
                )}

                {experience?.length > 0 && (
                    <section id="section-experience">
                        <h2 style={{ color: primaryColor }} className="text-lg font-bold uppercase border-b-2 mb-4 pb-1">Professional Experience</h2>
                        <div className="space-y-6">
                            {experience.map(exp => (
                                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: '#e5e7eb' }}>
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4" style={{ borderColor: primaryColor }}></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-gray-900">{exp.title}</h3>
                                        <span className="text-xs font-medium text-gray-500">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-600 mb-2">{exp.company}</div>
                                    <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: exp.description }} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};
