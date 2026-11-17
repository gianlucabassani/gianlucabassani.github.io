import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/data/projects';
import ProjectIdentity from '@/components/ProjectIdentity';
import { ProjectSources } from '@/components/ProjectShowcase';
import { Button } from '@/components/ui/button';

const targets = [{ y: 78, label: 'web' }, { y: 124, label: 'api' }, { y: 170, label: 'db' }];

/**
 * The engine in one picture, following docs/OVERVIEW.md in the Nidavellir repo:
 * humans work through the console and agents through the MCP gateway; both act on a
 * temporary arena; the monitor and validators judge observed effects from outside it;
 * actions and verdicts end up in a record that outlives the arena.
 */
function ArenaDiagram() {
  return <svg className="spotlight-diagram" viewBox="0 0 560 330" role="img" aria-label="A human works through the console and an agent through the scoped MCP gateway. Both act on targets in a temporary Docker arena. A monitor and validators outside the arena judge the observed effects. Actions and verdicts are stored as findings, evidence, trace and score, which are kept after the arena is destroyed.">
    <g className="spotlight-flow" fill="none">
      <path d="M128 84H178C188 84 188 108 198 108H206" />
      <path d="M128 164H178C188 164 188 140 198 140H206" />
      <path d="M356 124H420" />
      <path d="M69 188V262" />
      <path d="M484 164V262" />
    </g>
    <text className="spotlight-caption" x="388" y="116" textAnchor="middle">EFFECTS</text>
    <text className="spotlight-caption" x="77" y="230">ACTIONS</text>
    <text className="spotlight-caption" x="476" y="230" textAnchor="end">VERDICTS</text>
    <rect className="spotlight-arena" x="206" y="38" width="150" height="172" />
    <text className="spotlight-caption" x="206" y="29">ARENA · DOCKER · TEMPORARY</text>
    <g className="spotlight-node" data-tone="aqua">
      <rect x="10" y="60" width="118" height="48" />
      <text x="69" y="81" textAnchor="middle">human</text>
      <text className="spotlight-node-note" x="69" y="97" textAnchor="middle">browser console</text>
    </g>
    <g className="spotlight-node" data-tone="pink">
      <path d="M10 140H118L128 150V188H20L10 178Z" />
      <text x="69" y="161" textAnchor="middle">agent</text>
      <text className="spotlight-node-note" x="69" y="177" textAnchor="middle">scoped MCP gateway</text>
    </g>
    {targets.map(target => <g className="spotlight-node spotlight-target" key={target.label}>
      <rect x="226" y={target.y - 17} width="110" height="34" />
      <circle cx="241" cy={target.y} r="3" />
      <text x="252" y={target.y + 4}>{target.label}</text>
    </g>)}
    <g className="spotlight-node" data-tone="lavender">
      <rect x="420" y="84" width="128" height="80" />
      <text x="484" y="113" textAnchor="middle">monitor +</text>
      <text x="484" y="129" textAnchor="middle">validators</text>
      <text className="spotlight-node-note" x="484" y="148" textAnchor="middle">confirm · refute</text>
    </g>
    <g className="spotlight-node spotlight-record">
      <rect x="10" y="262" width="538" height="46" />
      <text x="279" y="282" textAnchor="middle">findings · evidence · trace · score</text>
      <text className="spotlight-node-note" x="279" y="298" textAnchor="middle">kept after the arena is destroyed</text>
    </g>
  </svg>;
}

export default function ProjectSpotlight({ project }: { project: Project }) {
  const spotlight = project.spotlight;
  if (!spotlight) return null;
  const titleId = `spotlight-${project.id}`;
  return <article className="project-spotlight" aria-labelledby={titleId}>
    <svg className="spotlight-frame" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="spotlight-surface" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="hsl(270 29% 13% / 0.98)" /><stop offset="0.6" stopColor="hsl(268 29% 8% / 0.98)" /><stop offset="1" stopColor="hsl(246 31% 12% / 0.98)" />
      </linearGradient></defs>
      <path fill="url(#spotlight-surface)" d="M25 1H1199V575L1175 599H1V25Z" />
      <path className="spotlight-frame-edge" d="M1 72V25L25 1H310M890 1H1199V200M1199 480V575L1175 599H930M310 599H1V420" />
    </svg>
    <header className="spotlight-header">
      <ProjectIdentity project={project} />
      <div>
        <p className="spotlight-kicker">Flagship project<span className={`project-status status-${project.status}`}>{project.status.replace('-', ' ')}</span></p>
        <h3 id={titleId}><Link to={`/projects/${project.id}`}>{project.title}</Link></h3>
        <p className="spotlight-tagline">{spotlight.tagline}</p>
      </div>
    </header>
    <div className="spotlight-body">
      <div className="spotlight-copy">
        <p className="spotlight-pitch">{spotlight.pitch}</p>
        <dl className="spotlight-points">{spotlight.points.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
      </div>
      <figure className="spotlight-visual">
        <svg className="spotlight-visual-trace" viewBox="0 0 440 390" preserveAspectRatio="none" aria-hidden="true"><path d="M1 60V16L16 1H115M230 1H410L439 30V55M439 310V374L424 389H310M90 389H1" /></svg>
        <ArenaDiagram />
      </figure>
    </div>
    <footer className="spotlight-footer">
      <dl className="spotlight-facts">{spotlight.facts.map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
      <div className="spotlight-actions">
        <ProjectSources project={project} />
        <Button asChild variant="secondary"><Link to={`/projects/${project.id}`}>Project details<ArrowUpRight className="action-arrow" aria-hidden="true" /></Link></Button>
      </div>
    </footer>
  </article>;
}
