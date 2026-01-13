import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Home, Terminal, Shield, Cpu, 
  Code2, Globe, Network, Lock, Server, 
  Binary, Bot, Database, Command, FileCode, 
  Ship
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import skillsData, { Skill } from '@/data/skills';

export default function SkillsView({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();

  // Filter Data
  const programming = skillsData.filter(s => ['python', 'js', 'go', 'ccpp', 'java'].includes(s.id));
  const scripting = skillsData.filter(s => ['bash', 'terraform', 'docker'].includes(s.id));
  const security = skillsData.filter(s => ['web', 'network', 'ai', 'binary'].includes(s.id));
  const systems = skillsData.filter(s => ['linux', 'windows'].includes(s.id));

  return (
    <div className="min-h-screen bg-background text-foreground bg-[url('/grid-pattern.svg')]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-10 fade-in-section">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="group hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" /> 
              Back
            </Button>
            <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block"></div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tight">
              <span className="gradient-text">Technical Skills</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: DEVELOPMENT (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Programming Languages */}
            <div className="fade-in-section" style={{ animationDelay: '0.1s' }}>
              <SkillCard 
                icon={<Terminal className="w-5 h-5 text-primary" />}
                title="Coding"
                description="Languages I studied or used for projects development"
              >
                <div className="space-y-6">
                  {programming.map((skill) => (
                    <SkillRow key={skill.id} skill={skill} icon={getSkillIcon(skill.id)} />
                  ))}
                </div>
              </SkillCard>
            </div>

            {/* Infrastructure & Scripting */}
            <div className="fade-in-section" style={{ animationDelay: '0.2s' }}>
              <SkillCard 
                icon={<Database className="w-5 h-5 text-accent" />}
                title="Infra & Automation"
                description="IaC scripting and deployments workflows."
              >
                <div className="space-y-6">
                  {scripting.map((skill) => (
                    <SkillRow key={skill.id} skill={skill} icon={getSkillIcon(skill.id)} />
                  ))}
                </div>
              </SkillCard>
            </div>
          </div>

          {/* RIGHT COLUMN: SECURITY & SYSTEMS (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Security Fields - Featured Section */}
            <div className="fade-in-section" style={{ animationDelay: '0.3s' }}>
              <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive  via-warning to-destructive opacity-70" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-mono">
                    <Shield className="w-6 h-6 text-destructive" />
                    Offensive Security
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Specialized areas of security 
                  </p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {security.map((skill) => (
                    <div 
                      key={skill.id} 
                      className="group relative p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300 hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-lg bg-background border border-border group-hover:border-primary/50 transition-colors">
                          {getSkillIcon(skill.id)}
                        </div>
                        <Badge variant="outline" className={`
                          bg-background/50 backdrop-blur font-mono
                          ${skill.level > 80 ? 'text-primary border-primary/30' : 'text-muted-foreground'}
                        `}>
                          {skill.level}%
                        </Badge>
                      </div>
                      
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed h-10">
                        {getSecurityDescription(skill.id)}
                      </p>
                      
                      {/* Progress Bar Mini */}
                      <div className="mt-4 w-full bg-background rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-destructive to-destructive/80" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Operating Systems */}
            <div className="fade-in-section" style={{ animationDelay: '0.4s' }}>
              <SkillCard 
                icon={<Server className="w-5 h-5 text-warning" />}
                title="Operating Environment"
                description="Low level understanding and management of the OS"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {systems.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/40 bg-muted/10">
                      <div className="text-foreground">
                        {getSkillIcon(skill.id)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">{skill.level}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out
                              ${skill.variant === 'primary' ? 'bg-primary' : 
                                skill.variant === 'secondary' ? 'bg-secondary' : 
                                skill.variant === 'accent' ? 'bg-accent' : 
                                skill.variant === 'warning' ? 'bg-warning' : 
                                skill.variant === 'destructive' ? 'bg-destructive' : 'bg-success'}
                            `}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SkillCard>
            </div>

            {/* CV / Export Info */}
            <div className="fade-in-section" style={{ animationDelay: '0.5s' }}>
               <div className="rounded-xl border border-dashed border-border p-6 text-center bg-muted/5">
                 <p className="text-sm text-muted-foreground">
                   Proficiency metrics are estimated based on project usage and study/certification criteria.
                   <br />
                   <span className="opacity-50">Last updated: 01/2026</span>
                 </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SkillCard({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function SkillRow({ skill, icon }: { skill: Skill, icon: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground group-hover:text-foreground transition-colors">
            {icon}
          </div>
          <span className="font-medium text-sm group-hover:text-primary transition-colors">
            {skill.name}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {skill.level}%
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-125
            ${skill.variant === 'primary' ? 'bg-primary' : 
              skill.variant === 'secondary' ? 'bg-secondary' : 
              skill.variant === 'accent' ? 'bg-accent' : 
              skill.variant === 'warning' ? 'bg-warning' : 
              skill.variant === 'destructive' ? 'bg-destructive' : 'bg-success'}
          `}
          style={{ width: `${skill.level}%` }}
        />
      </div>
    </div>
  );
}

// --- Data Helpers ---

function getSkillIcon(id: string) {
  const icons: Record<string, React.ReactNode> = {
    python: <Code2 className="w-4 h-4" />,
    ccpp: <Cpu className="w-4 h-4" />,
    go: <Cpu className="w-4 h-4" />,
    js: <FileCode className="w-4 h-4" />,
    bash: <Command className="w-4 h-4" />,
    terraform: <Server className="w-4 h-4" />,
    dev: <Terminal className="w-4 h-4" />,
    web: <Globe className="w-5 h-5" />,
    network: <Network className="w-5 h-5" />,
    ai: <Bot className="w-5 h-5" />,
    binary: <Binary className="w-5 h-5" />,
    linux: <Terminal className="w-5 h-5" />,
    windows: <Monitor className="w-5 h-5" />,
    docker: <Ship className="w-5 h-5" />,
    java: <Code2 className="w-4 h-4" />,
  };
  return icons[id] || <Terminal className="w-4 h-4" />;
}

// Fallback for Monitor icon if not imported
const Monitor = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);


function getSecurityDescription(id: string) {
  switch (id) {
    case 'web':
      return 'Auth, sessions, injection vectors & business logic.';
    case 'network':
      return 'Active Directory, pivoting & infrastructure attacks.';
    case 'ai':
      return 'LLM Injection, model inversion & poisoning.';
    case 'binary':
      return 'Reverse engineering, buffer overflows & rop chains.';
    default:
      return 'Security research and testing.';
  }
}