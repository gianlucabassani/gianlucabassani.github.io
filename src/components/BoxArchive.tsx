import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Box, Monitor, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { writeups, type Writeup } from '@/data/writeups';
import PlatformLogo from '@/components/PlatformLogo';
import { Button } from '@/components/ui/button';
import { ArchiveDate, Difficulty } from './ArchivePrimitives';
import { difficulties, difficultyStyle, newestFirst } from '@/lib/writeupArchive';

function MachineRows({ entries, compact }: { entries: Writeup[]; compact: boolean }) {
  return <ul className="archive-machine-list">{entries.map(entry => <li key={entry.id} data-difficulty={entry.difficulty} style={difficultyStyle(entry.difficulty)}>
    <Link className="archive-machine" to={`/boxes/hackthebox/${entry.id}`}>
      <span className="archive-machine-icon">{entry.icon ? <img src={entry.icon} alt="" width="48" height="48" loading="lazy" /> : <Box size={25} strokeWidth={1.2} aria-hidden="true" />}</span>
      <div className="archive-machine-main"><h3>{entry.title}</h3><div className="archive-machine-techniques">{entry.tags.slice(0, compact ? 2 : 3).map(tag => <span key={tag}>{tag}</span>)}</div></div>
      <span className="archive-machine-os">{entry.os === 'linux' ? <Terminal size={13} aria-hidden="true" /> : <Monitor size={13} aria-hidden="true" />}{entry.os}</span>
      <Difficulty value={entry.difficulty} />
      <span className="archive-machine-date"><ArchiveDate date={entry.publishedAt ?? entry.date} /></span>
      <ArrowUpRight className="archive-row-arrow" size={19} aria-hidden="true" />
    </Link>
  </li>)}</ul>;
}
export default function BoxArchive({ entries = writeups, compact = false }: { entries?: Writeup[]; compact?: boolean }) {
  const [selected, setSelected] = useState<'all' | Writeup['difficulty']>('all');
  const listId = useId();
  const rackRef = useRef<HTMLUListElement>(null);
  const [reveal, setReveal] = useState('idle');
  useEffect(() => {
    const rack = rackRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!compact || !rack || preference.matches || !('IntersectionObserver' in window)) return;
    setReveal('waiting');
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setReveal('revealed');
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(rack);
    const changed = () => {
      if (preference.matches) {
        setReveal('revealed');
        observer.disconnect();
      }
    };
    preference.addEventListener('change', changed);
    return () => { observer.disconnect(); preference.removeEventListener('change', changed); };
  }, [compact]);
  const machines = newestFirst(entries.filter(entry => entry.platform === 'hackthebox'));
  const filtered = machines.filter(entry => selected === 'all' || entry.difficulty === selected);
  const groups = (selected === 'all' ? difficulties : [selected]).map(difficulty => ({ difficulty, entries: machines.filter(entry => entry.difficulty === difficulty) }));
  if (compact) return <div className="htb-showcase">
    <svg className="htb-panel-frame" viewBox="0 0 1200 600" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path className="htb-panel-outline" d="M33 1H400L421 15H1040L1058 1H1167L1199 33V510L1175 534V567L1167 599H65L1 535V33Z" />
      <path className="htb-panel-cyan" d="M1 130V33L33 1H188M1040 15H1158L1185 42V130" />
      <path className="htb-panel-pink" d="M1199 455V510L1175 534V567L1167 599H1010M1 455V535L65 599H210" />
      <path className="htb-panel-seam" d="M421 15H605M65 583H190M204 583H230" />
    </svg>
    <div className="htb-showcase-header"><PlatformLogo platform="hackthebox" /><span className="htb-rack-summary">Latest machines<span className="htb-machine-total">{machines.length} writeups</span></span><Button asChild size="lg" variant="secondary" className="htb-rack-archive"><Link to="/boxes/hackthebox">View archive<ArrowUpRight className="action-arrow" size={18} aria-hidden="true" /></Link></Button></div>
    <ul className="htb-rack" ref={rackRef} data-reveal={reveal} onFocusCapture={() => setReveal('revealed')} aria-label="Latest HackTheBox machines">{machines.slice(0, 3).map((entry, index) => <li className="htb-rack-station" key={entry.id} style={{ ...difficultyStyle(entry.difficulty), '--reveal-delay': `${index * 90}ms` } as CSSProperties}>
      <Link className="htb-rack-machine" to={`/boxes/hackthebox/${entry.id}`}>
        <span className="htb-rack-art" aria-hidden="true">
          <svg className="htb-rack-cube" viewBox="0 0 240 210" fill="none">
            <path className="htb-rack-hidden-edge" d="M40 46H162V168H40ZM40 46 78 16M40 168l38-30" />
            <path className="htb-rack-top" d="M40 46 78 16H200L162 46Z" />
            <path className="htb-rack-side" d="m162 46 38-30V138L162 168Z" />
            <path className="htb-rack-face" d="M40 46H162V168H40Z" />
            <path className="htb-rack-detail" d="M50 73V56H73M129 158H152V141M172 63l18-14M172 74l18-14M172 85l18-14M50 148H65M50 140H59" />
            <path className="htb-rack-port" d="M90 168V193H120V210M112 168V182H137V198" />
            <path className="htb-rack-signal" pathLength="100" d="M40 168V46H162L200 16V138L162 168H40" />
          </svg>
          {entry.icon ? <img className="htb-rack-avatar" src={entry.icon} alt="" width="56" height="56" loading="lazy" /> : <Box className="htb-rack-avatar" size={56} />}
          <svg className="htb-rack-pixels" viewBox="0 0 240 210" fill="none">
            {[0, 1, 2].map(band => <g key={band} className={`htb-pixel-band htb-pixel-band-${band}`}>
              {Array.from({ length: 10 }, (_, pixel) => <rect key={pixel} x={28 + ((pixel * 37 + band * 19) % 172)} y={20 + ((pixel * 29 + band * 47) % 152)} width={pixel % 3 === 0 ? 24 : 8} height={pixel % 3 === 0 ? 4 : 8} />)}
            </g>)}
          </svg>
          <span className="htb-rack-socket" />
        </span>
        <div className="htb-rack-copy">
          <div className="htb-rack-title"><h3>{entry.title}</h3><ArrowUpRight size={19} aria-hidden="true" /></div>
          <div className="htb-rack-meta"><span className="htb-rack-os">{entry.os === 'windows' ? <Monitor size={13} aria-hidden="true" /> : entry.os === 'linux' ? <Terminal size={13} aria-hidden="true" /> : <Box size={13} aria-hidden="true" />}{entry.os}</span><Difficulty value={entry.difficulty} /></div>
          <ul className="htb-rack-techniques" aria-label="Techniques">{entry.tags.slice(0, 2).map(tag => <li key={tag}>{tag}</li>)}</ul>
          <span className="htb-rack-date"><ArchiveDate date={entry.publishedAt ?? entry.date} /></span>
        </div>
      </Link>
    </li>)}</ul>
    {!machines.length && <div className="archive-empty"><p>No writeups published yet.</p></div>}
  </div>;
  return <div className={`writeup-archive box-archive htb-archive ${compact ? 'archive-preview' : ''}`}>
    <div className="htb-archive-header"><PlatformLogo platform="hackthebox" /><span>{compact ? 'Latest machines' : `${machines.length} machine writeups`}</span></div>
    {!compact && <div className="htb-difficulty-menu" role="group" aria-label="Filter HackTheBox writeups by difficulty">
      <button type="button" aria-pressed={selected === 'all'} aria-controls={listId} onClick={() => setSelected('all')}>All difficulties<span>{machines.length}</span></button>
      {difficulties.map(difficulty => <button key={difficulty} type="button" style={difficultyStyle(difficulty)} aria-pressed={selected === difficulty} aria-controls={listId} onClick={() => setSelected(difficulty)}><Difficulty value={difficulty} /><span>{machines.filter(entry => entry.difficulty === difficulty).length}</span></button>)}
    </div>}
    <div className="htb-difficulty-grid" data-filtered={selected !== 'all'} id={listId} key={selected}>
      {machines.length ? groups.map(group => <section className="htb-difficulty-group" key={group.difficulty} style={difficultyStyle(group.difficulty)} aria-label={`${group.difficulty} machines`}>
        <svg className="htb-group-frame" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true"><path d="M1 66V20L20 1H160M440 1H580L599 20V100M599 330V380L580 399H440M160 399H20L1 380V300" /></svg>
        <div className="htb-difficulty-heading"><span className="htb-difficulty-symbol" aria-hidden="true"><Box size={21} strokeWidth={1.4} /></span><h2>{group.difficulty}</h2><span>{group.entries.length} {group.entries.length === 1 ? 'machine' : 'machines'}</span></div>
        {group.entries.length ? <MachineRows entries={group.entries} compact={false} /> : <div className="archive-empty htb-group-empty"><p>No {group.difficulty} writeups yet.</p>{selected !== 'all' && <button type="button" onClick={() => setSelected('all')}>Show all difficulties</button>}</div>}
      </section>) : <div className="archive-empty"><p>No writeups published yet.</p></div>}
    </div>
    <p className="sr-only" role="status">{filtered.length} HackTheBox writeups{selected === 'all' ? '' : ` at ${selected} difficulty`}. Newest first within each difficulty.</p>
  </div>;
}
