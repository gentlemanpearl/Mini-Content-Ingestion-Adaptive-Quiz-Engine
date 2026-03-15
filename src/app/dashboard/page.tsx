
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Settings, Database, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [fileName, setFileName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [chunksCount, setChunksCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const { toast } = useToast();

  const handleIngest = async () => {
    if (!fileName || !textContent) {
      toast({ title: "Error", description: "Please provide a file name and text content.", variant: "destructive" });
      return;
    }

    setIsIngesting(true);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, text: textContent }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSourceId(data.sourceId);
      setChunksCount(data.chunksCount);
      toast({ title: "Success", description: `Ingested ${data.chunksCount} content chunks.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleGenerate = async () => {
    if (!sourceId) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setQuestionsCount(data.questionsCount);
      toast({ title: "Success", description: `Generated ${data.questionsCount} quiz questions.` });
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
          {/* Step 1: Ingestion */}
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
                disabled={isIngesting || !textContent}
                className="w-full h-12 text-lg"
              >
                {isIngesting ? "Processing..." : "Ingest & Chunk Content"}
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Management */}
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
                    <span className="font-mono font-medium">{sourceId || "N/A"}</span>
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
                    disabled={!sourceId || isGenerating}
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
