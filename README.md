# EduQuiz Architect | AI-Driven Adaptive Learning Platform

EduQuiz Architect is a high-performance educational tool that transforms static text documents into interactive, adaptive learning experiences using Generative AI (Gemini 2.5 Flash) and real-time data persistence (Firebase).

## 🚀 Key Features

- **Smart Content Ingestion**: Automated pipeline using **Genkit** to chunk, categorize, and tag educational content by grade, subject, and topic.
- **AI Quiz Generation**: Dynamically generates diverse questions (MCQ, True/False, Fill-in-the-blank) directly from source material.
- **Adaptive Learning Engine**: A real-time assessment interface that adjusts difficulty based on a live "Cognitive Profile" stored in Firestore.
- **Admin Activity Monitor**: A dashboard for educators to track system health and student performance using Firestore Collection Groups.
- **Professional UI**: Built with Next.js 15, ShadCN UI, and Tailwind CSS, featuring animated ingestion triggers.

## 🏗️ Architecture

- **Frontend**: Next.js 15 (App Router) with React 19.
- **AI Engine**: **Google Genkit** + **Gemini 2.5 Flash**. Prompts are defined as type-safe "Flows".
- **Database**: **Cloud Firestore** for real-time synchronization.
- **Authentication**: **Firebase Auth** (Google & Anonymous).
- **Styling**: Tailwind CSS + ShadCN UI.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- A Firebase Project
- A Google AI API Key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/gentlemanpearl/Mini-Content-Ingestion-Adaptive-Quiz-Engine.git
cd Mini-Content-Ingestion-Adaptive-Quiz-Engine

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```

### 4. Running the Project
```bash
# Start the development server
npm run dev
```

## 🧪 Testing
1. **Ingestion**: Navigate to `/dashboard`, upload a `.txt` file, and click "Launch Intelligence Pipeline".
2. **Quiz**: Navigate to `/quiz` to take an adaptive assessment.
3. **Monitoring**: Visit `/admin` to see real-time analytics.

## 🔐 Security
The project uses an **Owner-Centric Security Model** via Firestore Security Rules, ensuring data privacy and integrity.
