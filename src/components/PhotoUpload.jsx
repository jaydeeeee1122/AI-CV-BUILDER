import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCV } from '../context/CVContext';

export const PhotoUpload = () => {
    const { cvData, updatePersonal } = useCV();
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (event) => {
        try {
            setUploading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in to upload photos.');

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            let { error: uploadError } = await supabase.storage
                .from('cv-photos')
                .upload(filePath, file);

            if (uploadError) {
                // Determine if it's a "bucket not found" error
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error("Bucket 'cv-photos' not found. Please create it in Supabase Dashboard (Storage -> Create new bucket 'cv-photos' -> Set Public).");
                }
                throw uploadError;
            }

            // Get URL
            const { data: { publicUrl } } = supabase.storage
                .from('cv-photos')
                .getPublicUrl(filePath);

            updatePersonal('photoUrl', publicUrl);

        } catch (error) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Preview Circle */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: cvData.personal.photoUrl ? `url(${cvData.personal.photoUrl}) center/cover` : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--primary)',
                overflow: 'hidden'
            }}>
                {!cvData.personal.photoUrl && <span style={{ fontSize: '2rem', color: '#94a3b8' }}>👤</span>}
            </div>

            {/* Upload Button */}
            <div>
                <label
                    className="btn btn-outline btn-sm"
                    style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                >
                    {uploading ? 'Uploading...' : '📸 Upload Photo'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Recruiters prefer professional headshots.
                </div>
            </div>
        </div>
    );
};
