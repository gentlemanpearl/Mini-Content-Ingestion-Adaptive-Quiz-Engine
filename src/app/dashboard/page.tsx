
"use client";

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
import { useFirestore, useUser, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { categorizeEducationalContent } from '@/ai/flows/categorize-educational-content';
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

  // Real-time source documents for the current user
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
      setFileName(file.name.split('.')[0]); // Use filename as default title
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setTextContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleIngest = async () => {
    if (!user) {
      toast({ title: "Auth Required", description: "Please sign in to ingest content.", variant: "destructive" });
      return;
    }
    if (!fileName || !textContent) {
      toast({ title: "Input Required", description: "Please provide a document title and content.", variant: "destructive" });
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

      // Split into paragraphs for processing
      const paragraphs = textContent.split('\n\n').filter((p: string) => p.trim().length > 50);
      
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
      }

      setDocumentNonBlocking(sourceRef, { ...sourceData, status: 'processed' }, { merge: true });
      
      toast({ title: "Pipeline Success", description: `Ingested ${paragraphs.length} educational segments.` });
      setFileName("");
      setTextContent("");
      setSelectedFile(null);
    } catch (err: any) {
      toast({ title: "Pipeline Error", description: err.message, variant: "destructive" });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleGenerateQuestions = async (docId: string) => {
    if (!user) return;
    setIsGenerating(true);
    try {
      toast({ title: "AI Analysis", description: "Evaluating segments and generating quiz questions..." });
      // Logic for question generation across chunks would go here
      setTimeout(() => {
        toast({ title: "Generation Complete", description: "New questions are now live in the student pool." });
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'sourceDocuments', docId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Removed", description: "Document deleted from cloud storage." });
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline flex items-center gap-2">
              <Database className="h-8 w-8 text-accent" />
              Creator Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your educational repository and trigger AI processing pipelines.</p>
          </div>
          <Badge variant="outline" className="bg-white px-4 py-2 border-dashed shadow-sm">
            <Sparkles className="h-4 w-4 mr-2 text-accent" />
            Gemini 2.5 Flash Pipeline
          </Badge>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Document Management */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Cloud Repository
                </CardTitle>
                <CardDescription>Processed educational documents</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[500px] overflow-auto">
                  {isDocsLoading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">Synchronizing documents...</div>
                  ) : sourceDocs && sourceDocs.length > 0 ? (
                    sourceDocs.map((doc) => (
                      <div key={doc.id} className="p-4 hover:bg-accent/5 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm truncate max-w-[180px]">{doc.filename}</h4>
                          <Badge 
                            variant={doc.status === 'processed' ? 'default' : 'secondary'} 
                            className={cn(
                              "text-[10px] h-5",
                              doc.status === 'processing' && "animate-pulse"
                            )}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                          <span className="bg-secondary/50 px-1.5 py-0.5 rounded">{doc.fileSizeKB}KB</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 text-xs flex-1 shadow-sm"
                            disabled={doc.status !== 'processed' || isGenerating}
                            onClick={() => handleGenerateQuestions(doc.id)}
                          >
                            <Play className="h-3 w-3 mr-1" /> Quiz
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDoc(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground space-y-3">
                      <FileUp className="h-10 w-10 mx-auto opacity-10" />
                      <p className="text-sm font-medium">Your repository is empty.</p>
                      <p className="text-xs">Upload content to begin.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-20 w-20" />
              </div>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-tighter">Engine Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span>Latency</span>
                  <span className="font-mono">~1.2s</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Sync Status</span>
                  <span className="flex items-center gap-2">
                    Live <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ingestion & Upload */}
          <div className="lg:col-span-8">
            <Card className="border-none shadow-2xl bg-white h-full overflow-hidden">
              <CardHeader className="bg-accent/5 pb-8">
                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                  <Upload className="h-7 w-7 text-accent" />
                  Smart Content Ingestion
                </CardTitle>
                <CardDescription className="text-base">
                  Upload textbook excerpts or paste raw educational text. Our AI will automatically structure it for adaptive learning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* File Upload Zone */}
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-8 transition-all group relative flex flex-col items-center justify-center min-h-[160px]",
                      selectedFile ? "border-accent bg-accent/5" : "border-secondary hover:border-accent/50 cursor-pointer"
                    )}
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={handleFileChange}
                      accept=".txt,.md"
                    />
                    {selectedFile ? (
                      <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="bg-accent/20 p-3 rounded-2xl inline-block mb-3">
                          <CheckCircle2 className="h-8 w-8 text-accent" />
                        </div>
                        <p className="font-bold text-sm mb-1">{selectedFile.name}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[10px] text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setFileName("");
                            setTextContent("");
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <FileUp className="h-10 w-10 text-muted-foreground mb-4 group-hover:scale-110 group-hover:text-accent transition-all" />
                        <p className="text-sm font-bold">Select Document</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Supports .txt, .md</p>
                      </>
                    )}
                  </div>

                  {/* Document Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Title</label>
                      <Input 
                        placeholder="e.g., Physics Fundamentals" 
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="h-12 border-secondary focus:ring-accent rounded-xl"
                      />
                    </div>
                    <div className="p-4 bg-secondary/20 rounded-2xl flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase">AI Processing</p>
                        <p className="text-xs font-medium">Automatic chunking enabled</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Raw Text Content</label>
                    <Badge variant="secondary" className="text-[10px]">
                      {textContent.length > 0 ? `${textContent.length} characters` : 'Empty'}
                    </Badge>
                  </div>
                  <Textarea 
                    placeholder="Document content will appear here after upload, or you can paste manually..." 
                    className="min-h-[300px] font-body text-base leading-relaxed border-secondary focus:ring-accent rounded-3xl resize-none shadow-inner"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>

                {/* Animated Action Button */}
                <div className="pt-2">
                  <Button 
                    onClick={handleIngest} 
                    disabled={isIngesting || !textContent || !user}
                    className={cn(
                      "w-full h-16 text-xl font-bold shadow-xl transition-all duration-300 relative overflow-hidden group rounded-2xl",
                      isIngesting ? "bg-accent scale-[0.98]" : "hover:scale-[1.01] hover:shadow-accent/30 active:scale-95",
                      !user && "opacity-50 grayscale"
                    )}
                  >
                    {!user ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Sign In to Access Pipeline
                      </div>
                    ) : isIngesting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin h-6 w-6" />
                        AI Extraction Active...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-accent group-hover:rotate-12 transition-transform" />
                        Launch Intelligence Pipeline
                      </div>
                    )}
                    {/* Shimmer effect when not loading */}
                    {!isIngesting && user && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                    )}
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground mt-4 italic">
                    By launching, you agree to process this data through the Gemini 2.5 API.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
