import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, Calendar, Shield, Server, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Writeup, loadWriteupContent } from '@/data/writeups';
import 'highlight.js/styles/github-dark.css';
import PageBackground from '@/components/PageBackground';

interface WriteupViewProps {
  writeup: Writeup;
  onBack: () => void;
}

const WriteupView = ({ writeup, onBack }: WriteupViewProps) => {
  const [content, setContent] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      const markdownContent = await loadWriteupContent(writeup.contentPath);
      setContent(markdownContent);
      setIsLoading(false);
    };

    loadContent();
  }, [writeup.contentPath]);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const getOSIcon = (os: string) => {
    switch (os) {
      case 'linux': return '🐧';
      case 'windows': return '🪟';
      default: return '💻';
    }
  };

  const getThemeConfig = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'hackthebox':
        return {
          glowClass: 'theme-green',
          borderClass: 'border-success/20',
          ringClass: 'hover:ring-1 hover:ring-success/20',
          textClass: 'text-success',
          btnClass: 'border-success/30 text-success hover:bg-success/10 hover:text-success',
          textGradient: 'gradient-text-green',
          accentColor: 'hsl(152,75%,52%)',
          secondaryColor: 'hsl(185,95%,48%)'
        };
      case 'tryhackme':
        return {
          glowClass: 'theme-blue',
          borderClass: 'border-blue-500/20',
          ringClass: 'hover:ring-1 hover:ring-blue-500/20',
          textClass: 'text-blue-400',
          btnClass: 'border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400 text-blue-400',
          textGradient: 'gradient-text-blue',
          accentColor: 'hsl(217,91%,60%)',
          secondaryColor: 'hsl(185,95%,48%)'
        };
      case 'vulnhub':
        return {
          glowClass: 'theme-yellow',
          borderClass: 'border-yellow-500/20',
          ringClass: 'hover:ring-1 hover:ring-yellow-500/20',
          textClass: 'text-yellow-400',
          btnClass: 'border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-400 text-yellow-400',
          textGradient: 'gradient-text-yellow',
          accentColor: 'hsl(38,92%,50%)',
          secondaryColor: 'hsl(25,95%,53%)'
        };
      default:
        return {
          glowClass: 'theme-purple',
          borderClass: 'border-accent/20',
          ringClass: 'hover:ring-1 hover:ring-accent/20',
          textClass: 'text-accent',
          btnClass: 'border-accent/30 hover:bg-accent/10 hover:text-accent text-accent-foreground',
          textGradient: 'gradient-text-purple',
          accentColor: 'hsl(270,85%,65%)',
          secondaryColor: 'hsl(185,95%,48%)'
        };
    }
  };

  const theme = getThemeConfig(writeup.platform);

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      <PageBackground
        primary={theme.accentColor}
        secondary={theme.secondaryColor}
        variant="scattered"
      />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div 
          className="h-full transition-all duration-100"
          style={{ 
            width: `${scrollProgress}%`, 
            backgroundImage: `var(--gradient-${writeup.platform.toLowerCase() === 'hackthebox' ? 'green' : writeup.platform.toLowerCase() === 'tryhackme' ? 'blue' : writeup.platform.toLowerCase() === 'vulnhub' ? 'yellow' : 'purple'})` 
          }}
        />
      </div>

      {/* Header */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={onBack}
            className={`mb-4 font-mono ${theme.btnClass}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Writeups
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <Badge 
              variant="secondary" 
              className={`tag ${getDifficultyClasses(writeup.difficulty)}`}
            >
              {writeup.difficulty.toUpperCase()}
            </Badge>
            <span className="text-2xl">{getOSIcon(writeup.os)}</span>
            <span className="text-sm text-muted-foreground font-mono">
              {writeup.platform.toUpperCase()}
            </span>
          </div>
          
          <h1 className={`text-3xl font-display font-bold ${theme.textGradient} mb-2 tracking-tight`}>
            {writeup.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(writeup.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {writeup.os} machine
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Summary Card */}
        <Card className={`mb-8 card-hover ${theme.glowClass} ${theme.ringClass} ${theme.borderClass}`}>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Server className={`w-5 h-5 mr-2 ${theme.textClass}`} />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{writeup.summary}</p>
            <div className="flex flex-wrap gap-2">
              {writeup.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="tag">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Writeup Content */}
        <Card className={`card-hover ${theme.glowClass} ${theme.ringClass} ${theme.borderClass}`}>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading writeup content...</div>
              </div>
            ) : (
              <div className={`prose prose-invert ${
                writeup.platform.toLowerCase() === 'hackthebox' ? 'prose-green' :
                writeup.platform.toLowerCase() === 'tryhackme' ? 'prose-blue' :
                writeup.platform.toLowerCase() === 'vulnhub' ? 'prose-yellow' :
                'prose-purple'
              } max-w-none [&>*]:max-w-none [&_pre]:overflow-x-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code: ({ className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !className;
                      
                      return !isInline && match ? (
                        <div className="my-2 rounded-lg border bg-muted/20" style={{ borderColor: `${theme.accentColor}25` }}>
                          <div className="px-3 py-1.5 bg-muted/40 border-b" style={{ borderBottomColor: `${theme.accentColor}25` }}>
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
                      <h1 className={`text-3xl font-display font-bold ${theme.textGradient} mb-6 pb-2 border-b border-border`}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className={`text-2xl font-display font-semibold ${theme.textClass} mt-8 mb-4`}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-display font-semibold text-foreground/90 mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 pl-4 italic text-muted-foreground my-2" style={{ borderColor: theme.accentColor }}>
                        {children}
                      </blockquote>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-foreground leading-relaxed">
                        {children}
                      </p>
                    ),
                    img: ({ src, alt, ...props }) => (
                      <img 
                        src={src} 
                        alt={alt} 
                        className="my-6 max-w-full h-auto rounded-lg shadow-lg border border-border"
                        {...props}
                      />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full border-collapse border border-border">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border bg-muted p-2 text-left font-semibold">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-border p-2">
                        {children}
                      </td>
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

export default WriteupView;