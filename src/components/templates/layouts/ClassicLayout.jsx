import React from 'react';

// Common Styles Helper
const getSectionStyles = (theme, isHeader = false) => ({
    borderColor: theme.primaryColor,
    color: theme.textColor || '#333',
    fontFamily: theme.font
});

export const ClassicLayout = ({ data, config }) => {
    const { personal, experience, education, skills } = data;
    const { primaryColor = '#333', font = 'Inter' } = config || {};

    const styles = {
        container: { fontFamily: font, color: '#333', lineHeight: 1.6, padding: '2rem' },
        header: { textAlign: 'center', borderBottom: `2px solid ${primaryColor}`, paddingBottom: '1.5rem', marginBottom: '2rem' },
        name: { firstName: '2.5rem', fontWeight: 'bold', color: primaryColor, textTransform: 'uppercase', fontFamily: font },
        contact: { display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' },
        sectionTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: primaryColor, textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' },
        jobTitle: { fontWeight: 'bold', fontSize: '1.1rem' },
        companyLine: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontStyle: 'italic' },
    };

    return (
        <div style={styles.container} id="resume-preview">
            <header style={styles.header} id="section-personal">
                <h1 style={styles.name}>{personal.fullName}</h1>
                <div style={styles.contact}>
                    {personal.email && <span>{personal.email}</span>}
                    {personal.phone && <span>| {personal.phone}</span>}
                    {personal.linkedin && <span>| {personal.linkedin}</span>}
                </div>
                {personal.summary && <p style={{ marginTop: '1rem', textAlign: 'left' }}>{personal.summary}</p>}
            </header>

            {/* Content Sections */}
            <div className="space-y-6">
                {experience?.length > 0 && (
                    <section id="section-experience">
                        <h2 style={styles.sectionTitle}>Experience</h2>
                        {experience.map(exp => (
                            <div key={exp.id} className="mb-4">
                                <div style={styles.companyLine}>
                                    <span style={styles.jobTitle}>{exp.title}</span>
                                    <span>{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="font-semibold text-gray-700">{exp.company}</div>
                                <div dangerouslySetInnerHTML={{ __html: exp.description }} />
                            </div>
                        ))}
                    </section>
                )}

                {education?.length > 0 && (
                    <section id="section-education">
                        <h2 style={styles.sectionTitle}>Education</h2>
                        {education.map(edu => (
                            <div key={edu.id} className="mb-2 flex justify-between">
                                <div>
                                    <div className="font-bold">{edu.school}</div>
                                    <div>{edu.degree}</div>
                                </div>
                                <div>{edu.year}</div>
                            </div>
                        ))}
                    </section>
                )}

                {skills?.length > 0 && (
                    <section id="section-skills">
                        <h2 style={styles.sectionTitle}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s, i) => (
                                <span key={i} style={{ border: `1px solid ${primaryColor}`, color: primaryColor }} className="px-2 py-1 rounded text-sm font-medium">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
