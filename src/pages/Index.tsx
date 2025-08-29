import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Terminal, Code, FileText, Flag, Github, ExternalLink, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Writeup } from '@/data/writeups';
import { CTFWriteup, ctfWriteups } from '@/data/ctf';
import { BlogPost, blogPosts } from '@/data/blog';
import WriteupView from '@/components/WriteupView';
import PlatformView from '@/components/PlatformView';
import CTFView from '@/components/CTFView';
import BlogView from '@/components/BlogView';
import heroImage from '@/assets/hero-cyber.jpg';

const Index = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'platform' | 'writeup' | 'ctf' | 'blog'>('main');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(null);
  const location = useLocation();
  const [selectedCTFWriteup, setSelectedCTFWriteup] = useState<CTFWriteup | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  
  const navItems = [
    { id: 'about', label: 'About Me', icon: Shield },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'boxes', label: 'Box Writeups', icon: Terminal },
    { id: 'ctf', label: 'CTF Solves', icon: Flag }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    setCurrentView('main');
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlatformClick = (platform: string) => {
    setSelectedPlatform(platform);
    setCurrentView('platform');
  };

  const handleWriteupSelect = (writeup: Writeup) => {
    setSelectedWriteup(writeup);
    setCurrentView('writeup');
  };

  const handleCTFSelect = (ctfWriteup: CTFWriteup) => {
    setSelectedCTFWriteup(ctfWriteup);
    setCurrentView('ctf');
  };

  const handleBlogSelect = (blogPost: BlogPost) => {
    setSelectedBlogPost(blogPost);
    setCurrentView('blog');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedPlatform('');
    setSelectedWriteup(null);
    setSelectedCTFWriteup(null);
    setSelectedBlogPost(null);
  };

  const handleBackToPlatform = () => {
    setCurrentView('platform');
    setSelectedWriteup(null);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, currentView]);

  useEffect(() => {
    if (currentView !== 'main') return;
    
    const observer = new IntersectionObserver(
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
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [currentView]);

  // Handle different views
  if (currentView === 'writeup' && selectedWriteup) {
    return <WriteupView writeup={selectedWriteup} onBack={handleBackToPlatform} />;
  }

  if (currentView === 'ctf' && selectedCTFWriteup) {
    return <CTFView ctfWriteup={selectedCTFWriteup} onBack={handleBackToMain} />;
  }

  if (currentView === 'blog' && selectedBlogPost) {
    return <BlogView blogPost={selectedBlogPost} onBack={handleBackToMain} />;
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
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="font-mono text-xl font-bold gradient-text">
              Gianluca Bassani
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
        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero */}
            <div className="relative text-center mb-16">
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
            <Card className="animated-border card-hover mb-12">
              <CardHeader>
                <CardTitle className="text-2xl font-mono">About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-6">
                  Hello! I'm Gianluca Bassani, a passionate cybersecurity professional with a love for solving complex challenges and sharing knowledge with the community. This site serves as my digital portfolio where I document my journey through various security challenges, development projects, and technical discoveries.
                </p>
                
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

        {/* Blog Section */}
        <section id="blog" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-mono font-bold mb-12 text-center gradient-text">Blog</h2>
            
            <div className="space-y-8">
              {blogPosts.map((post) => (
                <Card 
                  key={post.id}
                  className="card-hover cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => handleBlogSelect(post)}
                >
                  <CardHeader>
                    <div className="text-sm text-muted-foreground mb-2">{new Date(post.date).toLocaleDateString()} • {post.readTime}</div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {post.summary}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="tag">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="card-hover border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    More blog posts are in the works! Topics will include advanced penetration testing techniques, malware analysis, and cybersecurity career guidance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-mono font-bold mb-12 text-center gradient-text">Projects</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="card-hover glow-primary">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Terminal className="w-6 h-6 mr-2 text-primary" />
                    Browsint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-6">
                    A comprehensive browser-based OSINT (Open Source Intelligence) toolkit for cybersecurity professionals and researchers. Features automated reconnaissance, data collection, and analysis capabilities.
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="secondary" className="tag">OSINT</Badge>
                    <Badge variant="secondary" className="tag">Reconnaissance</Badge>
                    <Badge variant="secondary" className="tag">Web-Scanner</Badge>
                    <Badge variant="secondary" className="tag">Profilation</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 hover:bg-primary/10"
                    onClick={() => window.open('https://github.com/gianlucabassani/browsint', '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover border-secondary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-secondary">More Projects Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    In the meantime, feel free to explore my existing work and reach out if you'd like to collaborate on any projects.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Boxes Writeups Section */}
        <section id="boxes" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-mono font-bold mb-12 text-center gradient-text">Box Writeups</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card 
                className="card-hover border-success/20 cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => handlePlatformClick('hackthebox')}
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

              <Card className="card-hover border-secondary/20">
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

              <Card className="card-hover border-accent/20">
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

            <Card className="animated-border card-hover">
              <CardHeader>
                <CardTitle className="text-xl">Methodology & Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Each writeup follows a structured methodology: reconnaissance, enumeration, exploitation, privilege escalation, and post-exploitation. All writeups include detailed explanations of tools used, thought processes, and lessons learned for educational purposes.
                </p>
                <p className="text-sm text-primary">
                  Click on any platform above to explore the available writeups organized by difficulty level.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTF Section */}
        <section id="ctf" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-mono font-bold mb-12 text-center gradient-text">CTF Solves</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card className="card-hover">
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
                          <Badge variant="secondary">{ctf.points} pts</Badge>
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

              <Card className="card-hover">
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
                    <h3 className="font-semibold text-secondary mb-1">⚙️ Binary Exploitation</h3>
                    <p className="text-sm text-muted-foreground">
                      Binary analysis, malware reverse engineering, and program flow analysis.
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

            <Card className="card-hover border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">Learning Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  I regularly practice on platforms like PicoCTF, OverTheWire, and participate in weekend CTF competitions. These challenges help me stay sharp and learn new techniques that I then document and share through detailed writeups.
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
              &copy; 2024 Gianluca Bassani. Built with passion for cybersecurity and knowledge sharing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;