import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Calendar, Flag, Trophy, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CTFWriteup, loadCTFWriteupContent } from '@/data/ctf';
import 'highlight.js/styles/github-dark.css';

interface CTFViewProps {
  ctfWriteup: CTFWriteup;
  onBack: () => void;
}

const CTFView = ({ ctfWriteup, onBack }: CTFViewProps) => {
  const [content, setContent] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      const markdownContent = await loadCTFWriteupContent(ctfWriteup.contentPath);
      setContent(markdownContent);
      setIsLoading(false);
    };

    loadContent();
  }, [ctfWriteup.contentPath]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'destructive';
      case 'insane': return 'accent';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web': return '🌐';
      case 'pwn': return '💥';
      case 'crypto': return '🔐';
      case 'forensics': return '🔍';
      case 'reversing': return '⚙️';
      case 'osint': return '🕵️';
      default: return '🚩';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div 
          className="h-full bg-gradient-primary transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-4 border-primary/30 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CTF Solves
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge 
              variant="secondary" 
              className={`tag bg-${getDifficultyColor(ctfWriteup.difficulty)}/20 border-${getDifficultyColor(ctfWriteup.difficulty)}/40 text-${getDifficultyColor(ctfWriteup.difficulty)}`}
            >
              {ctfWriteup.difficulty.toUpperCase()}
            </Badge>
            <span className="text-2xl">{getCategoryIcon(ctfWriteup.category)}</span>
            <span className="text-sm text-muted-foreground font-mono">
              {ctfWriteup.points} pts
            </span>
          </div>
          
          <h1 className="text-3xl font-mono font-bold gradient-text mb-2">
            {ctfWriteup.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(ctfWriteup.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {ctfWriteup.competition}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary Card */}
        <Card className="mb-8 animated-border">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Flag className="w-5 h-5 mr-2 text-primary" />
              Challenge Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{ctfWriteup.summary}</p>
            <div className="flex flex-wrap gap-2">
              {ctfWriteup.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="tag">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTF Content */}
        <Card className="card-hover">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading CTF writeup...</div>
              </div>
            ) : (
              <div className="prose prose-invert prose-green max-w-none [&>*]:max-w-none [&_pre]:overflow-x-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code: ({ className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !className;
                      
                      return !isInline && match ? (
                        <div className="my-4 rounded-lg border border-border bg-muted/20">
                          <div className="px-3 py-1.5 bg-muted/40 border-b border-border">
                            <span className="text-xs text-muted-foreground font-mono">
                              {match[1]}
                            </span>
                          </div>
                          <pre className="p-4 overflow-x-hidden whitespace-pre-wrap break-words text-sm font-mono leading-relaxed">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground" {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-mono font-bold gradient-text mb-6 pb-2 border-b border-border">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-mono font-semibold text-primary mt-8 mb-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-mono font-semibold text-secondary mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CTFView;
