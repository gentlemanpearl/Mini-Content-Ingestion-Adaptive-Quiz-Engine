
# EduQuiz Architect | AI-Driven Adaptive Learning Platform

EduQuiz Architect is a high-performance educational platform that transforms static content into interactive, adaptive learning experiences using **Generative AI (Gemini 2.5 Flash)** and **Real-time Data Persistence (Firebase)**.

## 🚀 Key Features

- **Smart Content Ingestion**: Automated pipeline using **Google Genkit** to chunk, categorize, and tag educational content by grade, subject, and topic.
- **AI Quiz Generation**: Dynamically generates diverse questions (MCQ, True/False, Fill-in-the-blank) directly from source material using structured LLM output.
- **Adaptive Learning Engine**: A real-time assessment interface that adjusts difficulty based on a live "Cognitive Profile" stored in Firestore.
- **Admin Activity Monitor**: A real-time dashboard for educators to track system health and student performance using Firestore Collection Groups.
- **Professional UI**: Built with Next.js 15, ShadCN UI, and Tailwind CSS, featuring high-fidelity animated interaction triggers.

## 🏗️ Architecture

- **Frontend**: Next.js 15 (App Router) with React 19.
- **AI Engine**: **Google Genkit** + **Gemini 2.5 Flash**. Prompts are defined as type-safe "Flows".
- **Database**: **Cloud Firestore** for real-time synchronization and low-latency updates.
- **Authentication**: **Firebase Auth** (Google & Anonymous).
- **Styling**: Tailwind CSS + ShadCN UI.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- A Firebase Project (with Firestore and Auth enabled)
- A Google AI API Key

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your keys (see `.env.example`).

### 4. Running the Project
```bash
# Start the development server
npm run dev

# Start Genkit Developer UI (Optional)
npm run genkit:dev
```

## 🧪 Testing
1. **Ingestion**: Navigate to `/dashboard`, upload a `.txt` file, and click "Launch Intelligence Pipeline".
2. **Quiz**: Navigate to `/quiz` to take an adaptive assessment.
3. **Monitoring**: Visit `/admin` to see real-time analytics of student answers across the platform.

---
Built for the Peblo Challenge.
