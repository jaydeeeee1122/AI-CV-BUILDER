import { supabase } from '../lib/supabase';

export const buyCredits = async (userId) => {
    console.log("Initiating purchase for user:", userId);
    alert("Stripe integration is in demo mode. Credits would be purchased here.");

    // DEMO: Manually add credits for now since backend Stripe isn't fully connected in this environment
    const { data, error } = await supabase.rpc('increment_credits', { user_id: userId, amount: 50 });
    if (error) {
        console.error("Error adding demo credits:", error);
        // Fallback if RPC doesn't exist, try direct insert/update
        const { data: current } = await supabase.from('user_credits').select('balance').eq('user_id', userId).single();
        if (current) {
            await supabase.from('user_credits').update({ balance: current.balance + 50 }).eq('user_id', userId);
        } else {
            await supabase.from('user_credits').insert({ user_id: userId, balance: 50 });
        }
    }
    window.location.reload(); // Quick refresh to see new credits
};
