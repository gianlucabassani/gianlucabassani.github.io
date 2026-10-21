import { useId, useState } from 'react';
import { ArrowUpRight, Box, Monitor, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { writeups, type Writeup } from '@/data/writeups';
import PlatformLogo from '@/components/PlatformLogo';
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
  const machines = newestFirst(entries.filter(entry => entry.platform === 'hackthebox'));
  const filtered = machines.filter(entry => selected === 'all' || entry.difficulty === selected);
  const groups = (selected === 'all' ? difficulties : [selected]).map(difficulty => ({ difficulty, entries: machines.filter(entry => entry.difficulty === difficulty) }));
  if (compact) return <div className="htb-showcase">
    <div className="htb-showcase-header"><PlatformLogo platform="hackthebox" /><span>Latest machines<span className="htb-machine-total">{machines.length} writeups</span></span></div>
    <ul className="htb-machine-deck" aria-label="Latest HackTheBox machines">{machines.slice(0, 3).map((entry, index) => <li key={entry.id} style={difficultyStyle(entry.difficulty)} data-difficulty={entry.difficulty}>
      <Link className="htb-machine-unit" to={`/boxes/hackthebox/${entry.id}`}>
        <span className="htb-machine-cube">
          <svg viewBox="0 0 100 100" aria-hidden="true"><path className="htb-cube-back" d="M10 10H76V76H10Z" /><path className="htb-cube-links" d="m10 10 14 14m52-14 14 14M10 76l14 14m52-14 14 14" /><path className="htb-cube-front" d="M24 24H90V90H24Z" /><path className="htb-cube-trace" pathLength="100" d="M24 90V24H90V90Z" style={{ animationDelay: `${index * -2.3}s` }} /></svg>
          {entry.icon ? <img src={entry.icon} alt="" width="40" height="40" loading="lazy" /> : <Box size={32} aria-hidden="true" />}
        </span>
        <div className="htb-unit-info"><h3>{entry.title}</h3><span className="htb-unit-os">{entry.os}</span><Difficulty value={entry.difficulty} /><span className="htb-unit-date"><ArchiveDate date={entry.publishedAt ?? entry.date} /></span></div>
        <ArrowUpRight className="htb-unit-arrow" size={17} aria-hidden="true" />
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
