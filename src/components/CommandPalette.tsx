import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CornerDownLeft, ExternalLink, FileText, Flag, FolderGit2, Compass, Search } from 'lucide-react';
import { projects } from '@/data/projects';
import { getBlogPosts } from '@/data/blog';
import { writeups } from '@/data/writeups';
import { ctfWriteups } from '@/data/ctf';
import { contactLinks } from '@/data/profile';

type Entry = { id: string; group: string; title: string; hint?: string; keywords: string; to?: string; href?: string };

const pages: [string, string, string][] = [
  ['/', 'Home', 'start top'],
  ['/about', 'About Me', 'profile skills radar'],
  ['/projects', 'Projects', 'tools open source'],
  ['/blog', 'Blog', 'articles research posts'],
  ['/boxes', 'Box Writeups', 'hackthebox machines labs'],
  ['/ctf', 'CTF Solves', 'challenges flags'],
  ['/skills', 'Skills', 'languages security'],
  ['/certifications', 'Roadmap', 'courses certifications exams'],
  ['/terminal', 'CLI Console', 'terminal shell games easter egg'],
  ['/contact', 'Contact', 'email hire reach message'],
];

const entries: Entry[] = [
  ...pages.map(([to, title, keywords]) => ({ id: `page:${to}`, group: 'Go to', title, keywords, to })),
  ...projects.map(project => ({ id: `project:${project.id}`, group: 'Projects', title: project.title, hint: project.summary, keywords: [...project.tags, ...project.technologies].join(' '), to: `/projects/${project.id}` })),
  ...getBlogPosts().map(post => ({ id: `blog:${post.id}`, group: 'Articles', title: post.title, hint: post.summary, keywords: post.tags.join(' '), to: `/blog/${post.id}` })),
  ...writeups.map(post => ({ id: `box:${post.id}`, group: 'Box writeups', title: post.title, hint: `${post.platform} · ${post.os} · ${post.difficulty}`, keywords: post.tags.join(' '), to: `/boxes/${post.platform}/${post.id}` })),
  ...ctfWriteups.map(post => ({ id: `ctf:${post.id}`, group: 'CTF solves', title: post.title, hint: `${post.competition} · ${post.category}`, keywords: post.tags.join(' '), to: `/ctf/${post.id}` })),
  ...contactLinks.map(link => ({ id: `link:${link.id}`, group: 'Links', title: link.label, hint: link.value, keywords: 'contact profile social', href: link.href })),
  { id: 'link:rss', group: 'Links', title: 'RSS feed', hint: '/feed.xml', keywords: 'subscribe atom', href: '/feed.xml' },
];

const icons: Record<string, typeof Box> = { 'Go to': Compass, Projects: FolderGit2, Articles: FileText, 'Box writeups': Box, 'CTF solves': Flag, Links: ExternalLink };

function search(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return entries.filter(entry => entry.group === 'Go to' || entry.group === 'Projects');
  return entries
    .map(entry => {
      const title = entry.title.toLowerCase();
      const rest = `${entry.group} ${entry.hint ?? ''} ${entry.keywords}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (title.startsWith(term)) score += 4;
        else if (title.includes(term)) score += 3;
        else if (rest.includes(term)) score += 1;
        else return null;
      }
      return { entry, score };
    })
    .filter((match): match is { entry: Entry; score: number } => match !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map(match => match.entry);
}

/** Ctrl/Cmd+K (or "/") opens a keyboard-driven jump list over every page and publication. */
export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    const show = () => { opener.current = document.activeElement as HTMLElement | null; setQuery(''); setActive(0); setOpen(true); };
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); show(); }
      else if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); show(); }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', show);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-command-palette', show); };
  }, []);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = overflow; };
  }, [open]);

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, results]);

  if (!open) return null;
  const close = (restoreFocus = true) => { setOpen(false); if (restoreFocus) opener.current?.focus?.(); };
  const run = (entry: Entry) => {
    close(false);
    if (entry.to) navigate(entry.to);
    else if (entry.href) window.open(entry.href, entry.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => (index + 1) % Math.max(1, results.length)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => (index - 1 + results.length) % Math.max(1, results.length)); }
    else if (event.key === 'Enter' && results[active]) { event.preventDefault(); run(results[active]); }
    else if (event.key === 'Tab') { event.preventDefault(); input.current?.focus(); }
  };

  let previousGroup = '';
  return <div className="command-palette" onKeyDown={onKeyDown}>
    <div className="command-palette-backdrop" onClick={() => close()} />
    <div className="command-palette-dialog" role="dialog" aria-modal="true" aria-label="Search the site">
      <div className="command-palette-field">
        <Search size={18} aria-hidden="true" />
        <input ref={input} type="text" role="combobox" aria-expanded="true" aria-controls="command-palette-results" aria-autocomplete="list"
          aria-activedescendant={results[active] ? `command-${results[active].id}` : undefined}
          placeholder="Search projects, articles, writeups..." autoComplete="off" spellCheck={false}
          value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} />
        <kbd>Esc</kbd>
      </div>
      <div className="command-palette-results" id="command-palette-results" role="listbox" aria-label="Results" ref={list}>
        {results.length === 0 && <p className="command-palette-empty">Nothing matches “{query}”. Try a tool, a technique or a box name.</p>}
        {results.map((entry, index) => {
          const Icon = icons[entry.group];
          const heading = entry.group !== previousGroup ? entry.group : null;
          previousGroup = entry.group;
          return <div key={entry.id} role="presentation">
            {heading && <p className="command-palette-group" role="presentation">{heading}</p>}
            <div id={`command-${entry.id}`} className="command-palette-item" role="option" aria-selected={index === active}
              onMouseMove={() => setActive(index)} onClick={() => run(entry)}>
              <Icon size={16} aria-hidden="true" />
              <span className="command-palette-title">{entry.title}</span>
              {entry.hint && <span className="command-palette-hint">{entry.hint}</span>}
              <CornerDownLeft className="command-palette-enter" size={14} aria-hidden="true" />
            </div>
          </div>;
        })}
      </div>
      <p className="command-palette-help" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>Enter</kbd> open <kbd>/</kbd> or <kbd>Ctrl K</kbd> anytime</p>
    </div>
  </div>;
}
