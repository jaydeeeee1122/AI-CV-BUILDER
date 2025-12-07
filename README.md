# AI CV Builder 🚀

A next-generation, AI-powered Resume Builder designed to help you craft the perfect CV and beat Applicant Tracking Systems (ATS).

## ✨ Features

- **🤖 AI-Powered Writing**:
  - **Resume Enhancement**: Optimizes your descriptions with strong action verbs and professional tone.
  - **Job Match Analysis**: Compares your CV against a specific Job Description to give you an ATS Match Score and feedback.
  - **Smart Rewrite**: Automatically tailors your CV content to a specific job description.
  - **Hybrid AI Support**: Switch between Cloud (Gemini) for speed or **Local (Ollama)** for privacy and free usage.

- **🎨 Premium Editor**:
  - **Drag & Drop**: Easily reorder Experience and Education sections.
  - **Real-time Preview**: Split-screen view to see changes instantly.
  - **Modern Templates**: Professional designs that are ATS-friendly.
  - **Smart Date Pickers**: Month/Year selection with automatic duration calculation.

- **📄 Robust PDF Export**:
  - High-quality PDF generation that maintains formatting.
  - **ATS-Friendly parsing**: Built-in PDF reader to analyze your existing resume.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (Glassmorphism & Premium Design System)
- **Backend**: Express.js, Node.js
- **AI Integration**: Google Gemini API, Ollama (Local LLM)
- **Database**: Supabase (PostgreSQL) - *Optional for local dev, used for user persistence*
- **Payments**: Stripe Integration - *Ready for SaaS deployment*

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **Ollama** (Optional, for local AI features). [Download Ollama](https://ollama.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jaydeeeee1122/AI-CV-BUILDER.git
   cd AI-CV-BUILDER
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory. You can copy the structure below:
   ```env
   # Backend Server Port
   PORT=3000

   # Database (Supabase)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key

   # AI Providers
   GEMINI_API_KEY=your_gemini_api_key

   # Payments (Stripe)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

### Running the Application

You need to run both the **Backend** (for API/AI features) and the **Frontend** (for the UI).

1. **Start the Backend Server**:
   ```bash
   npm start
   ```
   *Runs on http://localhost:3000*

2. **Start the Frontend (in a new terminal)**:
   ```bash
   npm run dev
   ```
   *Runs on http://localhost:5173*

3. **(Optional) Run Local AI**:
   If you want to use the free Local AI features:
   - Make sure Ollama is installed.
   - Run in a terminal: `ollama serve`
   - Pull the model: `ollama pull llama3` (or your preferred model).
   - In the App, go to **Settings** and select **Ollama**. Click "Test Connection" to verify.

## 🐛 Troubleshooting

- **PDFs not opening/uploading?**
  - We use a local worker file for reliability. If issues persist, ensure `public/pdf.worker.min.mjs` exists.
- **Ollama not working?**
  - Ensure `ollama serve` is running in a separate terminal window.
  - Check that you have pulled the model specified in Settings (default `llama3`).
  - Use the "Test Connection" button in Settings to debug.
- **Credit Balance issues?**
  - Use the local AI (Ollama) to bypass credit requirements for testing.

## 📝 License

This project is licensed under the MIT License.
