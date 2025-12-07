
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch'; // Requires npm install node-fetch for Node < 18

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const port = 3000;

// Initialize Supabase Admin Client
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Stripe
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in .env file");
}

// --- AI STRATEGY PATTERN ---

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async generate(prompt) {
        // Handle prompt array vs string
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}

class OllamaService {
    constructor(modelName = "llama3") {
        this.baseUrl = "http://localhost:11434/api/generate";
        this.modelName = modelName;
    }

    async generate(prompt) {
        // Ollama doesn't handle complex multi-modal arrays like Gemini in the same way.
        // We need to flatten the prompt if possible.
        let finalPrompt = "";

        if (Array.isArray(prompt)) {
            finalPrompt = prompt.map(p => {
                if (typeof p === 'string') return p;
                if (p.inlineData) return `[Image Data Provided - Description: Image analysis requested]`;
                return JSON.stringify(p);
            }).join("\n");
        } else {
            finalPrompt = prompt;
        }

        const body = {
            model: this.modelName,
            prompt: finalPrompt,
            stream: false
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama Error: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Ollama Service Error:", error);
            if (error.code === 'ECONNREFUSED') {
                throw new Error("Ollama is not running. Please run 'ollama serve' locally.");
            }
            throw error;
        }
    }
}

class AIProviderFactory {
    static getService(provider = 'gemini', model = 'llama3') {
        if (provider === 'ollama') {
            return new OllamaService(model);
        }
        return new GeminiService();
    }
}

