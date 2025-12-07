import { supabase } from '../lib/supabase';

// Deprecated: Creating local client causes "Multiple GoTrueClient" warning
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

export const templateService = {
    async getIndustries() {
        const { data, error } = await supabase
            .from('industries')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching industries:', error);
            return [];
        }
        return data;
    },

    async getTemplates(industryId) {
        let query = supabase
            .from('templates')
            .select('*')
            .order('is_premium', { ascending: false }); // Show premium first? Or default first?

        if (industryId) {
            query = query.eq('industry_id', industryId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching templates:', error);
            return [];
        }
        return data;
    },

    async getTemplateById(templateId) {
        const { data, error } = await supabase
            .from('templates')
            .select('*, industries(name)')
            .eq('id', templateId)
            .single();

        if (error) {
            console.error('Error fetching template:', error);
            return null;
        }
        return data;
    }
};
