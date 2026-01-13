import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Home, CheckCircle2, 
  Loader2, Crosshair, Award, Calendar, 
  ExternalLink, ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import certifications, { Certification } from '@/data/certifications';

export default function CertificationsView({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();

  // Sort/Filter Data
  const taken = certifications.filter((c) => c.status === 'taken');
  const inProgress = certifications.filter((c) => c.status === 'in-progress');
  const todo = certifications.filter((c) => c.status === 'todo');

  return (
    <div className="min-h-screen bg-background text-foreground bg-[url('/grid-pattern.svg')]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12 fade-in-section">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="group hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" /> 
              Back
            </Button>
            <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block"></div>
            <div>
              <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tight">
                <span className="gradient-text">Roadmap</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                My roadmap and certification journey
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-success/20 via-warning/20 to-muted/20 -z-10" />

          {/* COLUMN 1: ACQUIRED */}
          <div className="space-y-6 fade-in-section" style={{ animationDelay: '0.1s' }}>
            <RoadmapHeader 
              icon={<ShieldCheck className="w-5 h-5 text-success" />}
              title="Acquired"
              subtitle="Completed studies"
              color="success"
            />
            <div className="space-y-4">
              {taken.map((cert) => (
                <CertCard key={cert.id} cert={cert} variant="taken" />
              ))}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="space-y-6 fade-in-section" style={{ animationDelay: '0.2s' }}>
            <RoadmapHeader 
              icon={<Loader2 className="w-5 h-5 text-warning animate-spin-slow" />}
              title="In Progress"
              subtitle="Active studies"
              color="warning"
            />
            <div className="space-y-4">
              {inProgress.map((cert) => (
                <CertCard key={cert.id} cert={cert} variant="progress" />
              ))}
            </div>
          </div>

          {/* COLUMN 3: TARGETS */}
          <div className="space-y-6 fade-in-section" style={{ animationDelay: '0.3s' }}>
            <RoadmapHeader 
              icon={<Crosshair className="w-5 h-5 text-destructive" />}
              title="Targets"
              subtitle="Future objectives"
              color="destructive"
            />
            <div className="space-y-4">
              {todo.map((cert) => (
                <CertCard key={cert.id} cert={cert} variant="todo" />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function RoadmapHeader({ icon, title, subtitle, color }: { icon: React.ReactNode, title: string, subtitle: string, color: string }) {
  const colorClasses: Record<string, string> = {
    success: "text-success",
    warning: "text-warning",
    muted: "text-muted-foreground",
    destructive: "text-destructive"
  };

  return (
    <div className="flex flex-col items-center lg:items-start mb-4">
      <div className={`
        flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background/50 backdrop-blur-sm mb-2
        ${color === 'success' ? 'border-success/30 text-success' : ''}
        ${color === 'warning' ? 'border-warning/30 text-warning' : ''}
        ${color === 'muted' ? 'border-border text-muted-foreground' : ''}
        ${color === 'destructive' ? 'border-destructive/30 text-destructive' : ''}
      `}>
        {icon}
        <span className="font-mono font-bold uppercase text-xs tracking-wider">{title}</span>
      </div>
      <span className="text-xs text-muted-foreground hidden lg:block ml-2">{subtitle}</span>
    </div>
  );
}

function CertCard({ cert, variant }: { cert: Certification, variant: 'taken' | 'progress' | 'todo' }) {
  // Dynamic Styles based on variant
  const styles = {
    taken: "border-success/40 bg-success/5 hover:border-success/60 hover:bg-success/10",
    progress: "border-warning/50 bg-warning/5 hover:border-warning/70 hover:bg-warning/10 ring-1 ring-warning/20",
    todo: "border-destructive/40 bg-destructive/5 hover:border-destructive/60 hover:bg-destructive/10 border-dashed opacity-95 hover:opacity-100"
  };

  const badgeStyles = {
    taken: "bg-success/20 text-success hover:bg-success/30 border-success/20",
    progress: "bg-warning/20 text-warning hover:bg-warning/30 border-warning/20",
    todo: "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20"
  };

  return (
    <Card className={`
      relative transition-all duration-300 group
      ${styles[variant]}
    `}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`text-[10px] h-5 ${badgeStyles[variant]}`}>
            {cert.issuer}
          </Badge>
          
          {/* Year or Icon indicator */}
          {cert.year && (
            <div className="flex items-center text-[10px] text-muted-foreground font-mono bg-background/50 px-2 py-0.5 rounded">
              <Calendar className="w-3 h-3 mr-1" />
              {cert.year}
            </div>
          )}
          {variant === 'todo' && <Crosshair className="w-4 h-4 text-destructive" />}
        </div>
        
        <CardTitle className="text-base font-semibold leading-tight mt-2 flex items-center gap-2">
          {cert.title}
          {variant === 'taken' && <CheckCircle2 className="w-4 h-4 text-success inline-block" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {cert.description}
        </p>

        {cert.link && (
          <div className="mt-3 pt-3 border-t border-border/50 flex justify-end">
            <a 
              href={cert.link} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs flex items-center hover:text-primary transition-colors"
            >
              View Details <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}

        {/* Progress Variant: Animated Bar */}
        {variant === 'progress' && (
          <div className="mt-3 w-full h-1 bg-muted rounded-full overflow-hidden">
             <div className="h-full bg-warning animate-[loading_2s_ease-in-out_infinite]" style={{ width: `${cert.progress || 33}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}