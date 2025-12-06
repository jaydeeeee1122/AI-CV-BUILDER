
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function checkApi() {
    console.log(`Checking API Key: ${API_KEY.substring(0, 8)}...`);
    try {
        const response = await fetch(URL, { method: 'GET' });
        const data = await response.json();

        console.log(`Status Code: ${response.status}`);

        if (response.ok) {
            console.log("✅ API is reachable!");
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => console.log(` - ${m.name}`));
            } else {
                console.log("No models found in response list.");
            }
        } else {
            console.log("❌ API Verification Failed:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

checkApi();
