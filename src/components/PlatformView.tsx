import { ArrowLeft, Calendar, Shield, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWriteupsByPlatform, getWriteupsByDifficulty, Writeup } from '@/data/writeups';
import PageBackground from '@/components/PageBackground';

interface PlatformViewProps {
  platform: string;
  onBack: () => void;
  onWriteupSelect: (writeup: Writeup) => void;
}

const PlatformView = ({ platform, onBack, onWriteupSelect }: PlatformViewProps) => {
  const allWriteups = getWriteupsByPlatform(platform);
  const difficulties = ['easy', 'medium', 'hard', 'insane'];
  
  const getDifficultyBorderClass = (difficulty: string) => {
    const map: Record<string, string> = {
      easy: 'border-success/20',
      medium: 'border-warning/20',
      hard: 'border-destructive/20',
      insane: 'border-accent/20',
    };
    return map[difficulty] || 'border-secondary/20';
  };

  const getDifficultyTextClass = (difficulty: string) => {
    const map: Record<string, string> = {
      easy: 'text-success',
      medium: 'text-warning',
      hard: 'text-destructive',
      insane: 'text-accent',
    };
    return map[difficulty] || 'text-secondary';
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    const map: Record<string, string> = {
      easy: 'bg-success/20 border-success/40 text-success',
      medium: 'bg-warning/20 border-warning/40 text-warning',
      hard: 'bg-destructive/20 border-destructive/40 text-destructive',
      insane: 'bg-accent/20 border-accent/40 text-accent',
    };
    return map[difficulty] || 'bg-secondary/20 border-secondary/40 text-secondary';
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      case 'insane': return '🟣';
      default: return '⭕';
    }
  };

  const getOSIcon = (os: string) => {
    switch (os) {
      case 'linux': return '🐧';
      case 'windows': return '🪟';
      default: return '💻';
    }
  };

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'hackthebox':
        return {
          name: 'HackTheBox',
          description: 'Retired HackTheBox machines with my exploitation methodologies and considerations',
          icon: '📦',
          color: 'primary'
        };
      case 'tryhackme':
        return {
          name: 'TryHackMe',
          description: 'INCOMING: TryHackMe room walkthroughs and learning paths',
          icon: '🎯',
          color: 'secondary'
        };
      case 'vulnhub':
        return {
          name: 'VulnHub',
          description: 'INCOMING: VulnHub boot-to-root challenges and vulnerable machines',
          icon: '🏛️',
          color: 'accent'
        };
      default:
        return {
          name: platform,
          description: 'Security challenge writeups',
          icon: '🔒',
          color: 'primary'
        };
    }
  };

  const platformInfo = getPlatformInfo(platform);

  // Dynamic color mappings based on platform
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
          secondaryColor: 'hsl(185,95%,48%)',
          itemBorderHover: 'hover:border-success/30',
          itemTextHover: 'group-hover:text-success',
          chevronColor: 'group-hover:text-success'
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
          secondaryColor: 'hsl(185,95%,48%)',
          itemBorderHover: 'hover:border-blue-500/30',
          itemTextHover: 'group-hover:text-blue-400',
          chevronColor: 'group-hover:text-blue-400'
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
          secondaryColor: 'hsl(25,95%,53%)',
          itemBorderHover: 'hover:border-yellow-500/30',
          itemTextHover: 'group-hover:text-yellow-400',
          chevronColor: 'group-hover:text-yellow-400'
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
          secondaryColor: 'hsl(185,95%,48%)',
          itemBorderHover: 'hover:border-accent/30',
          itemTextHover: 'group-hover:text-accent',
          chevronColor: 'group-hover:text-accent'
        };
    }
  };

  const theme = getThemeConfig(platform);

  return (
    <div className="min-h-screen bg-background py-20 cyber-grid relative overflow-hidden">
      <PageBackground
        primary={theme.accentColor}
        secondary={theme.secondaryColor}
        variant="scattered"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Button
          variant="outline"
          onClick={onBack}
          className={`mb-8 font-mono ${theme.btnClass}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Platform Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{platformInfo.icon}</div>
          <h1 className={`text-4xl font-display font-bold ${theme.textGradient} mb-4 tracking-tight`}>
            {platformInfo.name} Writeups
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {platformInfo.description}
          </p>
          <div className="mt-6">
            <Badge variant="secondary" className="tag text-base px-4 py-2">
              {allWriteups.length} writeup{allWriteups.length !== 1 ? 's' : ''} available
            </Badge>
          </div>
        </div>

        {/* Difficulty Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {difficulties.map((difficulty) => {
            const writeups = getWriteupsByDifficulty(platform, difficulty);
            
            return (
              <Card 
                key={difficulty} 
                className={`card-hover ${theme.glowClass} ${theme.ringClass} ${getDifficultyBorderClass(difficulty)} ${writeups.length === 0 ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <span className="text-2xl mr-3">{getDifficultyIcon(difficulty)}</span>
                    <span className={getDifficultyTextClass(difficulty)}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Boxes
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto ${getDifficultyBadgeClass(difficulty)}`}
                    >
                      {writeups.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {writeups.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No writeups available yet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check back soon for new content!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {writeups.map((writeup) => (
                        <div
                          key={writeup.id}
                          className={`group flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-all duration-200 cursor-pointer border border-transparent ${theme.itemBorderHover}`}
                          onClick={() => onWriteupSelect(writeup)}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{getOSIcon(writeup.os)}</span>
                            <div>
                              <div className={`font-semibold text-foreground ${theme.itemTextHover} transition-colors`}>
                                {writeup.title}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(writeup.date).toLocaleDateString()}
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  {writeup.os}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex flex-wrap gap-1 mr-3">
                              {writeup.tags.slice(0, 3).map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="secondary" 
                                  className="text-xs px-2 py-0 opacity-70 group-hover:opacity-100"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <ChevronRight className={`w-5 h-5 text-muted-foreground ${theme.chevronColor} transition-colors`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PlatformView;