
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Checking API Key availability...");

        // Check standard Flash
        console.log("Checking gemini-1.5-flash (alias)...");
        try {
            const flash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const flashResult = await flash.generateContent("Hello");
            console.log("✅ gemini-1.5-flash Works:", flashResult.response.text());
            return;
        } catch (e) { console.log("❌ gemini-1.5-flash Failed:", e.message); }

        // Check specific version
        console.log("Checking gemini-1.5-flash-001...");
        try {
            const flash1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            const res1 = await flash1.generateContent("Hello");
            console.log("✅ gemini-1.5-flash-001 Works:", res1.response.text());
            return;
        } catch (e) { console.log("❌ gemini-1.5-flash-001 Failed:", e.message); }

        // Check 8b
        console.log("Checking gemini-1.5-flash-8b...");
        try {
            const flash8b = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
            const res8b = await flash8b.generateContent("Hello");
            console.log("✅ gemini-1.5-flash-8b Works:", res8b.response.text());
            return;
        } catch (e) { console.log("❌ gemini-1.5-flash-8b Failed:", e.message); }

    } catch (error) {
        console.error("Fatal Error:", error.message);
    }
}

listModels();
