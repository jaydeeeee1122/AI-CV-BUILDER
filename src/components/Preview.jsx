import React from 'react';
import { useCV } from '../context/CVContext';
import './Preview.css';

export const Preview = () => {
    const { cvData } = useCV();
    const { personal, experience, education } = cvData;

    return (
        <div className="preview-container">
            <div className="cv-paper">
                <div className="cv-sidebar">
                    <div className="sidebar-section profile-section">
                        <h1 className="name">{personal.fullName}</h1>
                        <div className="contact-info">
                            <div className="contact-item">{personal.email}</div>
                            <div className="contact-item">{personal.phone}</div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Education</h3>
                        {education.map((edu) => (
                            <div key={edu.id} className="sidebar-item">
                                <div className="item-degree">{edu.degree}</div>
                                <div className="item-school">{edu.school}</div>
                                <div className="item-date">{edu.year}</div>
                            </div>
                        ))}
                    </div>

                    {/* Skills could go here in future */}
                </div>

                <div className="cv-main">
                    <section className="main-section">
                        <h3>Profile</h3>
                        <p className="summary-text">{personal.summary}</p>
                    </section>

                    <section className="main-section">
                        <h3>Employment History</h3>
                        {experience.map((exp) => (
                            <div key={exp.id} className="main-item">
                                <div className="item-header">
                                    <span className="item-title">{exp.title}, {exp.company}</span>
                                    <span className="item-date-range">
                                        {exp.startDate} - {exp.endDate}
                                    </span>
                                </div>
                                <p className="item-description">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
};
