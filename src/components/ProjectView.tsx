import { useState, useEffect } from 'react';
import { ArrowLeft, Github, ExternalLink, Calendar, Tag, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, loadProjectContent } from '@/data/projects';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
}

const ProjectView = ({ project, onBack }: ProjectViewProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (project.contentPath) {
      setIsLoading(true);
      loadProjectContent(project.contentPath)
        .then(setContent)
        .finally(() => setIsLoading(false));
    }
  }, [project.contentPath]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-success border-success/40 bg-success/20';
      case 'completed': return 'text-primary border-primary/40 bg-primary/20';
      case 'in-progress': return 'text-warning border-warning/40 bg-warning/20';
      case 'archived': return 'text-muted-foreground border-muted/40 bg-muted/20';
      default: return 'text-secondary border-secondary/40 bg-secondary/20';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'tool': return '🔧';
      case 'webapp': return '🌐';
      case 'library': return '📚';
      case 'security': return '🔒';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-6 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                  <h1 className="text-3xl md:text-4xl font-mono font-bold gradient-text">
                    {project.title}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(project.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-1" />
                    {project.category}
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {project.githubUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(project.githubUrl, '_blank')}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Github className="w-4 h-4 mr-2" />
                  View Source
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
              {project.liveUrl && (
                <Button 
                  onClick={() => window.open(project.liveUrl, '_blank')}
                  className="bg-primary hover:bg-primary/80"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Demo
                </Button>
              )}
            </div>
          </div>

          {/* Project Summary */}
          <Card className="card-hover mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                {project.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="tag">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="tag">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <Card className="card-hover mb-8">
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Detailed Content */}
          {project.contentPath && (
            <Card className="card-hover">
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold mb-6 text-foreground border-b border-border pb-3">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-medium mb-3 text-foreground mt-6">
                            {children}
                          </h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary bg-muted/30 p-4 my-4 italic">
                            {children}
                          </blockquote>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;