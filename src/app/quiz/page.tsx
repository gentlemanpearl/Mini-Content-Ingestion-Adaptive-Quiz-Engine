
"use client";

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BrainCircuit, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function QuizPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [skillLevel, setSkillLevel] = useState(50);
  const { toast } = useToast();

  const fetchQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quiz');
      const data = await res.json();
      setQuestions(data.questions);
      setSkillLevel(data.studentSkill);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load quiz.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'DEMO_USER',
          questionId: questions[currentIndex].id,
          selectedAnswer
        }),
      });
      const data = await res.json();
      setFeedback(data);
      setSkillLevel(data.newSkillLevel);
    } catch (err) {
      toast({ title: "Error", description: "Submission failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer("");
      setFeedback(null);
    } else {
      setQuizFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground font-headline">Generating adaptive quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md text-center p-8">
            <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="mb-2">No Content Available</CardTitle>
            <CardDescription className="mb-6">Please upload and process some educational materials in the Admin Portal first.</CardDescription>
            <Button asChild><a href="/dashboard">Go to Ingestion</a></Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Dynamic Assessment</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Student Performance</span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={skillLevel} className="w-32 h-2" />
              <span className="text-xs font-mono font-bold text-primary">{skillLevel}%</span>
            </div>
          </div>
        </div>

        {!quizFinished ? (
          <Card className="border-none shadow-xl">
            <CardHeader className="space-y-4">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="capitalize text-accent border-accent">
                  {currentQ.difficulty} Difficulty
                </Badge>
                <Badge variant="secondary">
                  {currentQ.type}
                </Badge>
              </div>
              <CardTitle className="text-2xl leading-relaxed text-foreground font-body">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQ.type === 'MCQ' ? (
                <div className="grid gap-3">
                  {currentQ.options.map((opt: string, i: number) => (
                    <button
                      key={i}
                      disabled={!!feedback}
                      onClick={() => setSelectedAnswer(opt)}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all
                        ${selectedAnswer === opt ? 'border-primary bg-primary/5' : 'border-secondary hover:border-primary/50'}
                        ${feedback && opt === feedback.correctAnswer ? 'border-green-500 bg-green-50' : ''}
                        ${feedback && selectedAnswer === opt && !feedback.correct ? 'border-destructive bg-destructive/5' : ''}
                      `}
                    >
                      <span className="font-medium mr-4 text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    disabled={!!feedback}
                    placeholder="Type your answer here..."
                    className="w-full p-4 text-lg border-2 border-secondary rounded-xl focus:border-primary outline-none transition-all"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                  />
                </div>
              )}

              {feedback && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-4 ${feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {feedback.correct ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <div>
                    <p className="font-bold">{feedback.correct ? "Excellent!" : "Not quite right."}</p>
                    <p className="text-sm opacity-90">Correct answer: {feedback.correctAnswer}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-6 border-t">
              {!feedback ? (
                <Button 
                  className="w-full h-12 text-lg" 
                  disabled={!selectedAnswer || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "Evaluating..." : "Submit Answer"}
                </Button>
              ) : (
                <Button className="w-full h-12 text-lg" onClick={handleNext}>
                  {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card className="text-center p-12 border-none shadow-xl">
            <div className="h-20 w-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-10 w-10 text-accent" />
            </div>
            <CardTitle className="text-3xl mb-4">Quiz Completed!</CardTitle>
            <CardDescription className="text-lg mb-8">
              Great job! Your current skill profile has been updated to <span className="font-bold text-primary">{skillLevel}%</span> based on your performance.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.reload()} size="lg">Try Another Topic</Button>
              <Button variant="outline" size="lg" asChild><a href="/">Back Home</a></Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
