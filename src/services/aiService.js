import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to find the best available model for the given key
const findBestModel = async (apiKey) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) return "gemini-1.5-flash"; // Fallback

        const data = await response.json();
        const models = data.models || [];

        // Filter for models that support generateContent
        const capableModels = models.filter(m =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent")
        );

        // Priority list of preferred models
        const preferences = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        for (const pref of preferences) {
            const match = capableModels.find(m => m.name.includes(pref));
            if (match) {
                return match.name.replace("models/", "");
            }
        }

        // If no preferred model found, take the first capable one
        if (capableModels.length > 0) {
            return capableModels[0].name.replace("models/", "");
        }

        return "gemini-1.5-flash";
    } catch (error) {
        console.warn("Failed to fetch model list, using default:", error);
        return "gemini-1.5-flash";
    }
};

// Mock enhancement logic
const mockEnhance = async (text) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!text || text.trim().length < 5) {
        return "Accomplished professional with a proven history of delivering results in high-paced environments. Adept at leveraging technical expertise to drive business growth and operational efficiency.";
    }

    const cleanText = text.trim();
    const lowerText = cleanText.toLowerCase();

    let prefix = "Spearheaded initiatives to";
    let suffix = "resulting in measurable improvements in productivity.";

    if (lowerText.includes("develop") || lowerText.includes("code") || lowerText.includes("program")) {
        prefix = "Architected and engineered robust solutions to";
        suffix = "enhancing system scalability and user experience.";
    } else if (lowerText.includes("manage") || lowerText.includes("lead") || lowerText.includes("team")) {
        prefix = "Orchestrated and mentored cross-functional teams to";
        suffix = "fostering a culture of collaboration and high performance.";
    } else if (lowerText.includes("design") || lowerText.includes("create")) {
        prefix = "Conceptualized and executed innovative designs to";
        suffix = "significantly increasing user engagement and brand loyalty.";
    } else if (lowerText.includes("sales") || lowerText.includes("revenue")) {
        prefix = "Strategically drove sales operations to";
        suffix = "exceeding quarterly targets by 20%.";
    } else {
        const prefixes = [
            "Proactively executed strategies to",
            "Leveraged expertise to",
            "Directed key projects to",
            "Optimized workflows to",
            "Championed the implementation of"
        ];
        prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        const suffixes = [
            "delivering critical improvements in operational efficiency.",
            "consistently meeting and exceeding project milestones.",
            "driving substantial cost reductions and process optimizations.",
            "ensuring alignment with organizational strategic objectives."
        ];
        suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    }

    return `${prefix} ${cleanText.charAt(0).toLowerCase() + cleanText.slice(1)} ${suffix}`;
};

export const enhanceText = async (text, apiKey, instructions = "") => {
    console.log("enhanceText called with:", { textLength: text?.length, hasApiKey: !!apiKey, instructions });

    // If no API key, use the mock logic
    if (!apiKey) {
        console.warn("No API Key provided, using mock enhancement.");
        return mockEnhance(text);
    }

    const trimmedKey = apiKey.trim();

    try {
        // Dynamically find the best model
        const modelName = await findBestModel(trimmedKey);
        console.log(`Selected Model: ${modelName}`);

        const genAI = new GoogleGenerativeAI(trimmedKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        let prompt = "";

        if (instructions && instructions.trim() !== "") {
            console.log("Using Keyword Generation Mode");
            // Mode: Generate from keywords/instructions
            prompt = `You are a professional CV writer. Write a professional, impactful, and concise CV profile summary based on the following keywords and skills. Use action verbs. Return ONLY the summary text, do not include any explanations or quotes.
        
        Keywords/Skills: "${instructions}"
        ${text ? `Draft/Context: "${text}"` : ""}`;
        } else {
            console.log("Using Rewrite Mode");
            // Mode: Rewrite existing text
            prompt = `You are a professional CV writer. Rewrite the following text to be more professional, impactful, and concise. Use action verbs. Return ONLY the rewritten text, do not include any explanations or quotes.

        Text to rewrite: "${text}"`;
        }

        console.log("Sending Prompt to AI:", prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhancedText = response.text();

        console.log("AI Response received:", enhancedText.substring(0, 50) + "...");

        return enhancedText.trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        alert(`AI Error: ${error.message}\n\nFalling back to offline mode.`);
        return mockEnhance(text);
    }
};

export const testApiKey = async (apiKey) => {
    if (!apiKey) throw new Error("API Key is empty");

    const trimmedKey = apiKey.trim();

    // First, try to list models to see what's available and verify the key
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}`;

    try {
        const listResponse = await fetch(listUrl);
        const listData = await listResponse.json();

        if (!listResponse.ok) {
            throw new Error(listData.error?.message || `List Models Failed: ${listResponse.status}`);
        }

        console.log("Available Models:", listData.models);

        // Check if gemini-1.5-flash is in the list
        const flashModel = listData.models?.find(m => m.name.includes("gemini-1.5-flash"));
        const proModel = listData.models?.find(m => m.name.includes("gemini-pro"));

        const modelToUse = flashModel ? flashModel.name.replace("models/", "") : (proModel ? proModel.name.replace("models/", "") : "gemini-1.5-flash");

        // Now try to generate content with the found model
        const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${trimmedKey}`;

        const response = await fetch(generateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello" }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `Generate Content Failed: ${response.status}`);
        }

        return `Success! Key works. Found model: ${modelToUse}`;
    } catch (error) {
        throw new Error(error.message);
    }
};
