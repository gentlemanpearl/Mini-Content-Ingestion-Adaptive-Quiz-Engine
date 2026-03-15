
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId') || 'DEMO_USER';
  const topic = searchParams.get('topic');

  const profile = store.getProfile(studentId);
  const preferredDifficulty = store.getDifficultyForSkill(profile.currentSkillLevel);

  let pool = store.questions;

  if (topic) {
    const chunksWithTopic = store.chunks.filter(c => c.topic.toLowerCase().includes(topic.toLowerCase()));
    const chunkIds = new Set(chunksWithTopic.map(c => c.id));
    pool = pool.filter(q => chunkIds.has(q.sourceChunkId));
  }

  // Adaptive selection: Prioritize questions matching student skill level
  let filtered = pool.filter(q => q.difficulty === preferredDifficulty);
  
  // Fallback if not enough matching difficulty
  if (filtered.length < 5) {
    filtered = pool;
  }

  // Shuffle and pick 10
  const quiz = filtered.sort(() => 0.5 - Math.random()).slice(0, 10);

  return NextResponse.json({
    studentSkill: profile.currentSkillLevel,
    targetDifficulty: preferredDifficulty,
    questions: quiz.map(({ id, question, type, options, difficulty }) => ({
      id, question, type, options, difficulty
    }))
  });
}
