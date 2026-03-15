# EduQuiz Architect | AI-Driven Adaptive Learning Platform

EduQuiz Architect is a sophisticated educational tool that transforms static text and documents into interactive, adaptive learning experiences using Generative AI.

## 🚀 Key Features

- **Smart Content Ingestion**: Automated pipeline using **Gemini 2.5 Flash** (via Google Genkit) to chunk, categorize, and tag educational content by subject, topic, and grade level.
- **AI Quiz Generation**: Dynamically generates Multiple Choice, True/False, and Fill-in-the-blank questions directly from uploaded source material.
- **Adaptive Learning Engine**: A real-time student assessment interface that adjusts question difficulty based on a live "Cognitive Profile" stored in Firestore.
- **Admin Activity Monitor**: A high-level dashboard for educators to track global student performance, accuracy rates, and system health using Firestore Collection Groups.
- **Professional UI/UX**: Built with Next.js 15, ShadCN UI, and Tailwind CSS, featuring high-fidelity animations and responsive design.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI Engine**: Google Genkit + Gemini 2.5 Flash
- **Backend**: Firebase (Authentication & Cloud Firestore)
- **Styling**: Tailwind CSS + ShadCN UI
- **Visualization**: Recharts for real-time analytics

## 🔐 Security

The project implements a robust **Owner-Centric Security Model** via Firestore Security Rules, ensuring:
- Private "Creator" repositories for educators.
- Protected "Student" profiles and progress data.
- Global monitoring capabilities for administrative oversight.
