import React from 'react';

export const ModernTemplate = ({ data }) => {
    const { personal, experience, education, skills } = data;
    const themeFont = personal.themeFont || 'Inter, sans-serif';

    const styles = {
        container: {
            fontFamily: themeFont,
            color: '#333',
            lineHeight: '1.6',
            backgroundColor: '#fff',
            minHeight: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            padding: '2rem'
        },
        header: {
            background: '#2c3e50',
            color: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '1rem'
        },
        name: {
            fontSize: '2.5rem',
            margin: '0 0 0.5rem 0',
            fontWeight: 'bold'
        },
        contact: {
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            fontSize: '0.9rem',
            opacity: 0.9
        },
        sectionTitle: {
            color: '#2c3e50',
            borderBottom: '2px solid #3498db',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginTop: '1.5rem'
        },
        jobBlock: {
            marginBottom: '1.5rem',
            paddingLeft: '1rem',
            borderLeft: '2px solid #eee'
        },
        jobHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.25rem',
            fontWeight: '600',
            color: '#2c3e50'
        },
        company: {
            color: '#7f8c8d',
            fontStyle: 'italic',
            marginBottom: '0.5rem'
        },
        skillBadge: {
            background: '#e0f2f1',
            color: '#00695c',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.85rem',
            fontWeight: '500',
            display: 'inline-block'
        },
        skillsGrid: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
        }
    };

    return (
        <div style={styles.container} className="modern-template">
            <header style={styles.header} id="section-personal">
                <h1 style={styles.name}>{personal.fullName}</h1>
                <div style={styles.contact}>
                    {personal.email && <span>📧 {personal.email}</span>}
                    {personal.phone && <span>📱 {personal.phone}</span>}
                    {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
                </div>
                {personal.summary && (
                    <div style={{ marginTop: '1.5rem', fontStyle: 'italic', opacity: 0.9 }}>
                        {personal.summary}
                    </div>
                )}
            </header>

            <div style={{ padding: '0 1rem' }}>
                {experience && experience.length > 0 && (
                    <section id="section-experience">
                        <h3 style={styles.sectionTitle}>Experience</h3>
                        {experience.map((exp) => (
                            <div key={exp.id} style={styles.jobBlock}>
                                <div style={styles.jobHeader}>
                                    <span>{exp.title}</span>
                                    <span>{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div style={styles.company}>{exp.company}</div>
                                <div dangerouslySetInnerHTML={{ __html: exp.description }} />
                            </div>
                        ))}
                    </section>
                )}

                {education && education.length > 0 && (
                    <section id="section-education">
                        <h3 style={styles.sectionTitle}>Education</h3>
                        {education.map((edu) => (
                            <div key={edu.id} style={styles.jobBlock}>
                                <div style={styles.jobHeader}>
                                    <span>{edu.school}</span>
                                    <span>{edu.year}</span>
                                </div>
                                <div>{edu.degree}</div>
                            </div>
                        ))}
                    </section>
                )}

                {skills && skills.length > 0 && (
                    <section id="section-skills">
                        <h3 style={styles.sectionTitle}>Skills</h3>
                        <div style={styles.skillsGrid}>
                            {skills.map((skill, index) => (
                                <span key={index} style={styles.skillBadge}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
