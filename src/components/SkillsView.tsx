import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Terminal, Shield, Cpu, 
  Code2, Globe, Network, Bot, Database, Command, FileCode, 
  Ship, Phone, Wifi, Binary, Server, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import skillsData, { Skill } from '@/data/skills';

// --- DATA FALLBACK ---
// Mappa locale per garantire che le descrizioni appaiano subito
const skillDetails: Record<string, { description: string, tags: string[] }> = {
  python: {
    description: 'Automation scripting, exploit development & Data Analysis. Experience with async, socket programming and API integration.',
    tags: ['Requests', 'Scapy', 'Pandas', 'FastAPI']
  },
  ccpp: {
    description: 'Low-level programming and memory management. Essential for buffer overflow analysis and writing custom shellcode.',
    tags: ['Pointers', 'Memory Ops', 'Buffer Overflow', 'GDB']
  },
  go: {
    description: 'High-performance concurrency and network tools. Used for building fast scanners and blockchain interactions.',
    tags: ['Concurrency', 'Networking', 'CLI Tools']
  },
  java: {
    description: 'Enterprise app structure and OOP. Key for analyzing Android APKs and legacy web applications.',
    tags: ['OOP', 'Spring', 'Android Analysis']
  },
  js: {
    description: 'Client-side analysis, DOM manipulation and XSS vector crafting. Node.js for backend scripting.',
    tags: ['DOM', 'XSS', 'Node.js', 'React']
  },
  bash: {
    description: 'Advanced system automation and recon scripting. Piping, text processing (grep/sed/awk) and cron jobs.',
    tags: ['Scripting', 'Automation', 'Text Proc']
  },
  terraform: {
    description: 'Infrastructure as Code (IaC) for deploying scalable pentest labs and cloud environments quickly.',
    tags: ['IaC', 'AWS', 'State Mgmt']
  },
  docker: {
    description: 'Containerization for isolated testing environments and vulnerable labs creation.',
    tags: ['Compose', 'Isolation', 'Networking']
  },
  web: {
    description: 'Comprehensive web app testing: Auth bypass, SQLi, XSS, SSRF, IDOR and business logic flaws.',
    tags: ['OWASP Top 10', 'Burp Suite', 'Injection']
  },
  network: {
    description: 'Active Directory exploitation, pivoting, Kerberoasting, and internal infrastructure mapping.',
    tags: ['Active Directory', 'Pivoting', 'Kerberos']
  },
  ai: {
    description: 'Testing LLMs for prompt injection, jailbreaking, and model inversion attacks.',
    tags: ['Prompt Injection', 'LLM Security']
  },
  binary: {
    description: 'Reverse engineering and binary exploitation. Stack/Heap overflows and ROP chains.',
    tags: ['Ghidra', 'ROP', 'Buffer Overflow']
  },
  mobile: {
    description: 'Android/iOS security assessment. Static analysis with JADX and dynamic instrumentation with Frida.',
    tags: ['JADX', 'Frida', 'APK Analysis']
  },
  wifi: {
    description: 'Wireless network auditing. WEP/WPA2 cracking and rogue access point analysis.',
    tags: ['Aircrack-ng', 'WPA2', 'Handshake']
  },
  linux: {
    description: 'Deep knowledge of Linux internals, permissions, and kernel space for server management and CTFs.',
    tags: ['Kernel', 'Permissions', 'Hardening']
  },
  windows: {
    description: 'Windows administration and AD management. GPOs, PowerShell automation and registry manipulation.',
    tags: ['Active Directory', 'PowerShell', 'GPO']
  },
};

// Interfaccia estesa
interface SkillWithDetails extends Skill {
  description?: string;
  tags?: string[];
}

