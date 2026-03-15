
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { studentId, questionId, selectedAnswer } = await req.json();

    const question = store.questions.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = selectedAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    
    store.updateProfile(studentId, questionId, isCorrect);
    const newProfile = store.getProfile(studentId);

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: question.answer,
      newSkillLevel: newProfile.currentSkillLevel,
      newDifficulty: store.getDifficultyForSkill(newProfile.currentSkillLevel)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
