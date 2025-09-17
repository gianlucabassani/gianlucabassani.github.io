import { ArrowLeft, Calendar, Shield, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWriteupsByPlatform, getWriteupsByDifficulty, Writeup } from '@/data/writeups';

interface PlatformViewProps {
  platform: string;
  onBack: () => void;
  onWriteupSelect: (writeup: Writeup) => void;
}

const PlatformView = ({ platform, onBack, onWriteupSelect }: PlatformViewProps) => {
  const allWriteups = getWriteupsByPlatform(platform);
  const difficulties = ['easy', 'medium', 'hard', 'insane'];
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'destructive';
      case 'insane': return 'accent';
      default: return 'secondary';
    }
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
          description: 'Retired HackTheBox machines with detailed exploitation methodologies',
          icon: '📦',
          color: 'primary'
        };
      case 'tryhackme':
        return {
          name: 'TryHackMe',
          description: 'TryHackMe room walkthroughs and learning paths',
          icon: '🎯',
          color: 'secondary'
        };
      case 'vulnhub':
        return {
          name: 'VulnHub',
          description: 'VulnHub boot-to-root challenges and vulnerable machines',
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

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-8 border-primary/30 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Platforms
        </Button>

        {/* Platform Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{platformInfo.icon}</div>
          <h1 className="text-4xl font-mono font-bold gradient-text mb-4">
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
            const difficultyColor = getDifficultyColor(difficulty);
            
            return (
              <Card 
                key={difficulty} 
                className={`card-hover border-${difficultyColor}/20 ${writeups.length === 0 ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <span className="text-2xl mr-3">{getDifficultyIcon(difficulty)}</span>
                    <span className={`text-${difficultyColor}`}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Boxes
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto bg-${difficultyColor}/20 border-${difficultyColor}/40 text-${difficultyColor}`}
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
                          className="group flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
                          onClick={() => onWriteupSelect(writeup)}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{getOSIcon(writeup.os)}</span>
                            <div>
                              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
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
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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

        {/* Methodology Section */}
        <Card className="mt-12 animated-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Methodology & Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              Each writeup follows a structured methodology: reconnaissance, enumeration, exploitation, 
              privilege escalation, and post-exploitation. All writeups include detailed explanations of 
              tools used, thought processes, and lessons learned for educational purposes.
            </CardDescription>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-semibold text-sm">Reconnaissance</h4>
                <p className="text-xs text-muted-foreground mt-1">Information gathering</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-secondary font-bold">2</span>
                </div>
                <h4 className="font-semibold text-sm">Enumeration</h4>
                <p className="text-xs text-muted-foreground mt-1">Service discovery</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent font-bold">3</span>
                </div>
                <h4 className="font-semibold text-sm">Exploitation</h4>
                <p className="text-xs text-muted-foreground mt-1">Initial access</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-warning font-bold">4</span>
                </div>
                <h4 className="font-semibold text-sm">Privilege Escalation</h4>
                <p className="text-xs text-muted-foreground mt-1">Root access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformView;