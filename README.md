# EduQuiz Architect | AI-Driven Adaptive Learning Platform

EduQuiz Architect is a sophisticated educational tool that transforms static text and documents into interactive, adaptive learning experiences using Generative AI.

## 🚀 Key Features

- **Smart Content Ingestion**: Automated pipeline using **Gemini 2.5 Flash** (via Google Genkit) to chunk, categorize, and tag educational content.
- **AI Quiz Generation**: Dynamically generates Multiple Choice, True/False, and Fill-in-the-blank questions directly from source material.
- **Adaptive Learning Engine**: A real-time assessment interface that adjusts difficulty based on a live "Cognitive Profile" stored in Firestore.
- **Admin Activity Monitor**: A high-level dashboard for educators to track student performance and system health using Firestore Collection Groups.
- **Professional UI/UX**: Built with Next.js 15, ShadCN UI, and Tailwind CSS.

## 🏗️ Architecture

- **Frontend**: Next.js 15 (App Router) with React 19.
- **AI Engine**: **Google Genkit** + **Gemini 2.5 Flash**. Prompts are defined as "Flows" for structured, type-safe AI outputs.
- **Database**: **Cloud Firestore** for real-time synchronization of educational content and student progress.
- **Authentication**: **Firebase Auth** supporting Google Sign-In and Anonymous sessions.
- **Styling**: Tailwind CSS + ShadCN UI components for a modern, responsive interface.
- **Analytics**: Recharts for visualizing student performance in the Admin Monitor.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- A Firebase Project ([Firebase Console](https://console.firebase.google.com/))
- A Google AI API Key (from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/gentlemanpearl/Mini-Content-Ingestion-Adaptive-Quiz-Engine.git
cd Mini-Content-Ingestion-Adaptive-Quiz-Engine

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add your API key:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```
Refer to `.env.example` for the required variables.

### 4. Firebase Configuration
Update the `src/firebase/config.ts` file with your Firebase project credentials obtained from the Firebase Console.

### 5. Running the Project
```bash
# Start the development server
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🧪 Testing
- **Ingestion**: Navigate to `/dashboard`, upload a `.txt` file, and click "Launch Intelligence Pipeline".
- **Quiz**: Navigate to `/quiz` to take an adaptive assessment generated from your content.
- **Monitoring**: Visit `/admin` to see real-time performance analytics.

## 🔐 Security
The project implements an **Owner-Centric Security Model** via Firestore Security Rules, ensuring students only access their own profiles while administrators have cross-collection monitoring capabilities.
