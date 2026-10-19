import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Project, projects } from '@/data/projects';
import ProjectIdentity from '@/components/ProjectIdentity';
import ProjectShowcase, { ProjectSources } from '@/components/ProjectShowcase';
import PageBackground from '@/components/PageBackground';
import ProjectFilter from '@/components/ProjectFilter';

const categoryOptions = [{value:'all', label:'All categories', count:projects.length}, ...[...new Set(projects.map(project => project.category))].map(value => ({value, label:value, count:projects.filter(project => project.category === value).length}))];
const statusOptions = [{value:'all', label:'All statuses', count:projects.length}, ...[...new Set(projects.map(project => project.status))].map(value => ({value, label:value.replace('-', ' '), count:projects.filter(project => project.status === value).length}))];

interface ProjectsViewProps {
  onBack: () => void;
  onProjectSelect?: (project: Project) => void;
}


export default function ProjectsView({onBack}: ProjectsViewProps) {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState<'showcase' | 'list'>('showcase');
  const filtered = projects.filter(project => (category === 'all' || project.category === category) && (status === 'all' || project.status === status))
    .sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  const featured = view === 'showcase' ? filtered.filter(project => project.featured) : [];
  const remaining = filtered.filter(project => !featured.includes(project));
  return <div className="portfolio-page projects-page min-h-screen bg-background text-foreground relative">
    <PageBackground primary="hsl(315,80%,65%)" secondary="hsl(185,85%,65%)" tertiary="hsl(265,80%,70%)" />
    <main id="main-content" tabIndex={-1} className="portfolio-container relative z-10">
      <Button variant="outline" className="page-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" />Back to Home</Button>
      <header className="portfolio-page-heading">
        <h1>Projects<span aria-hidden="true">.</span></h1>
        <p>A collection of tools, applications, and libraries I've built</p>
      </header>
      <div className="project-toolbar">
        <div className="project-filter-controls">
          <ProjectFilter label="Category" value={category} options={categoryOptions} onChange={setCategory} kind="category" />
          <ProjectFilter label="Status" value={status} options={statusOptions} onChange={setStatus} kind="status" />
        </div>
        <div className="project-view-controls" role="group" aria-label="Project layout">
          <button type="button" aria-label="Showcase view" aria-pressed={view === 'showcase'} onClick={() => setView('showcase')}><LayoutGrid size={17} /></button>
          <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={17} /></button>
        </div>
      </div>
      {featured.length > 0 && <div className="project-showcases">
        {featured.map(project => <ProjectShowcase key={project.id} project={project} />)}
      </div>}
      {remaining.length > 0 && <section className="project-directory" aria-label="Project directory">
        {featured.length > 0 && <h2>More projects</h2>}
        {remaining.map(project => <article className="project-directory-row" key={project.id}>
          <Link to={`/projects/${project.id}`} className="project-directory-main">
            <ProjectIdentity project={project} />
            <div><h3>{project.title}<ArrowUpRight size={18} aria-hidden="true" /></h3><p>{project.summary}</p></div>
          </Link>
          <div className="project-directory-details"><span className={`project-status status-${project.status}`}>{project.status.replace('-', ' ')}</span><ProjectSources project={project} /></div>
        </article>)}
      </section>}
      {filtered.length === 0 && <div className="project-empty"><p>No projects match these filters.</p><Button variant="outline" onClick={() => {setCategory('all');setStatus('all');}}>Clear filters</Button></div>}
      <p className="project-result-count" role="status">{filtered.length} of {projects.length} projects</p>
    </main>
  </div>;
}
