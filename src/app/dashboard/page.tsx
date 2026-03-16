'use client';

import { useState, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Play, 
  Upload, 
  Trash2, 
  Clock, 
  FileText, 
  FileUp, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useFirestore, 
  useUser, 
  useCollection, 
  useMemoFirebase, 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase';
import { doc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { categorizeEducationalContent } from '@/ai/flows/categorize-educational-content';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions-flow';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [fileName, setFileName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const sourceDocsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'sourceDocuments'),
      orderBy('uploadDate', 'desc')
    );
  }, [db, user]);
  
  const { data: sourceDocs, isLoading: isDocsLoading } = useCollection(sourceDocsQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name.split('.')[0]);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setTextContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleIngest = async () => {
    if (!user) return;
    if (!fileName || !textContent) {
      toast({ title: "Input Required", description: "Please provide a title and content.", variant: "destructive" });
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
        mimeType: selectedFile?.type || 'text/plain',
        status: 'processing'
      };

      setDocumentNonBlocking(sourceRef, sourceData, { merge: true });

      const paragraphs = textContent.split('\n\n').filter(p => p.trim().length > 50);
      
      for (let i = 0; i < paragraphs.length; i++) {
        const chunkText = paragraphs[i];
        const category = await categorizeEducationalContent({
          textChunk: chunkText,
          fileName: fileName,
        });

        const chunkId = `CH_${i + 1}`;
        const chunkRef = doc(db, 'users', user.uid, 'sourceDocuments', sourceId, 'contentChunks', chunkId);
        
        setDocumentNonBlocking(chunkRef, {
          id: chunkId,
          sourceDocumentId: sourceId,
          chunkIndex: i + 1,
          grade: category.grade,
          subject: category.subject,
          topic: category.topic,
          text: chunkText,
          extractionDate: new Date().toISOString()
        }, { merge: true });
      }

      setDocumentNonBlocking(sourceRef, { ...sourceData, status: 'processed' }, { merge: true });
      toast({ title: "Ingestion Complete", description: `Processed ${paragraphs.length} segments.` });
      setFileName("");
      setTextContent("");
      setSelectedFile(null);
    } catch (err: any) {
      toast({ title: "Ingestion Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleGenerateQuestions = async (sourceId: string) => {
    if (!user) return;
    setIsGenerating(true);
    try {
      toast({ title: "AI Generation", description: "Analyzing segments..." });
      
      const chunksRef = collection(db, 'users', user.uid, 'sourceDocuments', sourceId, 'contentChunks');
      const chunksSnapshot = await getDocs(chunksRef);
      
      let totalQuestions = 0;
      for (const chunkDoc of chunksSnapshot.docs) {
        const chunk = chunkDoc.data();
        const questions = await generateQuizQuestions({
          text: chunk.text,
          grade: chunk.grade,
          subject: chunk.subject,
          topic: chunk.topic,
        });

        questions.forEach((q) => {
          const qId = `Q_${Math.random().toString(36).substr(2, 9)}`;
          const qRef = doc(db, 'quizQuestions', qId);
          setDocumentNonBlocking(qRef, {
            id: qId,
            sourceChunkId: chunk.id,
            questionText: q.question,
            questionType: q.type,
            options: q.options || [],
            correctAnswer: q.answer,
            difficulty: q.difficulty,
            generatedDate: new Date().toISOString()
          }, { merge: true });
          totalQuestions++;
        });
      }

      toast({ title: "Success", description: `Generated ${totalQuestions} questions.` });
    } catch (err: any) {
      toast({ title: "Generation Error", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'sourceDocuments', docId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Removed", description: "Document deleted." });
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Database className="h-8 w-8 text-accent" />
              Creator Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your educational repository.</p>
          </div>
          <Badge variant="outline" className="bg-white px-4 py-2 border-dashed">
            <Sparkles className="h-4 w-4 mr-2 text-accent" />
            Gemini 2.5 Flash Pipeline
          </Badge>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-4 border-none shadow-xl">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-auto">
                {isDocsLoading ? (
                  <div className="p-12 text-center animate-pulse">Syncing...</div>
                ) : sourceDocs?.map((doc) => (
                  <div key={doc.id} className="p-4 hover:bg-accent/5 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm truncate max-w-[150px]">{doc.filename}</h4>
                      <Badge variant={doc.status === 'processed' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" size="sm" className="flex-1"
                        disabled={doc.status !== 'processed' || isGenerating}
                        onClick={() => handleGenerateQuestions(doc.id)}
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 mr-1" />} Generate
                      </Button>
                      <Button 
                        variant="ghost" size="sm" className="text-destructive"
                        onClick={() => handleDeleteDoc(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 border-none shadow-2xl">
            <CardHeader className="bg-accent/5">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Upload className="h-7 w-7 text-accent" />
                Smart Ingestion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center min-h-[160px] cursor-pointer",
                    selectedFile ? "border-accent bg-accent/5" : "border-secondary hover:border-accent"
                  )}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".txt,.md" />
                  {selectedFile ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
                      <p className="font-bold text-sm">{selectedFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-sm font-bold">Select Document</p>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <Input placeholder="Document Title" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                </div>
              </div>
              <Textarea 
                placeholder="Paste content here..." 
                className="min-h-[250px] rounded-2xl"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <Button 
                onClick={handleIngest} 
                disabled={isIngesting || !textContent || !user}
                className="w-full h-14 text-lg font-bold shadow-xl transition-all"
              >
                {isIngesting ? <Loader2 className="animate-spin h-6 w-6" /> : <Sparkles className="h-6 w-6 mr-2" />}
                {isIngesting ? "Extracting..." : "Launch Intelligence Pipeline"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}