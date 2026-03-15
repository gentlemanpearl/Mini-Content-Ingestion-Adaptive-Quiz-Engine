
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, BrainCircuit, LayoutDashboard, GraduationCap } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline text-xl font-bold text-primary">EduQuiz Architect</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" /> Admin Portal
            </Link>
            <Link href="/quiz" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 text-muted-foreground">
              <GraduationCap className="h-4 w-4" /> Student Quiz
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Log In</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
