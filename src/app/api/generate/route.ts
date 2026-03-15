
import { NextResponse } from 'next/server';
import { store, QuizQuestion } from '@/lib/store';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions-flow';

export async function POST(req: Request) {
  try {
    const { sourceId } = await req.json();
    
    const sourceChunks = store.chunks.filter(c => c.sourceId === sourceId);
    
    if (sourceChunks.length === 0) {
      return NextResponse.json({ error: 'No chunks found for this source' }, { status: 404 });
    }

    let totalGenerated = 0;
    for (const chunk of sourceChunks) {
      const questions = await generateQuizQuestions({
        sourceId: chunk.sourceId,
        chunkId: chunk.id,
        grade: chunk.grade,
        subject: chunk.subject,
        topic: chunk.topic,
        text: chunk.text,
      });

      const mappedQuestions: QuizQuestion[] = questions.map(q => ({
        id: `Q_${Math.random().toString(36).substr(2, 9)}`,
        sourceChunkId: chunk.id,
        question: q.question,
        type: q.type,
        options: q.options,
        answer: q.answer,
        difficulty: q.difficulty,
      }));

      store.addQuestions(mappedQuestions);
      totalGenerated += mappedQuestions.length;
    }

    return NextResponse.json({ questionsCount: totalGenerated });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
