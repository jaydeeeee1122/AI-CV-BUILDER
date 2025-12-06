
// Helper to call backend API
const callApi = async (endpoint, body) => {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Request failed: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

export const enhanceText = async (text, apiKey, instructions = "") => {
    // Note: apiKey param is kept for compatibility but ignored
    try {
        const data = await callApi('/api/enhance', { text, instructions });
        return data.text;
    } catch (error) {
        console.error("Enhance failed", error);
        throw error;
    }
};

export const testApiKey = async (apiKey) => {
    // Note: apiKey param is kept for compatibility
    try {
        const response = await fetch('/api/health');
        if (response.ok) return "Backend connected";
        throw new Error("Backend connection failed");
    } catch (error) {
        throw new Error("Could not connect to backend server");
    }
};

export const analyzeCV = async (cvText, jobDescription, apiKey) => {
    return callApi('/api/analyze-cv', { cvText, jobDescription });
};

export const rewriteCV = async (cvText, jobDescription, apiKey) => {
    return callApi('/api/rewrite-cv', { cvText, jobDescription });
};
