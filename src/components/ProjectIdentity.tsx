import { Boxes, Fish, Network, Terminal, Wrench } from 'lucide-react';
import type { Project } from '@/data/projects';

export default function ProjectIdentity({project, className = ''}: {project:Project; className?:string}) {
  if (project.logo) return <img className={`project-identity ${className}`} src={project.logo} alt="" width={192} height={192} loading="lazy" />;
  const Icon = project.id === 'ShellCy' ? Terminal : project.id === 'browphish' ? Fish : project.id === 'blockcheat' ? Boxes : project.id === 'Ida' ? Wrench : Network;
  return <span className={`project-identity project-identity-symbol ${className}`} aria-hidden="true"><Icon size={44} strokeWidth={1.25} /></span>;
}
