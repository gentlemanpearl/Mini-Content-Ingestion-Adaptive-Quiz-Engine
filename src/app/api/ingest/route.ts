
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { categorizeEducationalContent } from '@/ai/flows/categorize-educational-content';

export async function POST(req: Request) {
  try {
    const { fileName, text } = await req.json();

    if (!text || !fileName) {
      return NextResponse.json({ error: 'Missing content or filename' }, { status: 400 });
    }

    const sourceId = `SRC_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    store.addDocument({
      id: sourceId,
      name: fileName,
      uploadedAt: new Date().toISOString(),
    });

    // Chunking Logic: Simplified for demo - split by paragraphs or max length
    const paragraphs = text.split('\n\n').filter((p: string) => p.trim().length > 50);
    
    const chunks = [];
    for (let i = 0; i < paragraphs.length; i++) {
      const chunkText = paragraphs[i];
      const chunkId = `${sourceId}_CH_${i + 1}`;

      // AI Step: Categorize each chunk
      const category = await categorizeEducationalContent({
        textChunk: chunkText,
        fileName: fileName,
      });

      const chunk = {
        id: chunkId,
        sourceId,
        grade: category.grade,
        subject: category.subject,
        topic: category.topic,
        text: chunkText,
      };

      store.addChunk(chunk);
      chunks.push(chunk);
    }

    return NextResponse.json({ sourceId, chunksCount: chunks.length });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
