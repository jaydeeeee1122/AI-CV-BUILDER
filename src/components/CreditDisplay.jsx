import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { buyCredits } from '../services/stripeService';

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
        <div
            className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300
                ${credits < 10
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 shadow-sm hover:shadow-md'
                }
            `}
            title={credits < 10 ? "Low balance! Purchase more." : "Your available AI credits"}
        >
            <span className="text-lg">⚡</span>
            <div className="flex flex-col leading-none">
                <span className="font-bold text-sm">{credits}</span>
                <span className="text-[0.65rem] uppercase tracking-wider opacity-70">Credits</span>
            </div>

            {/* Quick Add Button if low */}
            {credits < 20 && (
                <button
                    onClick={buyCredits}
                    className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs hover:scale-110 transition-transform"
                >
                    +
                </button>
            )}
        </div>
    );
};
