import ArticleSummary from '@/components/ArticleSummary';
import ReaderLayout from '@/components/ReaderLayout';
import ArticleNavigation from '@/components/ArticleNavigation';
import useArticleContent from '@/hooks/use-article-content';
import ArticleMetadata from '@/components/ArticleMetadata';
import ArticleContent from '@/components/ArticleContent';
import { useState, useEffect } from 'react';
import { Calendar, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Writeup, loadWriteupContent } from '@/data/writeups';
import PageBackground from '@/components/PageBackground';

interface WriteupViewProps {
  writeup: Writeup;
  onBack: () => void;
  initialContent?: string;
}

const WriteupView = ({ writeup, onBack, initialContent }: WriteupViewProps) => {

  const {content, isLoading} = useArticleContent(writeup.contentPath, loadWriteupContent, initialContent);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = height > 0 ? (window.scrollY / height) * 100 : 0;
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
    <div className="min-h-screen bg-background cyber-grid reader-page relative">
      <ArticleMetadata previewImage={writeup.previewImage} title={writeup.title} summary={writeup.summary} date={writeup.date} path={`/boxes/${writeup.platform}/${writeup.id}`} />
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
        <div className="reader-header mx-auto px-4 py-4">
          <ArticleNavigation content={content} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <Badge 
              variant="secondary" 
              className={`tag ${getDifficultyClasses(writeup.difficulty)}`}
            >
              {writeup.difficulty.toUpperCase()}
            </Badge>
            {writeup.icon ? <img className="machine-icon" src={writeup.icon} alt={`${writeup.title} machine icon`} width={48} height={48} /> : <span className="text-2xl">{getOSIcon(writeup.os)}</span>}
            <span className="text-sm text-muted-foreground font-mono">
              {writeup.platform.toUpperCase()}
            </span>
          </div>
          
          <h1 className={`text-2xl sm:text-3xl font-display font-bold reader-title mb-2 tracking-tight`}>
            {writeup.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(writeup.date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'})}
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {writeup.os} machine
            </div>
          </div>
        </div>
      </div>

      <ReaderLayout content={content} title={writeup.title}>
        <ArticleSummary summary={writeup.summary} tags={writeup.tags} />

        {/* Writeup Content */}
        <Card className={`reader-article ${theme.glowClass} ${theme.borderClass}`}>
          <CardContent className="reader-content">
            {isLoading ? (
              <p role="status" className="text-muted-foreground py-8 text-center">Loading article...</p>
            ) : (
              <ArticleContent title={writeup.title} content={content} theme={writeup.platform.toLowerCase() === 'hackthebox' ? 'green' : writeup.platform.toLowerCase() === 'tryhackme' ? 'blue' : writeup.platform.toLowerCase() === 'vulnhub' ? 'yellow' : 'purple'} />
            )}
          </CardContent>
        </Card>
      </ReaderLayout>
    </div>
  );
};

export default WriteupView;
