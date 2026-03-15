"use client";

import { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Users, 
  FileQuestion, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  BrainCircuit, 
  History,
  ArrowUpRight
} from 'lucide-react';
import { 
  useFirestore, 
  useUser, 
  useCollection, 
  useMemoFirebase 
} from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  collectionGroup 
} from 'firebase/firestore';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { Badge } from '@/components/ui/badge';

export default function AdminActivityPage() {
  const db = useFirestore();
  const { user } = useUser();

  // Global monitoring queries
  const questionsQuery = useMemoFirebase(() => query(collection(db, 'quizQuestions')), [db]);
  const studentsQuery = useMemoFirebase(() => query(collection(db, 'students')), [db]);
  const recentAnswersQuery = useMemoFirebase(() => 
    query(collectionGroup(db, 'studentAnswers'), orderBy('submittedAt', 'desc'), limit(15))
  , [db]);

  const { data: questions } = useCollection(questionsQuery);
  const { data: students } = useCollection(studentsQuery);
  const { data: recentAnswers } = useCollection(recentAnswersQuery);

  // Derived Analytics
  const stats = useMemo(() => {
    if (!recentAnswers) return { correct: 0, total: 0, rate: 0 };
    const correct = recentAnswers.filter(a => a.isCorrect).length;
    const total = recentAnswers.length;
    return {
      correct,
      total,
      rate: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  }, [recentAnswers]);

  const pieData = [
    { name: 'Correct', value: stats.correct, color: 'hsl(var(--accent))' },
    { name: 'Incorrect', value: stats.total - stats.correct, color: 'hsl(var(--destructive))' }
  ];

  const difficultyData = useMemo(() => {
    if (!questions) return [];
    const counts = questions.reduce((acc: any, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: 'Easy', count: counts.easy || 0 },
      { name: 'Medium', count: counts.medium || 0 },
      { name: 'Hard', count: counts.hard || 0 },
    ];
  }, [questions]);

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary/10">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Card className="p-8 text-center max-w-md border-none shadow-xl">
            <Activity className="h-12 w-12 text-primary mx-auto mb-4 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">Please sign in with an administrator account to monitor system activity.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/5">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary font-headline flex items-center gap-3">
              <Activity className="h-8 w-8 text-accent" />
              Activity Monitor
            </h1>
            <p className="text-muted-foreground mt-2">Real-time system health and student performance analytics.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Live Feed Active</span>
          </div>
        </header>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Students", value: students?.length || 0, icon: Users, color: "text-blue-600" },
            { label: "AI Generated Questions", value: questions?.length || 0, icon: FileQuestion, color: "text-purple-600" },
            { label: "Recent Accuracy", value: `${stats.rate}%`, icon: TrendingUp, color: "text-green-600" },
            { label: "Active Pipelines", value: 1, icon: BrainCircuit, color: "text-accent" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg bg-secondary/50 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Recent Activity Feed */}
          <Card className="lg:col-span-8 border-none shadow-xl">
            <CardHeader className="border-b bg-white/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Latest Quiz Submissions
                  </CardTitle>
                  <CardDescription>Live stream of student interactions</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {recentAnswers?.length || 0} Events
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[600px] overflow-auto">
                {recentAnswers?.map((ans) => (
                  <div key={ans.id} className="p-4 hover:bg-accent/5 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${ans.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {ans.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold truncate max-w-[120px]">
                            Student {ans.studentId.substring(0, 6)}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ans.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Answered {ans.difficultyAtTimeOfAnswer} question
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        ID: {ans.id.substring(4, 10)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {!recentAnswers?.length && (
                  <div className="p-20 text-center text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-4 opacity-10" />
                    <p>No activity recorded yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Side Charts */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="text-lg">System Accuracy</CardTitle>
                <CardDescription className="text-primary-foreground/70">Correct vs Incorrect responses</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <div className="bg-secondary/20 p-4 grid grid-cols-2 text-center text-sm">
                <div className="border-r">
                  <p className="font-bold text-accent">{stats.correct}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="font-bold text-destructive">{stats.total - stats.correct}</p>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Question Difficulty</CardTitle>
                <CardDescription>Generated questions by level</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}