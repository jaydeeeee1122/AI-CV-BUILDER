
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

// Rate Limiter: 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

const API_KEY = process.env.GEMINI_API_KEY;

// Check if API key is present
if (!API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in .env file");
}

const findBestModel = async (apiKey) => {
    // Default to Flash for speed and cost-effectiveness
    return "gemini-1.5-flash";
};

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Enhance Text
app.post('/api/enhance', async (req, res) => {
    try {
        const { text, instructions } = req.body;
        if (!API_KEY) throw new Error("Server missing API Key");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

// Analyze CV (Job Match)
app.post('/api/analyze-cv', async (req, res) => {
    try {
        const { cvText, jobDescription } = req.body;
        if (!API_KEY) throw new Error("Server missing API Key");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        // Clean markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Rewrite CV
app.post('/api/rewrite-cv', async (req, res) => {
    try {
        const { cvText, jobDescription } = req.body;
        if (!API_KEY) throw new Error("Server missing API Key");

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let promptParts = [];
        const systemPrompt = `You are an expert Professional CV Writer. 
        Rewrite the provided CV content to perfectly target the Job Description.
        
        CRITICAL: You must return a VALID JSON object that matches this EXACT structure. Do not change the structure keys.
        
        {
            "personal": {
                "fullName": "Keep original",
                "email": "Keep original",
                "phone": "Keep original",
                "summary": "REWRITE THIS: A powerful, keyword-rich professional summary targeting the job."
            },
            "experience": [
                {
                    "id": 1,
                    "title": "Keep original or optimize",
                    "company": "Keep original",
                    "startDate": "Keep original",
                    "endDate": "Keep original",
                    "description": "REWRITE THIS: Use bullet points (•). Focus on achievements and metrics relevant to the JD. Use action verbs."
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

        // Clean markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(text));

    } catch (error) {
        console.error("Rewrite Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Catch-all for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
