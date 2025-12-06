import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS = ['Applied', 'Interview', 'Offer', 'Rejected'];

const JobCard = ({ job }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '0.8rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        cursor: 'grab'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{job.role}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{job.company}</div>
            {job.salary && <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.2rem' }}>💰 {job.salary}</div>}
        </div>
    );
};

const DroppableColumn = ({ id, jobs }) => {
    const { setNodeRef } = useSortable({ id });

    return (
        <div ref={setNodeRef} style={{
            background: 'var(--surface-sunken)',
            padding: '1rem',
            borderRadius: '12px',
            minHeight: '400px',
            width: '280px'
        }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {id} <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>{jobs.length}</span>
            </h3>
            <div style={{ minHeight: '100px' }}> {/* Drop target area */}
                <SortableContext items={jobs} strategy={verticalListSortingStrategy}>
                    {jobs.map(job => <JobCard key={job.id} job={job} />)}
                </SortableContext>
            </div>
        </div>
    );
};

export const JobTracker = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', role: '', salary: '', status: 'Applied' });

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('job_applications')
                .select('*')
                .eq('user_id', user.id);
            if (!error && data) setJobs(data);
        }
        setLoading(false);
    };

    const handleAddJob = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please log in");

        const { data, error } = await supabase
            .from('job_applications')
            .insert([{ ...newJob, user_id: user.id }])
            .select();

        if (error) {
            alert(error.message);
        } else {
            setJobs([...jobs, data[0]]);
            setShowAddModal(false);
            setNewJob({ company: '', role: '', salary: '', status: 'Applied' });
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        // Check if over is a column or a card
        let newStatus = over.id;

        // If sorting within same column or simple reorder, this logic needs to be robust
        // Simplified: We drag jobs, but 'over.id' might be another job. We need to find the status.

        // NOTE: dnd-kit sortable is tricky for Kanban. 
        // For simplicity in this MVP: We assume dropping ON a column container changes status.
        // Dropping on a card is harder to infer status without looking up the card's status.

        // Better approach for MVP: Just use simple column-based state update logic or DragOverlay.
        // Given complexity, let's just create a simpler "Drag to Change Status" logic.

        // Find job
        const job = jobs.find(j => j.id === activeId);
        if (!job) return;

        // Naive check: did we drop on a Column ID?
        if (COLUMNS.includes(over.id)) {
            newStatus = over.id;
        } else {
            // Dropped on a card?
            const overJob = jobs.find(j => j.id === over.id);
            if (overJob) newStatus = overJob.status;
        }

        if (job.status !== newStatus) {
            // Optimistic Update
            const updatedJobs = jobs.map(j => j.id === activeId ? { ...j, status: newStatus } : j);
            setJobs(updatedJobs);

            // Backend Update
            await supabase
                .from('job_applications')
                .update({ status: newStatus })
                .eq('id', activeId);
        }
    };

    return (
        <div style={{ padding: '2rem', height: '100%', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                <h2 style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    📊 Job Tracker
                </h2>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Application</button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', gap: '1.5rem', minWidth: '1000px' }}>
                    {COLUMNS.map(col => (
                        <DroppableColumn
                            key={col}
                            id={col}
                            jobs={jobs.filter(j => j.status === col)}
                        />
                    ))}
                </div>
            </DndContext>

            {/* Add Job Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '400px', background: 'white' }}>
                        <h3>Add New Job</h3>
                        <div className="form-group">
                            <label>Company</label>
                            <input className="form-input" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <input className="form-input" value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Salary (Optional)</label>
                            <input className="form-input" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleAddJob}>Save</button>
                            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
