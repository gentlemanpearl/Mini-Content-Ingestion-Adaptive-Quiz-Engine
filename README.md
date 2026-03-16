# EduQuiz Architect | AI-Driven Adaptive Learning
https://9000-firebase-studio-1773586908763.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev/
EduQuiz Architect is an educational platform that transforms static documents into interactive learning experiences using Generative AI and real-time data persistence.

## Features
- **Smart Ingestion**: Automated pipeline using Google Genkit to chunk and categorize content.
- **AI Quiz Generation**: Dynamically generates diverse questions directly from source material.
- **Adaptive Learning**: Real-time assessment interface that adjusts difficulty based on student performance.
- **Activity Monitor**: Dashboard for tracking system health and student performance.

## Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, ShadCN UI.
- **Backend**: Firebase Auth, Cloud Firestore.
- **AI Engine**: Google Genkit + Gemini 2.5 Flash.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Firebase Project with Firestore and Auth enabled.
- Google AI API Key (Gemini).

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```

### 4. Running the App
```bash
npm run dev
```

---
Built for the Peblo Challenge.
