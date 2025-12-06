
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in .env file");
}

const findBestModel = async (apiKey) => {
    return "gemini-2.0-flash";
};

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

// --- AI ROUTES (Using gemini-2.0-flash) ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/enhance', async (req, res) => {
    try {
        const { text, instructions } = req.body;
        if (!API_KEY) throw new Error("Server missing API Key");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let prompt = "";
        if (instructions && instructions.trim() !== "") {
            prompt = `You are a professional CV writer. Write a professional, impactful, and concise CV profile summary based on the following keywords and skills. Use action verbs. Return ONLY the summary text, do not include any explanations or quotes.
        
        Keywords/Skills: "${instructions}"
        ${text ? `Draft/Context: "${text}"` : ""}`;
        } else {
            prompt = `You are a professional CV writer. Rewrite the following text to be more professional, impactful, and concise. Use action verbs. Return ONLY the rewritten text, do not include any explanations or quotes.
            
            Text to rewrite: "${text}"`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const enhancedText = response.text();

        res.json({ text: enhancedText.trim() });
    } catch (error) {
        console.error("Enhance Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analyze-cv', async (req, res) => {
    try {
        console.log("Analyze-CV Request for Model: gemini-2.0-flash");
        const { cvText, jobDescription } = req.body;
        if (!API_KEY) throw new Error("Server missing API Key");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let promptParts = [];
        const systemPrompt = `You are an expert ATS (Applicant Tracking System) and Technical Recruiter. 
        Compare the provided CV content against the Job Description.
        
        Output a JSON object with the following structure (do NOT use markdown code blocks, just raw JSON):
        {
            "score": number (0-100),
            "missingKeywords": ["keyword1", "keyword2"],
            "recommendations": ["rec1", "rec2"],
            "tailoredSummary": "A rewritten professional summary for the CV that targets this specific job."
        }
        
        CV Content:
        "${cvText}"
        `;
        promptParts.push(systemPrompt);

        if (jobDescription.type === 'image') {
            const base64Data = jobDescription.content.split(',')[1];
            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            });
            promptParts.push("\nJob Description is provided in the image above.");
        } else {
            promptParts.push(`\nJob Description:\n"${jobDescription.content}"`);
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rewrite-cv', async (req, res) => {
    try {
        const { cvText, jobDescription } = req.body;
        if (!API_KEY) throw new Error("Server missing API Key");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let promptParts = [];
        const systemPrompt = `You are an expert Professional CV Writer & ATS Optimizer. 
        Your GOAL is to rewrite the CV to maximize the Applicant Tracking System (ATS) match score for the provided Job Description.
        
        STRATEGY:
        1. Analyze the Job Description for critical keywords (hard skills, soft skills, tools).
        2. naturally INTEGRATE these keywords into the Summary, Skills, and Experience sections.
        3. Maintain a professional, clean style (Indeed-style), but prioritizing KEYWORD DENSITY over extreme brevity if necessary to hit the match.
        4. Use strong action verbs.

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

        if (jobDescription.type === 'image') {
            const base64Data = jobDescription.content.split(',')[1];
            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            });
            promptParts.push("\nTarget Job Description is provided in the image above.");
        } else {
            promptParts.push(`\nTarget Job Description:\n"${jobDescription.content}"`);
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Rewrite Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-cover-letter', async (req, res) => {
    try {
        const { userData, jobDescription } = req.body;
        if (!API_KEY) throw new Error("Server missing API Key");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

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
