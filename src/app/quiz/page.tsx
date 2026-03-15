"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BrainCircuit, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, RotateCcw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, limit } from 'firebase/firestore';
import { Input } from '@/components/ui/input';

export default function QuizPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Memoize Firestore references for real-time quiz data
  const questionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'quizQuestions'), limit(20));
  }, [db, user]);
  
  const { data: questions, isLoading: questionsLoading } = useCollection(questionsQuery);

  const studentProfileRef = useMemoFirebase(() => 
    user ? doc(db, 'students', user.uid) : null
  , [db, user]);
  const { data: profile, isLoading: profileLoading } = useDoc(studentProfileRef);

  const skillLevel = profile?.currentSkillLevel || 50;

  const handleSubmit = async () => {
    if (!selectedAnswer || !user || !questions) return;
    const currentQ = questions[currentIndex];
    
    setIsSubmitting(true);
    try {
      const isCorrect = selectedAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
      
      const answerId = `ANS_${Date.now()}`;
      const answerRef = doc(db, 'students', user.uid, 'studentAnswers', answerId);
      
      const answerData = {
        id: answerId,
        studentId: user.uid,
        quizQuestionId: currentQ.id,
        submittedAnswer: selectedAnswer,
        isCorrect: isCorrect,
        submittedAt: new Date().toISOString(),
        difficultyAtTimeOfAnswer: currentQ.difficulty
      };

      setDocumentNonBlocking(answerRef, answerData, { merge: true });

      // Update Profile Skill Level
      const delta = isCorrect ? 5 : -5;
      const newSkill = Math.max(0, Math.min(100, skillLevel + delta));
      
      const profileUpdate = {
        id: user.uid,
        externalAuthId: user.uid,
        currentSkillLevel: newSkill,
        updatedAt: new Date().toISOString()
      };

      setDocumentNonBlocking(doc(db, 'students', user.uid), profileUpdate, { merge: true });

      setFeedback({
        correct: isCorrect,
        correctAnswer: currentQ.correctAnswer
      });
    } catch (err: any) {
      toast({ title: "Error", description: "Submission failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer("");
      setFeedback(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetProgress = () => {
    if (!user) return;
    const profileUpdate = {
      currentSkillLevel: 50,
      updatedAt: new Date().toISOString()
    };
    setDocumentNonBlocking(doc(db, 'students', user.uid), profileUpdate, { merge: true });
    setCurrentIndex(0);
    setSelectedAnswer("");
    setFeedback(null);
    setQuizFinished(false);
    toast({ title: "Progress Reset", description: "Your skill level has been returned to baseline." });
  };

  if (isAuthLoading || questionsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground font-headline">Syncing adaptive engine...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md text-center p-8 border-none shadow-2xl">
            <GraduationCap className="h-16 w-16 text-primary mx-auto mb-6 opacity-20" />
            <CardTitle className="text-2xl mb-4 font-headline">Student Authentication</CardTitle>
            <CardDescription className="text-lg mb-8 leading-relaxed">
              Sign in to access the adaptive quiz engine and track your learning progress across sessions.
            </CardDescription>
            <Button size="lg" className="w-full" asChild><a href="/">Back to Home</a></Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-secondary/20 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md text-center p-8 border-none shadow-2xl">
            <BrainCircuit className="h-16 w-16 text-accent mx-auto mb-6 opacity-20" />
            <CardTitle className="text-2xl mb-2 font-headline">Quiz Repository Empty</CardTitle>
            <CardDescription className="mb-8 leading-relaxed">No questions have been generated yet. Head to the Creator Portal to process some educational content.</CardDescription>
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <a href="/dashboard">Creator Portal</a>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-primary font-headline">Adaptive Assessment</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                Q {currentIndex + 1} / {questions.length}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Real-time Sync
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border">
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Skill Profile</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={skillLevel} className="w-32 h-2.5" />
                <span className="text-sm font-mono font-black text-primary">{skillLevel}%</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleResetProgress} title="Reset Progress" className="text-muted-foreground hover:text-destructive">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!quizFinished ? (
          <Card className="border-none shadow-2xl flex-1 flex flex-col">
            <CardHeader className="space-y-6 pb-8">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className={`capitalize font-bold px-3 py-1 ${
                  currentQ.difficulty === 'hard' ? 'text-destructive border-destructive bg-destructive/5' :
                  currentQ.difficulty === 'medium' ? 'text-accent border-accent bg-accent/5' :
                  'text-green-600 border-green-600 bg-green-50'
                }`}>
                  {currentQ.difficulty} Level
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium">
                  {currentQ.type}
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl leading-relaxed text-foreground font-body font-medium">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              {currentQ.type === 'MCQ' ? (
                <div className="grid gap-4">
                  {currentQ.options?.map((opt: string, i: number) => (
                    <button
                      key={i}
                      disabled={!!feedback}
                      onClick={() => setSelectedAnswer(opt)}
                      className={`
                        w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4
                        ${selectedAnswer === opt ? 'border-primary bg-primary/5 shadow-inner' : 'border-secondary bg-white hover:border-primary/40'}
                        ${feedback && opt === feedback.correctAnswer ? 'border-green-500 bg-green-50' : ''}
                        ${feedback && selectedAnswer === opt && !feedback.correct ? 'border-destructive bg-destructive/5' : ''}
                      `}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        selectedAnswer === opt ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-lg">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    disabled={!!feedback}
                    placeholder="Enter your response..."
                    className="h-16 text-xl p-6 border-2 border-secondary rounded-2xl focus:ring-accent"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                  />
                </div>
              )}

              {feedback && (
                <div className={`mt-8 p-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 ${feedback.correct ? 'bg-green-100/50 text-green-900' : 'bg-destructive/10 text-destructive'}`}>
                  <div className={`p-2 rounded-full ${feedback.correct ? 'bg-green-500' : 'bg-destructive'}`}>
                    {feedback.correct ? <CheckCircle2 className="h-6 w-6 text-white" /> : <XCircle className="h-6 w-6 text-white" />}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xl">{feedback.correct ? "Spot on!" : "Incorrect Answer"}</p>
                    <p className="text-lg opacity-90">
                      The correct response is: <span className="font-bold underline">{feedback.correctAnswer}</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-8 border-t bg-secondary/10 px-8 py-6 rounded-b-lg">
              {!feedback ? (
                <Button 
                  className="w-full h-14 text-xl font-bold shadow-xl transition-transform active:scale-95" 
                  disabled={!selectedAnswer || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "Engine evaluating..." : "Lock in Answer"}
                </Button>
              ) : (
                <Button className="w-full h-14 text-xl font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl" onClick={handleNext}>
                  {currentIndex === questions.length - 1 ? "Complete Assessment" : "Next Challenge"}
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card className="text-center p-16 border-none shadow-2xl flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="h-32 w-32 bg-accent/20 rounded-full flex items-center justify-center animate-bounce">
              <GraduationCap className="h-16 w-16 text-accent" />
            </div>
            <div className="space-y-4">
              <CardTitle className="text-5xl font-black font-headline text-primary">Session Finished!</CardTitle>
              <CardDescription className="text-2xl max-w-lg mx-auto leading-relaxed">
                Exceptional work. Your cognitive profile has been updated in real-time.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md pt-8">
              <Button onClick={() => window.location.reload()} size="lg" className="h-16 text-xl flex-1">
                New Quiz
              </Button>
              <Button variant="outline" size="lg" className="h-16 text-xl flex-1" asChild>
                <a href="/">Exit to Home</a>
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}