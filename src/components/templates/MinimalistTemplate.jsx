import React from 'react';

export const MinimalistTemplate = ({ data }) => {
    const { personal, experience, education, skills } = data;
    const themeFont = personal.themeFont || '"Times New Roman", Times, serif';

    const styles = {
        container: {
            fontFamily: themeFont,
            color: '#000',
            lineHeight: '1.4',
            backgroundColor: '#fff',
            padding: '2rem',
            maxWidth: '100%',
            boxSizing: 'border-box'
        },
        header: {
            textAlign: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #000',
            paddingBottom: '1rem'
        },
        name: {
            fontSize: '24px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            margin: '0 0 0.5rem 0'
        },
        contact: {
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem'
        },
        section: {
            marginBottom: '1.5rem'
        },
        sectionTitle: {
            fontSize: '16px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            borderBottom: '1px solid #ccc',
            marginBottom: '0.75rem',
            paddingBottom: '0.25rem'
        },
        jobBlock: {
            marginBottom: '1rem'
        },
        jobHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            marginBottom: '0.25rem'
        },
        skillsGrid: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
        },
        skillBadge: {
            border: '1px solid #ddd',
            padding: '2px 6px',
            fontSize: '12px',
            borderRadius: '4px'
        }
    };

    return (
        <div style={styles.container} className="ats-template">
            <header style={styles.header} id="section-personal">
                <h1 style={styles.name}>{personal.fullName}</h1>
                <div style={styles.contact}>
                    <span>{personal.email}</span>
                    <span>{personal.phone}</span>
                </div>
            </header>

            <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Professional Summary</h3>
                <p>{personal.summary}</p>
            </section>

            {skills && skills.length > 0 && (
                <section style={styles.section} id="section-skills">
                    <h3 style={styles.sectionTitle}>Core Competencies</h3>
                    <div style={styles.skillsGrid}>
                        {skills.map((skill, index) => (
                            <span key={index} style={styles.skillBadge}>{skill}</span>
                        ))}
                    </div>
                </section>
            )}

            <section style={styles.section} id="section-experience">
                <h3 style={styles.sectionTitle}>Professional Experience</h3>
                {experience.map((exp) => (
                    <div key={exp.id} style={styles.jobBlock}>
                        <div style={styles.jobHeader}>
                            <span>{exp.title}</span>
                            <span>{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>{exp.company}</div>
                        <p>{exp.description}</p>
                    </div>
                ))}
            </section>

            <section style={styles.section} id="section-education">
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
        </div>
    );
};
