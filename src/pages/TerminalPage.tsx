import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Terminal as TerminalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Terminal from '@/components/Terminal';

export default function TerminalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono relative overflow-hidden tech-grid">
      {/* Top Navigation Bar */}
      <header className="w-full bg-background/80 backdrop-blur-md border-b border-border/60 py-4 px-6 flex justify-between items-center z-10 select-none">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="group hover:bg-secondary/50 text-muted-foreground hover:text-foreground font-mono text-sm py-1.5 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Website
          </Button>
          <div className="h-6 w-[1px] bg-border/60 mx-1 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>Secure connection established</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-accent">
          <TerminalIcon className="w-4 h-4" />
          <span>guest@bassani.io:~$ CLI Console</span>
        </div>
      </header>

      {/* Terminal Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        <div className="w-full max-w-5xl h-[calc(100vh-180px)] min-h-[450px]">
          <Terminal />
        </div>
      </main>
      
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
