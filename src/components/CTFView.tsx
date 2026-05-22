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
import PageBackground from '@/components/PageBackground';

interface CTFViewProps {
  ctfWriteup: CTFWriteup;
  onBack: () => void;
}

const isYellowTheme = (category: string) => {
  const cat = category.toLowerCase();
  return ['web', 'web3', 'blockchain', 'crypto', 'reversing'].includes(cat);
};

const CTFView = ({ ctfWriteup, onBack }: CTFViewProps) => {
  const [content, setContent] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isYellow = isYellowTheme(ctfWriteup.category);

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

  const getDifficultyClasses = (difficulty: string) => {
    const classMap: Record<string, string> = {
      easy: 'bg-success/20 border-success/40 text-success',
      medium: 'bg-warning/20 border-warning/40 text-warning',
      hard: 'bg-destructive/20 border-destructive/40 text-destructive',
      insane: 'bg-accent/20 border-accent/40 text-accent',
    };
    return classMap[difficulty] || 'bg-secondary/20 border-secondary/40 text-secondary';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web': return '🌐';
      case 'web3': return '⛓️';
      case 'ai': return '🤖';
      case 'pwn': return '💥';
      case 'crypto': return '🔐';
      case 'forensics': return '🔍';
      case 'reversing': return '⚙️';
      case 'osint': return '🕵️';
      default: return '🚩';
    }
  };

  const glowColor = isYellow ? 'bg-[hsl(38,92%,50%)]' : 'bg-[hsl(25,95%,53%)]';

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      <PageBackground
        primary={isYellow ? 'hsl(38,92%,50%)' : 'hsl(25,95%,53%)'}
        secondary={isYellow ? 'hsl(45,93%,58%)' : 'hsl(15,90%,55%)'}
        variant="scattered"
      />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div 
          className={`h-full ${isYellow ? 'bg-gradient-yellow' : 'bg-gradient-orange'} transition-all duration-100`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={onBack}
            className={`mb-4 ${
              isYellow 
                ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500' 
                : 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge 
              variant="secondary" 
              className={`tag ${getDifficultyClasses(ctfWriteup.difficulty)}`}
            >
              {ctfWriteup.difficulty.toUpperCase()}
            </Badge>
            <span className="text-2xl">{getCategoryIcon(ctfWriteup.category)}</span>
            <span className="text-sm text-muted-foreground font-mono">
              {ctfWriteup.points} pts
            </span>
          </div>
          
          <h1 className={`text-3xl font-display font-bold ${isYellow ? 'gradient-text-yellow' : 'gradient-text-orange'} mb-2`}>
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

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Summary Card */}
        <Card className={`mb-8 ${isYellow ? 'theme-yellow border-yellow-500/20 hover:ring-1 hover:ring-yellow-500/20' : 'theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20'} card-hover`}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-display">
              <Flag className={`w-5 h-5 mr-2 ${isYellow ? 'text-yellow-500' : 'text-orange-500'}`} />
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
        <Card className={`card-hover ${isYellow ? 'theme-yellow border-yellow-500/20 hover:ring-1 hover:ring-yellow-500/20' : 'theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20'}`}>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isYellow ? 'border-yellow-500' : 'border-orange-500'}`}></div>
              </div>
            ) : (
              <div className={`prose prose-invert ${isYellow ? 'prose-yellow' : 'prose-orange'} max-w-none [&>*]:max-w-none [&_pre]:overflow-x-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code: ({ className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !className;
                      
                      return !isInline && match ? (
                        <div className={`my-2 rounded-lg border ${isYellow ? 'border-yellow-500/20' : 'border-orange-500/20'} bg-muted/20`}>
                          <div className={`px-3 py-1.5 bg-muted/40 border-b ${isYellow ? 'border-yellow-500/20' : 'border-orange-500/20'}`}>
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
                      <h1 className={`text-3xl font-display font-bold ${isYellow ? 'gradient-text-yellow' : 'gradient-text-orange'} mb-6 pb-2 border-b ${isYellow ? 'border-yellow-500/20' : 'border-orange-500/20'}`}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className={`text-2xl font-display font-semibold ${isYellow ? 'text-yellow-500' : 'text-orange-500'} mt-8 mb-4`}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className={`text-xl font-display font-semibold ${isYellow ? 'text-yellow-400' : 'text-orange-400'} mt-6 mb-3`}>
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className={`border-l-4 ${isYellow ? 'border-yellow-500' : 'border-orange-500'} pl-4 italic text-muted-foreground my-4`}>
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
