import PageBackground from '@/components/PageBackground';
import ProjectRail from '@/components/ProjectRail';
import HeroHeading from '@/components/HeroHeading';
import HomeEffects from '@/components/HomeEffects';
import AboutProfile from '@/components/AboutProfile';
import BlogBook from '@/components/BlogBook';
import BoxArchive from '@/components/BoxArchive';
import CTFArchive from '@/components/CTFArchive';
import ScrollDecrypt, { DecodeText } from '@/components/ScrollDecrypt';
import ProjectSpotlight from '@/components/ProjectSpotlight';
import ContactCard from '@/components/ContactCard';
import ShellEgg from '@/components/ShellEgg';
import { lazy, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

// The featured project that carries spotlight copy gets the large panel above the rail.
const flagship = projects.find(project => project.featured && project.spotlight);
// Home rail order: keeps the two OSINT toolkits (Gosint, Browsint) from sitting side by side.
// Projects not listed here follow in their projects.json order.
const railOrder = ['gosint', 'ShellCy', 'browphish', 'blockcheat', 'browsint', 'Ida'];
const railRank = (id: string) => { const index = railOrder.indexOf(id); return index < 0 ? railOrder.length : index; };
const railProjects = projects.filter(project => project !== flagship).sort((a, b) => railRank(a.id) - railRank(b.id));

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
                      onClick={() => scrollToSection('contact')}
                      variant="outline"
                      size="lg"
                      className="hero-cli-action"
                    >
                      Get in touch
                      <Send aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <ShellEgg spot="hero" />
            </div>

            <AboutProfile />

          </div>
        </section>

        {/* Projects Section */}
        <section id="projects">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ShellEgg spot="projects" />
            <ProjectRail projects={railProjects} lead={flagship && <ProjectSpotlight project={flagship} />} />
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

        <section id="contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="home-section-title"><span className="site-section-title">Contact</span></h2>
            <ContactCard />
            <ShellEgg spot="contact" hotkey />
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
