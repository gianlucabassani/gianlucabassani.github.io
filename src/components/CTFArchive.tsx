import { Button } from '@/components/ui/button';
import { useId, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ctfWriteups, type CTFWriteup } from '@/data/ctf';
import { ArchiveDate, ArchiveGlyph, Difficulty } from './ArchivePrimitives';
import { newestFirst } from '@/lib/writeupArchive';
import DigitalFlag from './DigitalFlag';

const categoryDetails: Record<string, { label: string; color: string }> = {
  web: { label: 'Web', color: '183 80% 72%' },
  pwn: { label: 'Pwn', color: '326 85% 73%' },
  reversing: { label: 'Reversing', color: '264 85% 76%' },
  crypto: { label: 'Crypto', color: '40 90% 72%' },
  forensics: { label: 'Forensics', color: '210 85% 76%' },
  ai: { label: 'AI / ML', color: '285 85% 77%' },
  web3: { label: 'Web3', color: '158 68% 68%' },
  osint: { label: 'OSINT', color: '185 75% 68%' },
  misc: { label: 'Misc', color: '24 90% 74%' },
};
export default function CTFArchive({ entries = ctfWriteups, compact = false }: { entries?: CTFWriteup[]; compact?: boolean }) {
  const [selected, setSelected] = useState('latest');
  const listId = useId();
  const present = [...new Set(entries.map(entry => entry.category))];
  const categories = [...Object.keys(categoryDetails).filter(category => present.includes(category as CTFWriteup['category'])), ...present.filter(category => !categoryDetails[category])];
  const latest = newestFirst(entries);
  const groups = selected === 'latest'
    ? [{ category: 'latest', details: { label: 'Latest', color: '183 80% 72%' }, entries: latest }]
    : (selected === 'all' ? categories : [selected]).map(category => ({ category, details: categoryDetails[category] ?? { label: category, color: '264 85% 76%' }, entries: newestFirst(entries.filter(entry => entry.category === category)) }));
  const count = selected === 'all' || selected === 'latest' ? entries.length : entries.filter(entry => entry.category === selected).length;
  return <div className={`writeup-archive ctf-archive ${compact ? 'archive-preview' : 'ctf-archive-full'}`}>
    {compact && <div className="ctf-archive-mark"><DigitalFlag /></div>}
    <div className="archive-categories" role="group" aria-label="Filter CTF writeups by category">
      <button type="button" aria-pressed={selected === 'latest'} aria-controls={listId} onClick={() => setSelected('latest')}><ArchiveGlyph category="latest" /><span>Latest</span><span className="archive-filter-count">{entries.length}</span></button>
      {!compact && <button type="button" aria-pressed={selected === 'all'} aria-controls={listId} onClick={() => setSelected('all')}><ArchiveGlyph category="all" /><span>All categories</span><span className="archive-filter-count">{entries.length}</span></button>}
      {categories.map(category => <button type="button" key={category} style={{ '--category-color': categoryDetails[category]?.color ?? '264 85% 76%' } as CSSProperties} aria-pressed={selected === category} aria-controls={listId} onClick={() => setSelected(category)}><ArchiveGlyph category={category} /><span>{categoryDetails[category]?.label ?? category}</span><span className="archive-filter-count">{entries.filter(entry => entry.category === category).length}</span></button>)}
    </div>
    <div className="archive-challenge-groups" id={listId} key={selected}>
      {groups.map(group => <section className="archive-challenge-group" data-latest={group.category === 'latest'} key={group.category} style={{ '--category-color': group.details.color } as CSSProperties} aria-label={`${group.details.label} challenges`}>
        {!compact && <div className="archive-category-heading"><ArchiveGlyph category={group.category} /><h3>{group.details.label}</h3><span>{group.entries.length} {group.entries.length === 1 ? 'solve' : 'solves'}</span><i aria-hidden="true" /></div>}
        <ul>{(compact ? group.entries.slice(0, 2) : group.entries).map(entry => <li key={entry.id}><Link className="archive-challenge" to={`/ctf/${entry.id}`}>
          <div className="archive-challenge-main">{!compact && <span className="archive-challenge-kind"><ArchiveGlyph category={entry.category} />{categoryDetails[entry.category]?.label ?? entry.category}</span>}<h4>{entry.title}</h4><span className="archive-challenge-competition">{entry.competition}</span></div>
          <div className="archive-challenge-techniques">{entry.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div>
          <div className="archive-challenge-meta"><Difficulty value={entry.difficulty} /><ArchiveDate date={entry.publishedAt ?? entry.date} /></div>
          <ArrowUpRight className="archive-row-arrow" size={19} aria-hidden="true" />
        </Link></li>)}</ul>
      </section>)}
      {!entries.length && <div className="archive-empty"><p>No CTF writeups published yet.</p></div>}
    </div>
    {compact && <Button asChild variant="ghost" className="ctf-view-more"><Link to="/ctf">View more<ArrowUpRight className="action-arrow" size={15} aria-hidden="true" /></Link></Button>}
    <p className="sr-only" role="status">{count} {count === 1 ? 'challenge' : 'challenges'}{selected === 'latest' ? ', newest first' : selected === 'all' ? ' across all categories' : ` in ${categoryDetails[selected]?.label ?? selected}`}.</p>
  </div>;
}
