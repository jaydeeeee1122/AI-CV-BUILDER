import React from 'react';
import { useCV } from '../../context/CVContext';

export const EducationSection = () => {
    const { cvData, addEducation, updateEducation, removeEducation } = useCV();

    return (
        <section className="editor-section-group">
            <div className="section-header">
                <h3>Education</h3>
                <button onClick={addEducation} className="btn btn-primary btn-sm">
                    + Add
                </button>
            </div>

            {cvData.education.map((edu) => (
                <div key={edu.id} className="education-item card">
                    <div className="form-group">
                        <label>Degree</label>
                        <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>School</label>
                        <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Year</label>
                        <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <button
                        onClick={() => removeEducation(edu.id)}
                        className="btn btn-outline btn-sm btn-danger"
                    >
                        Remove
                    </button>
                </div>
            ))}
        </section>
    );
};
