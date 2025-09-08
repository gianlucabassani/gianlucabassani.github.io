import { useState } from 'react';
import { ArrowLeft, Github, ExternalLink, Calendar, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, projects } from '@/data/projects';

interface ProjectsViewProps {
  onBack: () => void;
  onProjectSelect: (project: Project) => void;
}

const ProjectsView = ({ onBack, onProjectSelect }: ProjectsViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))];
  const statuses = ['all', ...Array.from(new Set(projects.map(p => p.status)))];

  const filteredProjects = projects.filter(project => {
    const categoryMatch = selectedCategory === 'all' || project.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || project.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

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
      <div className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-6 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-mono font-bold gradient-text mb-4">
                  Projects
                </h1>
                <p className="text-xl text-muted-foreground">
                  A collection of tools, applications, and libraries I've built
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="card-hover mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category === 'all' ? 'All' : `${getCategoryIcon(category)} ${category}`}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStatus(status)}
                        className="capitalize"
                      >
                        {status === 'all' ? 'All' : status.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid/List */}
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredProjects.map((project) => (
              <Card 
                key={project.id}
                className={`card-hover cursor-pointer transition-all duration-300 hover:scale-105 ${
                  viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                }`}
                onClick={() => onProjectSelect(project)}
              >
                <CardHeader className={viewMode === 'list' ? 'md:w-1/3' : ''}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(project.date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className={`${viewMode === 'list' ? 'md:w-2/3 md:pt-6' : 'pt-0'}`}>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {project.summary}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs tag">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.githubUrl, '_blank');
                        }}
                        className="border-primary/30 hover:bg-primary/10"
                      >
                        <Github className="w-4 h-4" />
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(project.liveUrl, '_blank');
                        }}
                        className="border-secondary/30 hover:bg-secondary/10"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card className="card-hover text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No projects found matching the selected filters.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card className="card-hover mt-8">
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{projects.length}</div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    {projects.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">
                    {projects.filter(p => p.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {projects.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;