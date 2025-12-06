import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const CreditDisplay = ({ userId }) => {
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchCredits = async () => {
            // Check for user_credits table
            const { data, error } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (data) {
                setCredits(data.balance);
            } else if (error && error.code !== 'PGRST116') { // Ignore "Row not found"
                console.error("Error fetching credits:", error);
            }
            setLoading(false);
        };

        fetchCredits();

        // Subscribe to changes
        const channel = supabase
            .channel('public:user_credits')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_credits', filter: `user_id=eq.${userId}` }, (payload) => {
                if (payload.new) setCredits(payload.new.balance);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);

    }, [userId]);

    if (loading) return <span className="text-sm text-gray-500">...</span>;

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            <span role="img" aria-label="coin">🪙</span>
            <span className="font-semibold text-slate-700">{credits}</span>
        </div>
    );
};