// --- STRIPE ROUTES ---

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, userId, successUrl, cancelUrl } = req.body;

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: '50 AI Credits',
                            description: 'Credits for CV Analysis and Rewrites',
                        },
                        unit_amount: 500,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: userId,
            },
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/mock-payment-success', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(`💰 MOCK PAYMENT: Added 50 credits to user ${userId}`);
        res.json({ success: true, message: "Credits added (Mock)" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- AI LOGGING UTILITY ---

async function logAITransaction({
    userId,
    actionType,
    inputContext,
    jobDescriptionKeywords = null,
    aiPrompt,
    aiResponse,
    provider,
    model
}) {
    // Fire and forget logging to avoid slowing down user response
    try {
        if (!userId) {
            // If no user ID (e.g. guest), we might skip or log as anonymous if schema allows null user_id
            // Schema has user_id reference auth.users, so it might fail if null.
            // Let's log only if we have a userId or if we change schema to allow null.
            // For now, let's skip if no userId to avoid FK errors.
            console.log("Skipping AI Log: No User ID");
            return;
        }

        const { error } = await supabase.from('ai_logs').insert({
            user_id: userId,
            action_type: actionType,
            input_context: inputContext ? inputContext.substring(0, 5000) : null, // Limit size
            job_description_keywords: jobDescriptionKeywords,
            ai_prompt: aiPrompt, // Full prompt for training
            ai_response: aiResponse,
            provider,
            model
        });

        if (error) console.error("AI Logging Error:", error);
    } catch (err) {
        console.error("AI Logging Exception:", err);
    }
}

// --- AI ROUTES (Standardized) ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Middleware to check credits & Enforcement Logic
const checkCredits = async (req, res, next) => {
    // ... logic same as before ...
    const { userId, provider = 'ollama', iteration = 0 } = req.body;

    // 1. Free Tier / Ollama Check
    if (provider === 'ollama') {
        return next();
    }

    // 2. Paid / Gemini Check
    if (provider === 'gemini') {
        if (!userId) {
            return res.status(401).json({ error: "User login required for Premium AI" });
        }
        if (iteration < 3) {
            // Strict enforcement or warning could go here
        }

        try {
            const { data: newBalance, error } = await supabase.rpc('deduct_credits', {
                uid: userId,
                amount: 10 // Cost of Gemini
            });

            if (error) {
                if (error.message.includes('Insufficient credits')) {
                    return res.status(402).json({ error: "Premium features require a paid plan or credits." });
                }
                throw error;
            }
            req.newBalance = newBalance;
            next();
        } catch (err) {
            console.error("Credit Check Error:", err);
            res.status(500).json({ error: "Payment verification failed" });
        }
        return;
    }
    next();
};

app.post('/api/enhance', checkCredits, async (req, res) => {
    try {
        const { text, instructions, provider, model, userId } = req.body; // Ensure userId is passed from frontend
        // ... rest of the route remains same ...

        let prompt = "";
        let inputContext = text;

        if (instructions && instructions.trim() !== "") {
            prompt = `You are a professional CV writer. Write a professional, impactful, and concise CV profile summary based on the following keywords and skills. Use action verbs. Return ONLY the summary text, do not include any explanations or quotes.
        
        Keywords/Skills: "${instructions}"
        ${text ? `Draft/Context: "${text}"` : ""}`;
            inputContext = `Instructions: ${instructions}\nDraft: ${text}`;
        } else {
            prompt = `You are a professional CV writer. Rewrite the following text to be more professional, impactful, and concise. Use action verbs. Return ONLY the rewritten text, do not include any explanations or quotes.
            
            Text to rewrite: "${text}"`;
        }

        const service = AIProviderFactory.getService(provider, model);
        const enhancedText = await service.generate(prompt);

        // LOGGING
        logAITransaction({
            userId,
            actionType: 'enhance',
            inputContext: inputContext,
            aiPrompt: prompt,
            aiResponse: enhancedText,
            provider,
            model
        });

        res.json({ text: enhancedText.trim() });
    } catch (error) {
        console.error("Enhance Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ... test-connection remains same ...
app.post('/api/test-connection', async (req, res) => {
    try {
        const { provider, model } = req.body;
        const service = AIProviderFactory.getService(provider, model);
        const response = await service.generate("Reply with exact phrase: 'Connection Successful'");
        res.json({ text: response.trim(), success: true });
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
});


app.post('/api/analyze-cv', checkCredits, async (req, res) => {
    try {
        const { cvText, jobDescription, provider, model, userId } = req.body;
        console.log(`Analyze-CV Request. Provider: ${provider || 'gemini'}`);

        let promptParts = [];
        const systemPrompt = `You are an expert ATS (Applicant Tracking System) Analyzer.
        Compare the Candidate's CV against the Job Description.
        
        CRITICAL: Return a VALID JSON object in this EXACT format:
        {
            "score": 85,
            "matchLevel": "High", // Low, Medium, High
            "missingKeywords": ["List", "Of", "Important", "Missing", "Keywords"],
            "feedback": "A concise paragraph (3-4 sentences) explaining why the score is what it is and how to improve."
        }
        
        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
        
        Candidate CV:
        "${cvText}"
        `;
        promptParts.push(systemPrompt);

        let jdContent = "";
        if (jobDescription.type === 'image') {
            const base64Data = jobDescription.content.split(',')[1];
            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            });
            promptParts.push("\nJob Description is in the image above.");
            jdContent = "[Image Data]";
        } else {
            promptParts.push(`\nJob Description:\n"${jobDescription.content}"`);
            jdContent = jobDescription.content;
        }

        const service = AIProviderFactory.getService(provider, model);
        let text = await service.generate(promptParts);

        // Cleanup potential markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
        }

        // LOGGING
        // For array prompts (multimodal), we might need to stringify.
        const promptLog = typeof promptParts === 'string' ? promptParts : JSON.stringify(promptParts);

        logAITransaction({
            userId,
            actionType: 'analyze_cv',
            inputContext: `CV Length: ${cvText.length} chars`,
            jobDescriptionKeywords: { contentSnippet: jdContent.substring(0, 200) }, // Simplified JD log
            aiPrompt: promptLog,
            aiResponse: text,
            provider,
            model
        });

        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rewrite-cv', checkCredits, async (req, res) => {
    try {
        const { cvText, jobDescription, provider, model, userId } = req.body;

        let promptParts = [];
        const systemPrompt = `You are an expert Professional CV Writer & ATS Optimizer. 
        Your GOAL is to rewrite the CV to maximize the Applicant Tracking System (ATS) match score for the provided Job Description.
        
        STRATEGY:
        1. Analyze the Job Description for critical keywords (hard skills, soft skills, tools).
        2. naturally INTEGRATE these keywords into the Summary, Skills, and Experience sections.
        3. Maintain a professional, clean style (Indeed-style), but prioritizing KEYWORD DENSITY over extreme brevity if necessary to hit the match.
        4. Use strong action verbs.
        5. DO NOT hallucinate work experience, only enhance existing content.

        CRITICAL: You must return a VALID JSON object that matches this EXACT structure.
        
        {
            "personal": {
                "fullName": "Keep original",
                "email": "Keep original",
                "phone": "Keep original",
                "summary": "REWRITE THIS: 3-4 sentences. Must include the TOP 3-5 keywords from the JD. Focus on value proposition."
            },
            "skills": ["Extract ALL relevant technical skills/tools from CV + JD", "Add missing JD keywords here if the candidate likely has them"],
            "experience": [
                {
                    "id": 1,
                    "title": "Keep original or optimize title for JD",
                    "company": "Keep original",
                    "startDate": "Keep original",
                    "endDate": "Keep original",
                    "description": "REWRITE THIS: Bullet points. Integrate specific keywords from the JD contextually. Focus on achievements."
                }
                // ... include all experiences from the input CV
            ],
            "education": [
                {
                    "id": 1,
                    "degree": "Keep original",
                    "school": "Keep original",
                    "year": "Keep original"
                }
                 // ... include all education from the input CV
            ]
        }
    
        CV Content to Rewrite:
        "${cvText}"
        `;
        promptParts.push(systemPrompt);

        let jdContent = "";
        if (jobDescription.type === 'image') {
            const base64Data = jobDescription.content.split(',')[1];
            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            });
            promptParts.push("\nTarget Job Description is provided in the image above.");
            jdContent = "[Image Data]";
        } else {
            promptParts.push(`\nTarget Job Description:\n"${jobDescription.content}"`);
            jdContent = jobDescription.content;
        }

        const service = AIProviderFactory.getService(provider, model);
        let text = await service.generate(promptParts);

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
        }

        // LOGGING
        const promptLog = typeof promptParts === 'string' ? promptParts : JSON.stringify(promptParts);

        logAITransaction({
            userId,
            actionType: 'rewrite_cv',
            inputContext: `CV Length: ${cvText.length}`,
            jobDescriptionKeywords: { contentSnippet: jdContent.substring(0, 200) },
            aiPrompt: promptLog,
            aiResponse: text,
            provider,
            model
        });

        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Rewrite Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-cover-letter', checkCredits, async (req, res) => {
    try {
        const { userData, jobDescription, provider, model, userId } = req.body;

        const systemPrompt = `You are an expert Career Coach and Professional Resume Writer.
        Write a compelling, professional COVER LETTER for the candidate based on their CV data and the Job Description.

        GUIDELINES:
        - Format: Standard business letter format.
        - Tone: Professional, enthusiastic, confident, but not arrogant.
        - Structure:
            1. Salutation (Professional greeting).
            2. Hook: State the role applied for and why the candidate is excited/perfect fit.
            3. Body Paragraph 1: Connect specific skills/experience from CV to top requirements in JD.
            4. Body Paragraph 2: Soft skills, culture fit, or unique value prop.
            5. Conclusion: Call to action (request interview).
            6. Sign-off.
        - Length: 300-400 words max.
        - Do NOT use placeholders like [Insert Name] if you have the data. Use the provided name/email/phone.
        
        Candidate Data:
        ${JSON.stringify(userData)}

        Job Description:
        ${jobDescription.content || jobDescription}
        `;

        const service = AIProviderFactory.getService(provider, model);
        const text = await service.generate(systemPrompt);

        // LOGGING
        logAITransaction({
            userId,
            actionType: 'cover_letter',
            inputContext: `User Data Keys: ${Object.keys(userData).join(',')}`,
            aiPrompt: systemPrompt,
            aiResponse: text,
            provider,
            model
        });

        res.json({ coverLetter: text });

    } catch (error) {
        console.error("Cover Letter API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
