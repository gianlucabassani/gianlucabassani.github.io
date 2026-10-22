import PageBackground from '@/components/PageBackground';
import ProjectRail from '@/components/ProjectRail';
import HeroHeading from '@/components/HeroHeading';
import HomeEffects from '@/components/HomeEffects';
import AboutProfile from '@/components/AboutProfile';
import BlogBook from '@/components/BlogBook';
import BoxArchive from '@/components/BoxArchive';
import CTFArchive from '@/components/CTFArchive';
import ScrollDecrypt, { DecodeText } from '@/components/ScrollDecrypt';
import { lazy, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, Github, Gitlab, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Writeup } from '@/data/writeups';
import { CTFWriteup, ctfWriteups } from '@/data/ctf';
import { Project, projects } from '@/data/projects';
const WriteupArchiveView = lazy(() => import('@/components/WriteupArchiveView'));
const PlatformView = lazy(() => import('@/components/PlatformView'));
const ProjectView = lazy(() => import('@/components/ProjectView'));
const ProjectsView = lazy(() => import('@/components/ProjectsView'));
const SkillsView = lazy(() => import('@/components/SkillsView'));
const CertificationsView = lazy(() => import('@/components/CertificationsView'));
import { writeups } from '@/data/writeups';
import { BlogPost, getBlogPostById, getBlogPosts } from '@/data/blog';
const BlogListView = lazy(() => import('@/components/BlogListView'));

