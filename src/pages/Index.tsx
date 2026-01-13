import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Terminal, Code, FileText, Flag, Github, ExternalLink, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Writeup } from '@/data/writeups';
import { CTFWriteup, ctfWriteups } from '@/data/ctf';
import { Project, projects } from '@/data/projects';
import skillsData, { Skill } from '@/data/skills';
import WriteupView from '@/components/WriteupView';
import PlatformView from '@/components/PlatformView';
import CTFView from '@/components/CTFView';
import ProjectView from '@/components/ProjectView';
import ProjectsView from '@/components/ProjectsView';
import SkillsView from '@/components/SkillsView';
import CertificationsView from '@/components/CertificationsView';
import heroImage from '@/assets/hero-cyber.jpg';
import { writeups } from '@/data/writeups';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    if (section === 'skills') {
      return { view: 'skills' as const };
    }
    if (section === 'certifications') {
      return { view: 'certifications' as const };
    }
    
    return { view: 'main' as const, section };
  };
  
  const currentRoute = parseRoute();
  const [currentView, setCurrentView] = useState<'main' | 'platform' | 'writeup' | 'ctf' | 'projects' | 'project' | 'skills' | 'certifications'>(currentRoute.view);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(currentRoute.platform || '');
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(null);
  const [selectedCTFWriteup, setSelectedCTFWriteup] = useState<CTFWriteup | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const navItems = [
    { id: 'about', label: 'About Me', icon: Shield },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'boxes', label: 'Box Writeups', icon: Terminal },
    { id: 'ctf', label: 'CTF Solves', icon: Flag }
  ];

  // Update view based on route changes
  useEffect(() => {
    const route = parseRoute();
    setCurrentView(route.view);
    setActiveSection(route.section || 'about');
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
    if (route.writeupId && route.platform) {
      const platformWriteups = writeups.filter(w => w.platform.toLowerCase() === route.platform.toLowerCase());
      const writeup = platformWriteups.find(w => w.id === route.writeupId);
      setSelectedWriteup(writeup || null);
    }
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
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

  // Helper function to get skill variant classes
  const getSkillClasses = (skillName: string): string => {
    const skill = skillsData.find(s => s.name === skillName);
    const variant = skill?.variant || 'secondary';
    
    const colorClasses = {
      primary: 'bg-primary/20 text-primary border-primary/30',
      secondary: 'bg-secondary/20 text-secondary border-secondary/30',
      accent: 'bg-accent/20 text-accent border-accent/30',
      warning: 'bg-warning/20 text-warning border-warning/30',
      success: 'bg-success/20 text-success border-success/30',
      destructive: 'bg-destructive/20 text-destructive border-destructive/30'
    };
    
    return colorClasses[variant] || colorClasses.secondary;
  };

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, currentView]);

  useEffect(() => {
    if (currentView !== 'main') return;
    
    // Observer for nav active state
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) navObserver.observe(element);
    });

    return () => navObserver.disconnect();
  }, [currentView]);

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
  if (currentView === 'writeup' && selectedWriteup) {
    return <WriteupView writeup={selectedWriteup} onBack={handleBackToPlatform} />;
  }

  if (currentView === 'ctf' && selectedCTFWriteup) {
    return <CTFView ctfWriteup={selectedCTFWriteup} onBack={handleBackToMain} />;
  }

  if (currentView === 'projects') {
    return <ProjectsView onBack={handleBackToMain} onProjectSelect={handleProjectSelect} />;
  }

  if (currentView === 'project' && selectedProject) {
    return <ProjectView project={selectedProject} onBack={handleBackToProjects} />;
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
    <div className="min-h-screen bg-background text-foreground tech-grid">
      {/* Scroll Progress Bar */}
      <div 
        className="scroll-progress" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="font-mono text-xl font-bold gradient-text">
              Gianluca Bassani | CyberSecurity
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                >
                  <item.icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left nav-link py-2 ${activeSection === item.id ? 'active' : ''}`}
                >
                  <item.icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="pt-20">
        {/* About Section */}
        <section id="about" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero */}
            <div className="relative text-center mb-12">
              <div 
                className="absolute inset-0 opacity-10 bg-cover bg-center rounded-3xl"
                style={{ backgroundImage: `url(${heroImage})` }}
              />
              <div className="relative z-10 py-20">
              <h1 className="text-5xl md:text-7xl font-mono font-bold mb-6">
                <span className="gradient-text">Welcome to my</span>
                <br />
                <span className="gradient-text-accent">digital space</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Cybersecurity enthusiast, developer, and problem solver sharing knowledge through writeups and projects.
              </p>
                <Button 
                  onClick={() => scrollToSection('projects')} 
                  size="lg" 
                  className="glow-primary bg-primary hover:bg-primary/80"
                >
                  Explore My Work
                  <ChevronDown className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* About Content */}
            <Card className="animated-border card-hover mb-6" data-fade-in>
              <CardHeader>
                <CardTitle className="text-2xl font-mono">About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-6">
                  Hello World! I'm Gianluca Bassani, an offensive security enthusiast always looking for the next cool thing to learn. This is my digital portfolio where I document and share my journey through various security challenges, development projects, and maybe some technical discoveries.
                </p>
                {/* Skills are available on the dedicated Skills page — click the Technical Skills card below to view in-depth */}
                {/* Technical Skills & Certifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Technical Skills */}
                  <Card
                    className="relative card-hover border-primary/20 cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden"
                    onClick={handleSkillsClick}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Code className="w-5 h-5 mr-2 text-primary" />
                        Technical Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Offensive Security</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={`tag ${getSkillClasses('Web Security')}`}>Web Security</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('Network Pentesting')}`}>Network Pentesting</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('AI Red Team')}`}>AI Red Team</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('Binary Exploitation')}`}>Binary Exploitation</Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Coding</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={`tag ${getSkillClasses('Python')}`}>Python</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('C/C++')}`}>C/C++</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('GO')}`}>GO</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('Java')}`}>Java</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('Javascript')}`}>Javascript</Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Infra & Automation</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={`tag ${getSkillClasses('Bash')}`}>Bash</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('Terraform')}`}>Terraform</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('Docker')}`}>Docker</Badge>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Operating Systems</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={`tag ${getSkillClasses('Linux (Debian/Arch)')}`}>Linux (Debian/Arch)</Badge>
                            <Badge variant="outline" className={`tag ${getSkillClasses('Windows Active Directory')}`}>Windows Active Directory</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="text-xs text-muted-foreground bg-background/40 px-2 py-1 rounded-md border border-border/20 backdrop-blur-sm">
                          Click to open
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card
                    className="relative card-hover border-secondary/20 cursor-pointer transition-all duration-200 hover:scale-102 overflow-hidden"
                    onClick={handleCertsClick}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Shield className="w-5 h-5 mr-2 text-secondary" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="font-medium">CCNA ITN, SRWE, ENSA</div>
                            <div className="text-sm text-muted-foreground">CISCO</div>
                          </div>
                          <Badge className="bg-success/20 border-success/40 text-success">Certified</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="font-medium">AI Red Teamer Course</div>
                            <div className="text-sm text-muted-foreground">Hack The Box</div>
                          </div>
                          <Badge className="bg-success/20 border-success/40 text-success">Certified</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="font-medium">Certified Penetration Tester Specialist (CPTS)</div>
                            <div className="text-sm text-muted-foreground">Hack The Box</div>
                          </div>
                          <Badge className="bg-warning/20 border-warning/40 text-warning">In Progress</Badge>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="text-xs text-muted-foreground bg-background/40 px-2 py-1 rounded-md border border-border/20 backdrop-blur-sm">
                          Click to open
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-xl font-mono font-semibold mb-6">What You'll Find Here</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="card-hover border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Shield className="w-5 h-5 mr-2 text-primary" />
                        Security Research
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Writeups of penetration testing challenges, vulnerability research, and security tool development.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-hover border-secondary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Code className="w-5 h-5 mr-2 text-secondary" />
                        Development Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Open-source tools, scripts, and applications developed for learning purposes or automation.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-hover border-accent/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <FileText className="w-5 h-5 mr-2 text-accent" />
                        Knowledge Sharing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Tutorials, blog posts, and educational content to help others learn and grow in cybersecurity.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-hover border-warning/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Flag className="w-5 h-5 mr-2 text-warning" />
                        CTF Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Solutions and strategies from Capture The Flag competitions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-mono font-bold mb-12 text-center gradient-text">Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {projects.slice(0, 2).map((project) => (
                <Card 
                  key={project.id}
                  className="card-hover border-primary/20 cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => handleProjectSelect(project)}
                  data-fade-in
                >
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                      <Terminal className="w-6 h-6 mr-2 text-primary" />
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-6">
                      {project.summary}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="secondary" className="tag">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {project.githubUrl && (
                        <Button 
                          variant="outline" 
                          className="flex-1 border-primary/30 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.githubUrl, '_blank');
                          }}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button 
                          variant="outline" 
                          className="flex-1 border-secondary/30 hover:bg-secondary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.liveUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={handleProjectsClick}
                size="lg"
                className="bg-primary hover:bg-primary/80"
              >
                View All Projects
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
          
            </div>
          </div>
        </section>

        {/* Boxes Writeups Section */}
        <section id="boxes" className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-mono font-bold mb-12 text-center gradient-text">Box Writeups</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card 
                className="card-hover border-success/20 cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handlePlatformClick('hackthebox')}
                data-fade-in
              >
                <CardHeader>
                  <CardTitle>HackTheBox</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Writeups for retired HackTheBox machines, organized by difficulty level.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="tag">Penetration Testing</Badge>
                    <Badge variant="secondary" className="tag">CTF</Badge>
                    <Badge variant="secondary" className="tag">Linux</Badge>
                    <Badge variant="secondary" className="tag">Windows</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-secondary/20" data-fade-in>
                <CardHeader>
                  <CardTitle>TryHackMe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Solutions and walkthroughs for TryHackMe rooms.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="tag">Beginner Friendly</Badge>
                    <Badge variant="secondary" className="tag">Learning Path</Badge>
                    <Badge variant="secondary" className="tag">Practical Skills</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-accent/20" data-fade-in>
                <CardHeader>
                  <CardTitle>VulnHub</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Boot-to-root challenges from VulnHub.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="tag">Local Lab</Badge>
                    <Badge variant="secondary" className="tag">Offline Practice</Badge>
                    <Badge variant="secondary" className="tag">Varied Scenarios</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="animated-border card-hover" data-fade-in>
              <CardHeader>
                <CardTitle className="text-xl">Methodology & Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Each writeup follows a structured methodology: reconnaissance, enumeration, exploitation, privilege escalation, and post-exploitation. All writeups include explanations and considerations of tools used, thought processes, and lessons learned for educational purposes.
                </p>
                <p className="text-sm text-primary">
                  Click on any platform above to explore the available writeups organized by difficulty level.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTF Section */}
        <section id="ctf" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-mono font-bold mb-12 text-center gradient-text">CTF Solves</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card className="card-hover" data-fade-in>
                <CardHeader>
                  <CardTitle className="text-xl">Recent CTF Writeups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ctfWriteups.map((ctf) => (
                      <div 
                        key={ctf.id}
                        className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleCTFSelect(ctf)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{ctf.title}</h3>
                          <span className="text-xs text-muted-foreground uppercase">{ctf.category}</span> {/* Category/type */}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ctf.competition}</p>
                        <div className="flex flex-wrap gap-1">
                          {ctf.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover" data-fade-in>
                <CardHeader>
                  <CardTitle className="text-xl">Challenge Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-primary mb-1">🌐 Web Exploitation</h3>
                    <p className="text-sm text-muted-foreground">
                      SQL injection, XSS, CSRF, and authentication bypass techniques with practical examples and prevention methods.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary mb-1">⛓️ Web3 Blockchain</h3>
                    <p className="text-sm text-muted-foreground">
                      Smart contracts, code exploration, routing attacks, stolen keys and more.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary mb-1">🤖 AI/ML Attacks</h3>
                    <p className="text-sm text-muted-foreground">
                      Prompt injections, Data/Output attacks, MCP vulnerabilities .
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-secondary mb-1">⚙️ Binary Exploitation</h3>
                    <p className="text-sm text-muted-foreground">
                      Binary analysis, reverse engineering, and program flow analysis.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-accent mb-1">🔐 Cryptography</h3>
                    <p className="text-sm text-muted-foreground">
                      Classical ciphers, modern encryption analysis, and cryptographic protocol vulnerabilities.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-warning mb-1">🕵️ Digital Forensics</h3>
                    <p className="text-sm text-muted-foreground">
                      Evidence analysis, data recovery, and investigation techniques using industry-standard tools.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-hover border-primary/20" data-fade-in>
              <CardHeader>
                <CardTitle className="text-xl">Learning Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  I regularly practice on platforms like HackTheBox, PortSwigger, Olicyber.. and sometimes participate in weekend CTF competitions. These challenges help me stay sharp and learn new techniques that I will try to document and share through writeups.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              &copy; 2025 Gianluca Bassani | Cybersecurity & Knowledge Sharing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;