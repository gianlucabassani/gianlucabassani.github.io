import ArticleSummary from '@/components/ArticleSummary';
import ReaderLayout from '@/components/ReaderLayout';
import ArticleNavigation from '@/components/ArticleNavigation';
import useArticleContent from '@/hooks/use-article-content';
import ArticleMetadata from '@/components/ArticleMetadata';
import ArticleContent from '@/components/ArticleContent';
import { useState, useEffect } from 'react';
import { Calendar, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CTFWriteup, loadCTFWriteupContent } from '@/data/ctf';
import PageBackground from '@/components/PageBackground';

interface CTFViewProps {
  ctfWriteup: CTFWriteup;
  onBack: () => void;
  initialContent?: string;
}

const isYellowTheme = (category: string) => {
  const cat = category.toLowerCase();
  return ['web', 'web3', 'blockchain', 'crypto', 'reversing'].includes(cat);
};

const CTFView = ({ ctfWriteup, onBack, initialContent }: CTFViewProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const isYellow = isYellowTheme(ctfWriteup.category);

  const {content, isLoading} = useArticleContent(ctfWriteup.contentPath, loadCTFWriteupContent, initialContent);

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
    <div className="min-h-screen bg-background cyber-grid reader-page relative">
      <ArticleMetadata previewImage={ctfWriteup.previewImage} title={ctfWriteup.title} summary={ctfWriteup.summary} date={ctfWriteup.date} path={`/ctf/${ctfWriteup.id}`} />
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
        <div className="reader-header mx-auto px-4 py-4">
          <ArticleNavigation title={ctfWriteup.title} content={content} parent={{label:'CTF solves', path:'/ctf'}} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
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
          
          <h1 className={`text-2xl sm:text-3xl font-display font-bold reader-title mb-2`}>
            {ctfWriteup.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(ctfWriteup.date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'})}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {ctfWriteup.competition}
            </div>
          </div>
        </div>
      </div>

      <ReaderLayout content={content} title={ctfWriteup.title}>
        <ArticleSummary summary={ctfWriteup.summary} tags={ctfWriteup.tags} />

        {/* CTF Content */}
        <Card className={`reader-article ${isYellow ? 'theme-yellow border-yellow-500/20 hover:ring-1 hover:ring-yellow-500/20' : 'theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20'}`}>
          <CardContent className="reader-content">
            {isLoading ? (
              <p role="status" className="text-muted-foreground py-8 text-center">Loading article...</p>
            ) : (
              <ArticleContent title={ctfWriteup.title} content={content} theme={isYellow ? 'yellow' : 'orange'} />
            )}
          </CardContent>
        </Card>
      </ReaderLayout>
    </div>
  );
};

export default CTFView;
