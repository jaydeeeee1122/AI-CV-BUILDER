import React from 'react';

export const GridLayout = ({ data, config }) => {
    const { personal, experience, education, skills } = data;
    const { primaryColor = '#059669', font = 'Lato' } = config || {};

    return (
        <div style={{ fontFamily: font }} className="p-8 bg-white min-h-full" id="resume-preview">
            {/* Header Block */}
            <header className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100 shadow-sm" id="section-personal">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight" style={{ color: primaryColor }}>{personal.fullName}</h1>
                        <p className="mt-2 text-gray-600 max-w-lg">{personal.summary}</p>
                    </div>
                    <div className="text-right text-sm space-y-1 text-gray-500 font-medium">
                        <div>{personal.email}</div>
                        <div>{personal.phone}</div>
                        <div>{personal.linkedin}</div>
                    </div>
                </div>
            </header>

            {/* Grid Content */}
            <div className="grid grid-cols-12 gap-8">

                {/* Left Col (Experience) - Spans 8 */}
                <div className="col-span-8 space-y-8" id="section-experience">
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-1 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                            Experience
                        </h2>
                        <div className="space-y-8">
                            {experience?.map(exp => (
                                <div key={exp.id} className="group">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-lg">{exp.title}</h3>
                                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 mb-3">{exp.company}</div>
                                    <div className="text-sm leading-relaxed text-gray-700 pl-4 border-l-2 border-gray-100 group-hover:border-gray-200 transition-colors"
                                        dangerouslySetInnerHTML={{ __html: exp.description }} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Col (Skills, Edu) - Spans 4 */}
                <div className="col-span-4 space-y-8">

                    {skills?.length > 0 && (
                        <section id="section-skills">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                                Skills
                            </h2>
                            <div className="flex flex-col gap-2">
                                {skills.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                        <span className="text-sm font-medium text-gray-700">{s}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {education?.length > 0 && (
                        <section id="section-education">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-1 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                                Education
                            </h2>
                            <div className="space-y-4">
                                {education.map(edu => (
                                    <div key={edu.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="font-bold text-sm">{edu.degree}</div>
                                        <div className="text-xs text-gray-600 mt-1">{edu.school}</div>
                                        <div className="text-xs text-gray-400 mt-2 text-right">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
};
