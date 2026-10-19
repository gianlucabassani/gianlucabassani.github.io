import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Gitlab } from 'lucide-react';
import type { Project } from '@/data/projects';
import ProjectIdentity from '@/components/ProjectIdentity';

export function ProjectSources({project}: {project:Project}) {
  return <div className="project-sources">
    {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={15} aria-hidden="true" />GitHub</a>}
    {project.gitlabUrl && <a href={project.gitlabUrl} target="_blank" rel="noopener noreferrer"><Gitlab size={15} aria-hidden="true" />GitLab</a>}
    {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live site<ArrowUpRight size={15} aria-hidden="true" /></a>}
  </div>;
}

export default function ProjectShowcase({project, headingAs: Heading = 'h2'}: {project:Project; headingAs?:'h2'|'h3'}) {
  return <article className={`project-showcase project-showcase-${project.id}`}>
    <div className="project-showcase-art"><ProjectIdentity project={project} /></div>
    <div className="project-showcase-copy">
      <div className="project-meta"><span>{project.category}</span><span className={`project-status status-${project.status}`}>{project.status.replace('-', ' ')}</span></div>
      <Heading className="project-showcase-title"><Link className="project-showcase-link" to={`/projects/${project.id}`}>{project.title}<ArrowUpRight size={25} aria-hidden="true" /></Link></Heading>
      <p>{project.description}</p>
      <ul className="project-technologies" aria-label="Technologies">{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul>
      <ProjectSources project={project} />
    </div>
  </article>;
}
