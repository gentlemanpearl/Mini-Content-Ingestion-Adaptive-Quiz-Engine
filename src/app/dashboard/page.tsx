
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Database, Play, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import { categorizeEducationalContent } from '@/ai/flows/categorize-educational-content';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions-flow';

export default function DashboardPage() {
  const [fileName, setFileName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceDocId, setSourceDocId] = useState<string | null>(null);
  const [chunksCount, setChunksCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const handleIngest = async () => {
    if (!user) {
      toast({ title: "Auth Required", description: "Please sign in to ingest content.", variant: "destructive" });
      return;
    }
    if (!fileName || !textContent) {
      toast({ title: "Error", description: "Please provide a file name and text content.", variant: "destructive" });
      return;
    }

    setIsIngesting(true);
    try {
      const sourceId = `SRC_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const sourceRef = doc(db, 'users', user.uid, 'sourceDocuments', sourceId);
      
      const sourceData = {
        id: sourceId,
        filename: fileName,
        uploadDate: new Date().toISOString(),
        fileSizeKB: Math.round(textContent.length / 1024),
        mimeType: 'text/plain',
        status: 'processing'
      };

      setDocumentNonBlocking(sourceRef, sourceData, { merge: true });

      const paragraphs = textContent.split('\n\n').filter((p: string) => p.trim().length > 50);
      let localChunksCount = 0;

      for (let i = 0; i < paragraphs.length; i++) {
        const chunkText = paragraphs[i];
        const category = await categorizeEducationalContent({
          textChunk: chunkText,
          fileName: fileName,
        });

        const chunkId = `CH_${i + 1}`;
        const chunkRef = doc(db, 'users', user.uid, 'sourceDocuments', sourceId, 'contentChunks', chunkId);
        
        const chunkData = {
          id: chunkId,
          sourceDocumentId: sourceId,
          chunkIndex: i + 1,
          grade: category.grade,
          subject: category.subject,
          topic: category.topic,
          text: chunkText,
          wordCount: chunkText.split(/\s+/).length,
          extractionDate: new Date().toISOString()
        };

        setDocumentNonBlocking(chunkRef, chunkData, { merge: true });
        localChunksCount++;
      }

      setSourceDocId(sourceId);
      setChunksCount(localChunksCount);
      toast({ title: "Success", description: `Ingested ${localChunksCount} content chunks.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleGenerate = async () => {
    if (!user || !sourceDocId) return;
    setIsGenerating(true);
    try {
      // In a real app, we'd fetch the chunks from Firestore here. 
      // For this prototype, we'll re-use the text content if it's still in state.
      const paragraphs = textContent.split('\n\n').filter((p: string) => p.trim().length > 50);
      let totalGenerated = 0;

      for (let i = 0; i < paragraphs.length; i++) {
        const chunkText = paragraphs[i];
        const category = await categorizeEducationalContent({
          textChunk: chunkText,
          fileName: fileName,
        });

        const questions = await generateQuizQuestions({
          sourceId: sourceDocId,
          chunkId: `CH_${i + 1}`,
          grade: category.grade,
          subject: category.subject,
          topic: category.topic,
          text: chunkText,
        });

        for (const q of questions) {
          const qId = `Q_${Math.random().toString(36).substr(2, 9)}`;
          const qRef = doc(db, 'quizQuestions', qId);
          
          const qData = {
            id: qId,
            sourceChunkId: `CH_${i + 1}`,
            questionText: q.question,
            questionType: q.type,
            options: q.options || [],
            correctAnswer: q.answer,
            difficulty: q.difficulty,
            generatedDate: new Date().toISOString(),
            ownerId: user.uid, // Required by security rules
            subject: category.subject,
            topic: category.topic,
            grade: category.grade
          };

          setDocumentNonBlocking(qRef, qData, { merge: true });
          totalGenerated++;
        }
      }

      setQuestionsCount(totalGenerated);
      toast({ title: "Success", description: `Generated ${totalGenerated} quiz questions.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Content Pipeline</h1>
            <p className="text-muted-foreground">Ingest raw educational content and transform it into structured quizzes.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" /> Database Export
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Step 1: Raw Content Ingestion
              </CardTitle>
              <CardDescription>
                Paste the text from your educational PDF here. The system will automatically chunk and categorize it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Name</label>
                <Input 
                  placeholder="e.g., Grade 4 Science - Plants" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text Content</label>
                <Textarea 
                  placeholder="Paste PDF text content here..." 
                  className="min-h-[300px] font-body leading-relaxed"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleIngest} 
                disabled={isIngesting || !textContent || !user}
                className="w-full h-12 text-lg"
              >
                {!user ? "Please Log In" : isIngesting ? "Processing..." : "Ingest & Chunk Content"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-accent" />
                  Pipeline Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Source ID:</span>
                    <span className="font-mono font-medium">{sourceDocId || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Content Chunks:</span>
                    <span className="font-medium">{chunksCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Questions Generated:</span>
                    <span className="font-medium">{questionsCount}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="secondary"
                    className="w-full h-12"
                    disabled={!sourceDocId || isGenerating}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? "AI Working..." : "Generate AI Quiz Questions"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">AI Services: Connected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Database: Online</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