export default function SkillsView({ onBack }: { onBack: () => void }) {
  // Arricchiamo i dati con le descrizioni locali
  const enrichedSkills = skillsData.map(s => ({
    ...s,
    description: skillDetails[s.id]?.description || s.description,
    tags: skillDetails[s.id]?.tags || (s as any).tags
  }));

  // Filtri Categorie
  const programming = enrichedSkills.filter(s => ['python', 'js', 'go', 'ccpp', 'java'].includes(s.id));
  const scripting = enrichedSkills.filter(s => ['bash', 'terraform', 'docker'].includes(s.id));
  const security = enrichedSkills.filter(s => ['web', 'network', 'ai', 'binary', 'mobile', 'wifi'].includes(s.id));
  const systems = enrichedSkills.filter(s => ['linux', 'windows'].includes(s.id));

  // Stato Popup
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.skill-interactive-item')) {
        setActiveSkillId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: string) => {
    setActiveSkillId(activeSkillId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-[url('/grid-pattern.svg')]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        
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
            
            {/* Programming Languages - Green/Success Theme */}
            <div className="fade-in-section" style={{ animationDelay: '0.1s' }}>
              <SkillCard 
                icon={<Terminal className="w-5 h-5 text-success" />}
                title="Coding"
                description="Languages I studied or used for projects development"
                variant="success" 
              >
                <div className="space-y-4">
                  {programming.map((skill) => (
                    <InteractiveSkillRow 
                      key={skill.id} 
                      skill={skill} 
                      icon={getSkillIcon(skill.id)}
                      isActive={activeSkillId === skill.id}
                      onToggle={() => handleToggle(skill.id)}
                    />
                  ))}
                </div>
              </SkillCard>
            </div>

            {/* Infrastructure & Scripting - Purple/Accent Theme */}
            <div className="fade-in-section" style={{ animationDelay: '0.2s' }}>
              <SkillCard 
                icon={<Database className="w-5 h-5 text-accent" />}
                title="Infra & Automation"
                description="IaC scripting and deployments workflows."
                variant="accent"
              >
                <div className="space-y-4">
                  {scripting.map((skill) => (
                    <InteractiveSkillRow 
                      key={skill.id} 
                      skill={skill} 
                      icon={getSkillIcon(skill.id)} 
                      variant="accent"
                      isActive={activeSkillId === skill.id}
                      onToggle={() => handleToggle(skill.id)}
                    />
                  ))}
                </div>
              </SkillCard>
            </div>
            
            {/* Hint Footer */}
             <div className="fade-in-section" style={{ animationDelay: '0.5s' }}>
               <div className="rounded-xl border border-dashed border-border p-4 text-center bg-muted/5">
                 <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                   <Info className="w-4 h-4" />
                   Click on any skill to view details.
                 </p>
               </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SECURITY & SYSTEMS (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Security Fields - Red/Destructive Theme */}
            <div className="fade-in-section" style={{ animationDelay: '0.3s' }}>
              {/* Usa SkillCard anche qui per consistenza, ma con layout interno diverso */}
              <SkillCard 
                icon={<Shield className="w-6 h-6 text-destructive" />}
                title="Offensive Security"
                description="Specialized areas of security practice."
                variant="destructive"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  {security.map((skill) => (
                    <InteractiveSecurityCard 
                      key={skill.id}
                      skill={skill}
                      isActive={activeSkillId === skill.id}
                      onToggle={() => handleToggle(skill.id)}
                    />
                  ))}
                </div>
              </SkillCard>
            </div>

            {/* Operating Systems - Yellow/Warning Theme */}
            <div className="fade-in-section" style={{ animationDelay: '0.4s' }}>
              <SkillCard 
                icon={<Server className="w-5 h-5 text-warning" />}
                title="Operating Systems"
                description="Low level understanding and management of the OS"
                variant="warning"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {systems.map((skill) => (
                    <InteractiveSkillRow 
                      key={skill.id} 
                      skill={skill} 
                      icon={getSkillIcon(skill.id)}
                      variant="warning"
                      isActive={activeSkillId === skill.id}
                      onToggle={() => handleToggle(skill.id)}
                      layout="grid"
                    />
                  ))}
                </div>
              </SkillCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Interactive Components ---

function InteractiveSkillRow({ 
  skill, 
  icon, 
  variant = 'primary',
  isActive,
  onToggle,
  layout = 'row'
}: { 
  skill: SkillWithDetails, 
  icon: React.ReactNode,
  variant?: string,
  isActive: boolean,
  onToggle: () => void,
  layout?: 'row' | 'grid'
}) {
  
  const hoverColorClass: Record<string, string> = {
    primary: 'group-hover:text-primary group-hover:border-primary',
    secondary: 'group-hover:text-secondary group-hover:border-secondary',
    accent: 'group-hover:text-accent group-hover:border-accent',
    warning: 'group-hover:text-warning group-hover:border-warning',
    success: 'group-hover:text-success group-hover:border-success',
    destructive: 'group-hover:text-destructive group-hover:border-destructive',
  };

  const activeClass = hoverColorClass[variant] || hoverColorClass.primary;
  const borderColor = activeClass.split(' ')[1]; 

  return (
    <div className="relative skill-interactive-item h-full">
      <div 
        onClick={onToggle}
        className={`
          group relative cursor-pointer h-full
          ${layout === 'grid' 
            ? 'flex items-center gap-4 p-3 rounded-lg border border-border/40 bg-muted/10 transition-all duration-300 hover:bg-muted/20' 
            : 'flex items-center justify-between p-2 rounded-lg border border-transparent hover:bg-muted/30 transition-all duration-300'}
        `}
      >
        <CornerBorders colorClass={borderColor} />

        <div className="flex items-center gap-3 w-full">
          <div className={`text-muted-foreground transition-colors ${activeClass.split(' ')[0]}`}>
            {icon}
          </div>
          <div className="flex-1 flex justify-between items-center">
             <span className={`font-medium text-sm transition-colors ${activeClass.split(' ')[0]}`}>
              {skill.name}
            </span>
          </div>
        </div>
      </div>

      {isActive && (
        <DetailedSkillPopup skill={skill} variant={variant} icon={icon} />
      )}
    </div>
  );
}

function InteractiveSecurityCard({
  skill,
  isActive,
  onToggle
}: {
  skill: SkillWithDetails,
  isActive: boolean,
  onToggle: () => void
}) {
  return (
    <div className="relative skill-interactive-item h-full">
      <div 
        onClick={onToggle}
        className="group relative p-4 h-full rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
      >
        <CornerBorders colorClass="group-hover:border-destructive" />
        
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-background border border-border group-hover:border-destructive/50 transition-colors text-muted-foreground group-hover:text-destructive">
            {getSkillIcon(skill.id)}
          </div>
        </div>
        
        <h3 className="font-bold text-foreground mb-1 group-hover:text-destructive transition-colors">
          {skill.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
           {skill.description}
        </p>
      </div>

      {isActive && (
        <DetailedSkillPopup 
          skill={skill} 
          variant="destructive" 
          icon={getSkillIcon(skill.id)} 
        />
      )}
    </div>
  );
}

function DetailedSkillPopup({ 
  skill, 
  variant, 
  icon,
}: { 
  skill: SkillWithDetails, 
  variant?: string, 
  icon: React.ReactNode,
}) {
  const textColor = variant === 'destructive' ? 'text-destructive' 
    : variant === 'success' ? 'text-success'
    : variant === 'warning' ? 'text-warning'
    : variant === 'accent' ? 'text-accent'
    : 'text-primary';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] z-50">
      <div className="bg-popover border border-border shadow-2xl rounded-xl p-5 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-border/50">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={textColor}>{icon}</div>
            <h4 className="font-bold font-mono text-base">{skill.name}</h4>
          </div>
          <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Info</div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {skill.description}
        </p>

        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/30">
            {skill.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-secondary/50 text-secondary-foreground rounded-md border border-border/10">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper & UI Components ---

function SkillCard({ 
  icon, 
  title, 
  description, 
  children, 
  variant = 'primary' 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  children: React.ReactNode,
  variant?: string
}) {

  // Gradiente "Ricco" con barra spessa (h-1)
  // from-color via-lighter-color to-color
  const gradientClass = {
     success: "from-success via-emerald-400 to-success",
     accent: "from-accent via-violet-400 to-accent",
     warning: "from-warning via-orange-300 to-warning",
     destructive: "from-destructive via-warning to-destructive", // Come richiesto
     primary: "from-primary via-blue-400 to-primary",
  }[variant] || "from-primary via-blue-400 to-primary";

  return (
    <Card 
      // rounded-xl per mantenere lo stile originale curvy ma non troppo
      className="border-border/50 bg-card/40 backdrop-blur-sm overflow-visible relative card-hover rounded-xl"
      style={{ '--hover-theme': `var(--${variant})` } as React.CSSProperties}
    >
      {/* Barra superiore spessa h-1 */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass} opacity-70 rounded-t-xl`} />

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="overflow-visible relative">
        {children}
      </CardContent>
    </Card>
  );
}

function CornerBorders({ colorClass }: { colorClass: string }) {
  return (
    <>
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-transparent transition-colors duration-300 rounded-tl-sm ${colorClass}`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent transition-colors duration-300 rounded-tr-sm ${colorClass}`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-transparent transition-colors duration-300 rounded-bl-sm ${colorClass}`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-transparent transition-colors duration-300 rounded-br-sm ${colorClass}`} />
    </>
  );
}

function getSkillIcon(id: string) {
  const icons: Record<string, React.ReactNode> = {
    python: <Code2 className="w-4 h-4" />,
    ccpp: <Cpu className="w-4 h-4" />,
    go: <Cpu className="w-4 h-4" />,
    js: <FileCode className="w-4 h-4" />,
    bash: <Command className="w-4 h-4" />,
    terraform: <Server className="w-4 h-4" />,
    web: <Globe className="w-5 h-5" />,
    network: <Network className="w-5 h-5" />,
    ai: <Bot className="w-5 h-5" />,
    binary: <Binary className="w-5 h-5" />,
    mobile: <Phone className="w-5 h-5" />,
    wifi: <Wifi className="w-5 h-5" />,
    linux: <Terminal className="w-5 h-5" />,
    windows: <Shield className="w-5 h-5" />, 
    docker: <Ship className="w-5 h-5" />,
    java: <Code2 className="w-4 h-4" />,
  };
  return icons[id] || <Terminal className="w-4 h-4" />;
}