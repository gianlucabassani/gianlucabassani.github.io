import PageBackground from '@/components/PageBackground';
import ProjectRail from '@/components/ProjectRail';
import HeroHeading from '@/components/HeroHeading';
import AboutProfile from '@/components/AboutProfile';
import BlogBook from '@/components/BlogBook';
import PlatformLogo from '@/components/PlatformLogo';
import { lazy, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Terminal, Github, Gitlab, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Writeup } from '@/data/writeups';
import { CTFWriteup, ctfWriteups } from '@/data/ctf';
import { Project, projects } from '@/data/projects';
const PlatformView = lazy(() => import('@/components/PlatformView'));
const ProjectView = lazy(() => import('@/components/ProjectView'));
const ProjectsView = lazy(() => import('@/components/ProjectsView'));
const SkillsView = lazy(() => import('@/components/SkillsView'));
const CertificationsView = lazy(() => import('@/components/CertificationsView'));
import { writeups } from '@/data/writeups';
import { BlogPost, getBlogPostById, getBlogPosts } from '@/data/blog';
const BlogListView = lazy(() => import('@/components/BlogListView'));

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Parse current route to determine view
  const parseRoute = () => {
    const path = location.pathname;
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
  const currentRoute = parseRoute();
  const [currentView, setCurrentView] = useState<'main' | 'platform' | 'writeup' | 'ctf' | 'projects' | 'project' | 'blog' | 'blogPost' | 'skills' | 'certifications'>(currentRoute.view);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(currentRoute.platform || '');
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(null);
  const [selectedCTFWriteup, setSelectedCTFWriteup] = useState<CTFWriteup | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const blogPosts = getBlogPosts();

  // Update view based on route changes
  useEffect(() => {
    const route = parseRoute();
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

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const section = location.pathname.split('/').filter(Boolean)[0];
    if (currentView === 'main' && section && document.getElementById(section)) {
      document.getElementById(section)?.scrollIntoView({behavior:'instant'});
    } else if (!window.location.hash) window.scrollTo(0, 0);
  }, [location.pathname, currentView]);

  // Fade-in animations observer
  useEffect(() => {
    if (currentView !== 'main') return;

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0');
            entry.target.classList.add('fade-in-section');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all card elements
    const cards = document.querySelectorAll('[data-fade-in]');
    cards.forEach((card) => {
      card.classList.add('opacity-0');
      fadeObserver.observe(card);
    });

    return () => fadeObserver.disconnect();
  }, [currentView]);

  // Handle different views
  if (currentView === 'projects') {
    return <ProjectsView onBack={handleBackToMain} onProjectSelect={handleProjectSelect} />;
  }

  if (currentView === 'project' && selectedProject) {
    return <ProjectView project={selectedProject} onBack={handleBackToProjects} />;
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

      {/* Scroll Progress Bar */}
      <div 
        className="scroll-progress" 
        style={{ width: `${scrollProgress}%` }}
      />
      <main id="main-content" tabIndex={-1} className="relative z-10">
        {/* About Section */}
        <section id="about" className="py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero */}
            <div className="relative text-center mb-12">
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
                    className="glow-primary bg-primary hover:bg-primary/80 text-primary-foreground font-mono"
                  >
                    Explore My Work
                    <ChevronDown className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                      onClick={() => navigate('/terminal')}
                      variant="outline"
                      size="lg"
                      className="border-success/30 text-success hover:bg-success/10 font-mono"
                    >
                      Launch CLI Console
                      <Terminal className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <AboutProfile />

            {/* Interactive CLI Console Preview Card */}
            <Link to="/terminal" className="content-card-link"><Card
              className="mt-12 scroll-mt-24 border-accent/20 bg-card/60 backdrop-blur-sm overflow-hidden card-hover theme-purple cursor-pointer transition-all duration-300 group hover:border-accent/40"
              data-fade-in
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
              <CardContent className="p-6 font-mono text-xs text-muted-foreground/90 space-y-3 bg-black/25">
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
        <section id="projects" className="py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectRail projects={projects} />
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-8 sm:mb-12 text-center gradient-text-purple tracking-tight">
              Blog
            </h2>

            <BlogBook posts={blogPosts} headingAs="h3" />

            <div className="text-center">
              <Button
                onClick={handleBlogClick}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/80 font-mono"
              >
                Browse All Posts
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Boxes Writeups Section */}
        <section id="boxes" className="py-10 sm:py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-8 sm:mb-12 text-center gradient-text tracking-tight">Box Writeups</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 mb-8 sm:mb-12">
              <Link to="/boxes/hackthebox" className="content-card-link"><Card
                className="card-hover theme-green border-success/20 hover:ring-1 hover:ring-success/20 cursor-pointer transition-all duration-300 hover:scale-105"
                data-fade-in
              >
                <CardHeader>
                  <CardTitle className="platform-card-title"><PlatformLogo platform="hackthebox" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Writeups for retired HackTheBox machines, organized by difficulty level.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="tag">Pentesting</Badge>
                    <Badge variant="secondary" className="tag">CTF</Badge>
                    <Badge variant="secondary" className="tag">Linux</Badge>
                    <Badge variant="secondary" className="tag">Windows</Badge>
                  </div>
                </CardContent>
              </Card></Link>

              <Link to="/boxes/tryhackme" className="content-card-link"><Card
                className="card-hover theme-blue border-blue-500/20 hover:ring-1 hover:ring-blue-500/20 cursor-pointer transition-all duration-300 hover:scale-105"
                data-fade-in
              >
                <CardHeader>
                  <CardTitle className="platform-card-title"><PlatformLogo platform="tryhackme" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Solutions and walkthroughs for TryHackMe rooms.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="tag">Beginner Friendly</Badge>
                    <Badge variant="secondary" className="tag">Basic Skills</Badge>
                  </div>
                </CardContent>
              </Card></Link>

              <Link to="/boxes/vulnhub" className="content-card-link"><Card
                className="card-hover theme-yellow border-yellow-500/20 hover:ring-1 hover:ring-yellow-500/20 cursor-pointer transition-all duration-300 hover:scale-105"
                data-fade-in
              >
                <CardHeader>
                  <CardTitle className="platform-card-title"><PlatformLogo platform="vulnhub" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Boot-to-root challenges from VulnHub.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="tag">Local Lab</Badge>
                    <Badge variant="secondary" className="tag">Offline Practice</Badge>
                  </div>
                </CardContent>
              </Card></Link>
            </div>

            <Card className="card-hover theme-purple border-accent/20 hover:ring-1 hover:ring-accent/20" data-fade-in>
              <CardHeader>
                <CardTitle className="text-xl">Methodology & Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Each writeup tries to follow the same methodology: reconnaissance, enumeration, exploitation, privilege escalation, and post-exploitation. All writeups include explanations and considerations of tools used, thought processes, and lessons learned for educational purposes.
                </p>
                <p className="text-sm text-accent">
                  Click on any platform above to explore the available writeups organized by difficulty level.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTF Section */}
        <section id="ctf" className="py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-8 sm:mb-12 text-center gradient-text-orange tracking-tight">CTF Solves</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 mb-8 sm:mb-12">
              <Card className="card-hover theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20" data-fade-in>
                <CardHeader>
                  <CardTitle className="text-xl">Recent CTF Writeups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ctfWriteups.map((ctf) => (
                      <Link
                        key={ctf.id}
                        to={`/ctf/${ctf.id}`}
                        className={`block border border-border/60 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                          ['web', 'web3', 'blockchain', 'crypto', 'reversing'].includes(ctf.category.toLowerCase())
                            ? 'hover:bg-yellow-500/10 hover:border-yellow-500/30 hover:shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                            : 'hover:bg-orange-500/10 hover:border-orange-500/30 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{ctf.title}</h3>
                          <span className="text-xs text-muted-foreground uppercase">{ctf.category}</span> {/* Category/type */}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ctf.competition}</p>
                        <div className="flex flex-wrap gap-1">
                          {ctf.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20" data-fade-in>
                <CardHeader>
                  <CardTitle className="text-xl">Challenge Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-cyan-400 mb-1">🌐 Web Exploitation</h3>
                    <p className="text-sm text-muted-foreground">
                      SQL injection, XSS, CSRF, and authentication bypass techniques with practical examples and prevention methods.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-emerald-400 mb-1">⛓️ Web3 Blockchain</h3>
                    <p className="text-sm text-muted-foreground">
                      Smart contracts, code exploration, routing attacks, stolen keys and more.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-violet-400 mb-1">🤖 AI/ML Attacks</h3>
                    <p className="text-sm text-muted-foreground">
                      Prompt injections, Data/Output attacks, MCP vulnerabilities .
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-400 mb-1">⚙️ Binary Exploitation</h3>
                    <p className="text-sm text-muted-foreground">
                      Binary analysis, reverse engineering, BoF and ROPs.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400 mb-1">🔐 Cryptography</h3>
                    <p className="text-sm text-muted-foreground">
                      Classical ciphers, modern encryption analysis, and cryptographic protocol vulnerabilities.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-grey-400 mb-1">🕵️ Digital Forensics</h3>
                    <p className="text-sm text-muted-foreground">
                      Evidence analysis, data recovery, and investigation techniques using industry-standard tools.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-hover theme-orange border-orange-500/20 hover:ring-1 hover:ring-orange-500/20" data-fade-in>
              <CardHeader>
                <CardTitle className="text-xl">Learning Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  I usually practice on platforms like HackTheBox, PortSwigger, Hextree.io.. and sometimes participate in weekend CTF competitions. These challenges are useful to learn new techniques and edge cases.
                </p>
              </CardContent>
            </Card>
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
