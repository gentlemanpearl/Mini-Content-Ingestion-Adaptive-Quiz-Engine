
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BrainCircuit, FileText, Database, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent-foreground text-sm font-medium mb-4">
              <BrainCircuit className="h-4 w-4 mr-2" />
              Powered by GenAI
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary leading-tight">
              Transform Educational Content Into <span className="text-accent">Intelligent Quizzes</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-driven pipeline processes PDFs, structures content, and generates adaptive quizzes that evolve with every student's response.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-lg font-medium group">
                  Start Ingesting
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg font-medium">
                  Try Student View
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Content Ingestion</CardTitle>
                  <CardDescription>
                    Automated PDF processing with intelligent text extraction and categorization.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Clean Segment/Chunking
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Metadata Mapping
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                    <BrainCircuit className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>GenAI Generation</CardTitle>
                  <CardDescription>
                    LLM-powered question creation for MCQs, True/False, and Fill-in-the-blanks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Source Traceability
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Difficulty Calibration
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Adaptive Learning</CardTitle>
                  <CardDescription>
                    Dynamic difficulty adjustment based on student performance metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Real-time Adjustments
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Skill Gap Analysis
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 EduQuiz Architect. Built for the Peblo Challenge.
        </div>
      </footer>
    </div>
  );
}