const parseRoute = (path: string) => {
  const segments = path.split('/').filter(s => s);
  if (segments.length === 0) return { view: 'main' as const, section: 'about' };
  const section = segments[0];
  if (section === 'projects' && segments[1]) {
    return { view: 'project' as const, projectId: segments[1] };
  }
  if (section === 'projects') {
    return { view: 'projects' as const };
  }
  if (section === 'boxes' && segments[1] && segments[2]) {
    return { view: 'writeup' as const, platform: segments[1], writeupId: segments[2] };
  }
  if (section === 'boxes' && segments[1]) {
    return { view: 'platform' as const, platform: segments[1] };
  }
  if (section === 'boxes') return { view: 'boxes' as const };
  if (section === 'ctf' && !segments[1]) return { view: 'ctfs' as const };
  if (section === 'ctf' && segments[1]) {
    return { view: 'ctf' as const, ctfId: segments[1] };
  }
  if (section === 'blog' && segments[1]) {
    return { view: 'blogPost' as const, blogPostId: segments[1] };
  }
  if (section === 'blog') {
    return { view: 'blog' as const };
  }
  if (section === 'skills') {
    return { view: 'skills' as const };
  }
  if (section === 'certifications') {
    return { view: 'certifications' as const };
  }
  return { view: 'main' as const, section };
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentRoute = parseRoute(location.pathname);
  const [currentView, setCurrentView] = useState<'main' | 'boxes' | 'ctfs' | 'platform' | 'writeup' | 'ctf' | 'projects' | 'project' | 'blog' | 'blogPost' | 'skills' | 'certifications'>(currentRoute.view);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(currentRoute.platform || '');
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(null);
  const [selectedCTFWriteup, setSelectedCTFWriteup] = useState<CTFWriteup | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const blogPosts = getBlogPosts();

  // Update view based on route changes
  useEffect(() => {
    const route = parseRoute(location.pathname);
    setCurrentView(route.view);
    setSelectedPlatform(route.platform || '');
    // Load specific items based on route
    if (route.projectId) {
      const project = projects.find(p => p.id === route.projectId);
      setSelectedProject(project || null);
    }
    if (route.ctfId) {
      const ctf = ctfWriteups.find(c => c.id === route.ctfId);
      setSelectedCTFWriteup(ctf || null);
    }
    if (route.blogPostId) {
      setSelectedBlogPost(getBlogPostById(route.blogPostId) || null);
    }
    if (route.writeupId && route.platform) {
      const platformWriteups = writeups.filter(w => w.platform.toLowerCase() === route.platform.toLowerCase());
      const writeup = platformWriteups.find(w => w.id === route.writeupId);
      setSelectedWriteup(writeup || null);
    }
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    // Scroll to the section element on the main page
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlatformClick = (platform: string) => {
    navigate(`/boxes/${platform}`);
  };

  const handleWriteupSelect = (writeup: Writeup) => {
    navigate(`/boxes/${selectedPlatform}/${writeup.id}`);
  };

  const handleCTFSelect = (ctfWriteup: CTFWriteup) => {
    navigate(`/ctf/${ctfWriteup.id}`);
  };

  const handleProjectsClick = () => {
    navigate('/projects');
  };

  const handleProjectSelect = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleBlogClick = () => {
    navigate('/blog');
  };

  const handleBlogPostSelect = (post: BlogPost) => {
    navigate(`/blog/${post.id}`);
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleSkillsClick = () => {
    navigate('/skills');
  };

  const handleCertsClick = () => {
    navigate('/certifications');
  };

  const handleBackToPlatform = () => {
    navigate(`/boxes/${selectedPlatform}`);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleBackToBlog = () => {
    navigate('/blog');
  };

  useEffect(() => {
    const section = location.pathname.split('/').filter(Boolean)[0];
    if (currentView === 'main' && section && document.getElementById(section)) {
      document.getElementById(section)?.scrollIntoView({behavior:'instant'});
    } else if (!window.location.hash) window.scrollTo(0, 0);
  }, [location.pathname, currentView]);

  // Handle different views
  if (currentView === 'projects') {
    return <ProjectsView onBack={handleBackToMain} onProjectSelect={handleProjectSelect} />;
  }

  if (currentView === 'project' && selectedProject) {
    return <ProjectView project={selectedProject} onBack={handleBackToProjects} />;
  }

  if (currentView === 'boxes' || currentView === 'ctfs') {
    return <WriteupArchiveView kind={currentView === 'boxes' ? 'boxes' : 'ctf'} />;
  }

  if (currentView === 'blog') {
    return <BlogListView onBack={handleBackToMain} onPostSelect={handleBlogPostSelect} />;
  }

  if (currentView === 'skills') {
    return <SkillsView onBack={handleBackToMain} />;
  }

  if (currentView === 'certifications') {
    return <CertificationsView onBack={handleBackToMain} />;
  }

  if (currentView === 'platform' && selectedPlatform) {
    return (
      <PlatformView 
        platform={selectedPlatform} 
        onBack={handleBackToMain} 
        onWriteupSelect={handleWriteupSelect}
      />
    );
  }
  return (
    <div className="min-h-screen bg-background text-foreground cyber-grid home-page">
      <PageBackground primary="hsl(270,85%,65%)" secondary="hsl(185,95%,48%)" tertiary="hsl(325,90%,62%)" />

      <HomeEffects />
      <main id="main-content" tabIndex={-1} className="home-main relative z-10">
        {/* About Section */}
        <section id="about">
          <div className="home-about-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero */}
            <div className="relative text-center">
              <div className="relative z-10 py-8 sm:py-16 lg:py-20">
              <HeroHeading />
              <p className="hero-topics" aria-label="Red Teaming, AI Security, Automation">
                <strong>Red Teaming</strong><span aria-hidden="true">·</span><strong>AI Security</strong><span aria-hidden="true">·</span><strong>Automation</strong>
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-5 leading-relaxed">
                Understand how systems work. Make them stop working. Bring ideas to life.
              </p>
              <p className="text-sm md:text-base text-muted-foreground mb-8">
                CTF Player @ <a href="https://pwnthem0le.polito.it/" target="_blank" rel="noopener noreferrer" className="text-secondary underline decoration-secondary/40 underline-offset-4 hover:decoration-secondary">pwnthem0le</a>
              </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button 
                    onClick={() => scrollToSection('projects')} 
                    size="lg" 
                    className="hero-work-action"
                  >
                    Explore My Work
                    <ChevronDown className="action-arrow-down" aria-hidden="true" />
                  </Button>
                  <Button
                      onClick={() => navigate('/terminal')}
                      variant="outline"
                      size="lg"
                      className="hero-cli-action"
                    >
                      Launch CLI Console
                      <Terminal aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>

            <AboutProfile />

            {/* Interactive CLI Console Preview Card */}
            <Link to="/terminal" className="content-card-link"><Card
              className="home-terminal scroll-mt-24 border-accent/20 bg-card/90 overflow-hidden theme-purple cursor-pointer transition-colors duration-200 group hover:border-accent/40"
            >
              {/* Terminal Titlebar Mock */}
              <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border/40 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive/80" />
                  <span className="w-3 h-3 rounded-full bg-warning/80" />
                  <span className="w-3 h-3 rounded-full bg-success/80" />
                  <span className="text-[11px] font-mono text-muted-foreground ml-2">
                    guest@bassani.io: ~ (bash)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-mono">Live Session</span>
                </div>
              </div>
              <CardContent className="home-terminal-content p-6 font-mono text-xs text-muted-foreground/90 space-y-3 bg-black/25">
                <div className="flex items-center gap-2">
                  <span className="text-success font-bold">guest@bassani.io</span>
                  <span>:</span>
                  <span className="text-accent">~</span>
                  <span>$</span>
                  <span className="text-foreground">./init_console.sh</span>
                </div>
                <div className="text-muted-foreground pl-4 space-y-1">
                  <p>[System] Booting virtual developer environment...</p>
                  <p>[System] Interactive modules loaded: pong (game), joke (memes), ascii (art)</p>
                  <p>[System] Hoping to not end up in kernel panic...</p>
                  <p className="text-accent font-bold animate-pulse">Click this card to enter full screen terminal console &gt;</p>
                </div>
                <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground border-t border-border/20 justify-between select-none">
                  <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-accent" /> Click to launch shell</span>
                  <span className="text-accent/80 group-hover:translate-x-1 transition-transform">Run terminal &rarr;</span>
                </div>
              </CardContent>
            </Card></Link>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectRail projects={projects} />
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="home-section-title">
              <span className="site-section-title">Blog</span>
            </h2>

            <BlogBook posts={blogPosts} headingAs="h3" />

            <div className="home-section-footer">
              <Button
                onClick={handleBlogClick}
                size="lg"
                variant="accent"
              >
                Browse All Posts
                <ExternalLink className="action-arrow" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>

        {/* Boxes Writeups Section */}
        <section id="boxes" className="archive-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="archive-preview-heading"><h2 className="home-section-title"><span className="site-section-title">Box Writeups</span></h2></div>
            <BoxArchive compact />
          </div>
        </section>

        {/* CTF Section */}
        <section id="ctf" className="archive-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollDecrypt>
            <div className="archive-preview-heading"><h2 className="home-section-title"><span className="site-section-title"><DecodeText>CTF Solves</DecodeText></span></h2></div>
            <CTFArchive compact />
            </ScrollDecrypt>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              &copy; 2026 Gianluca Bassani | Cybersecurity & Knowledge Sharing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
