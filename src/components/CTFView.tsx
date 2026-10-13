import ArticleNavigation from '@/components/ArticleNavigation';
import useArticleContent from '@/hooks/use-article-content';
import { Link } from 'react-router-dom';
import ArticleMetadata from '@/components/ArticleMetadata';
import ArticleContent from '@/components/ArticleContent';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Flag, Trophy, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="reader-container mx-auto px-4 py-4">
          <ArticleNavigation title={ctfWriteup.title} content={content} parent={{label:'CTF solves', path:'/ctf'}} />
          <Button
            variant="outline"
            asChild
            className={`mb-4 ${
              isYellow 
                ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500' 
                : 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500'
            }`}
          >
            <Link to="/ctf">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
            </Link>
          </Button>
          
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
          
          <h1 className={`text-2xl sm:text-3xl font-display font-bold ${isYellow ? 'gradient-text-yellow' : 'gradient-text-orange'} mb-2`}>
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

      <div className="reader-container mx-auto px-4 py-6 sm:py-8 relative z-10">
        {/* Summary Card */}
        <Card className={`mb-6 reader-summary ${isYellow ? 'theme-yellow border-yellow-500/20 hover:ring-1 hover:ring-yellow-500/20' : 'theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20'}`}>
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
        <Card className={`reader-article ${isYellow ? 'theme-yellow border-yellow-500/20 hover:ring-1 hover:ring-yellow-500/20' : 'theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20'}`}>
          <CardContent className="reader-content">
            {isLoading ? (
              <p role="status" className="text-muted-foreground py-8 text-center">Loading article...</p>
            ) : (
              <ArticleContent content={content} theme={isYellow ? 'yellow' : 'orange'} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CTFView;
