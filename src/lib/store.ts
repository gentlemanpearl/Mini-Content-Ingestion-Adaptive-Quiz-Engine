
/**
 * Simple in-memory storage for demonstration.
 * In production, this would be a database like PostgreSQL or MongoDB.
 */

export interface SourceDocument {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface ContentChunk {
  id: string;
  sourceId: string;
  grade: number;
  subject: string;
  topic: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  sourceChunkId: string;
  question: string;
  type: 'MCQ' | 'True/False' | 'Fill in the blank';
  options?: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudentProfile {
  studentId: string;
  currentSkillLevel: number; // 0-100
  history: Array<{
    questionId: string;
    correct: boolean;
    timestamp: string;
  }>;
}

class InMemoryStore {
  documents: SourceDocument[] = [];
  chunks: ContentChunk[] = [];
  questions: QuizQuestion[] = [];
  profiles: Record<string, StudentProfile> = {};

  addDocument(doc: SourceDocument) {
    this.documents.push(doc);
  }

  addChunk(chunk: ContentChunk) {
    this.chunks.push(chunk);
  }

  addQuestions(questions: QuizQuestion[]) {
    this.questions.push(...questions);
  }

  getProfile(studentId: string): StudentProfile {
    if (!this.profiles[studentId]) {
      this.profiles[studentId] = {
        studentId,
        currentSkillLevel: 50,
        history: [],
      };
    }
    return this.profiles[studentId];
  }

  updateProfile(studentId: string, questionId: string, correct: boolean) {
    const profile = this.getProfile(studentId);
    profile.history.push({ questionId, correct, timestamp: new Date().toISOString() });
    
    // Adaptive Logic
    const delta = correct ? 8 : -8;
    profile.currentSkillLevel = Math.max(0, Math.min(100, profile.currentSkillLevel + delta));
  }

  getDifficultyForSkill(skill: number): 'easy' | 'medium' | 'hard' {
    if (skill < 33) return 'easy';
    if (skill < 66) return 'medium';
    return 'hard';
  }
}

export const store = new InMemoryStore();
