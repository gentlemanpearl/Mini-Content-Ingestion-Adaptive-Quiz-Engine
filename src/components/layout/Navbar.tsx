"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit, LayoutDashboard, GraduationCap, LogIn, Activity } from 'lucide-react';
import { useAuth, useUser, initiateAnonymousSignIn, initiateGoogleSignIn } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-primary p-2 rounded-lg">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline text-xl font-bold text-primary">EduQuiz Architect</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> Creator Portal
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Activity Monitor
            </Link>
            <Link href="/quiz" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> Student Quiz
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isUserLoading ? (
              <span className="text-sm text-muted-foreground animate-pulse">Checking auth...</span>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "Anonymous Student"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email || "No email provided"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Creator Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Activity Monitor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/quiz">Take Quiz</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => initiateAnonymousSignIn(auth)} className="hidden sm:inline-flex">
                  Guest
                </Button>
                <Button size="sm" onClick={() => initiateGoogleSignIn(auth)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <LogIn className="h-4 w-4 mr-2" /> Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}