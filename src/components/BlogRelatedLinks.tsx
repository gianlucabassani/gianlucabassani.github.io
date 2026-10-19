import { ArrowRight, ArrowUpRight, FolderGit2, Github, Gitlab, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BlogRelatedLink } from '@/data/blog';

export default function BlogRelatedLinks({links}: {links: BlogRelatedLink[]}) {
  return <div className="reader-related-card">
    <h2 className="sr-only">Related links</h2>
    <ul>
      {links.map(link => {
        const external = /^https?:\/\//.test(link.href);
        const github = /^https?:\/\/(?:www\.)?github\.com(?:\/|$)/i.test(link.href);
        const gitlab = /^https?:\/\/(?:www\.)?gitlab\.com(?:\/|$)/i.test(link.href);
        const project = link.href.startsWith('/projects');
        const Icon = github ? Github : gitlab ? Gitlab : project ? FolderGit2 : Link2;
        const source = github ? 'github' : gitlab ? 'gitlab' : 'project';
        const action = github ? 'Open on GitHub' : gitlab ? 'Open on GitLab' : project ? 'Explore projects' : 'Open link';
        const content = <>
          <Icon className="reader-related-icon" size={32} strokeWidth={1.5} aria-hidden="true" />
          <span className="reader-related-link-title">{link.label}</span>
          {link.description && <span className="reader-related-description">{link.description}</span>}
          <span className="reader-related-action">{action}
            {external ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
          </span>
        </>;
        return <li key={link.href}>
          {external ? <a href={link.href} data-source={source}>{content}</a> : <Link to={link.href} data-source={source}>{content}</Link>}
        </li>;
      })}
    </ul>
  </div>;
}
