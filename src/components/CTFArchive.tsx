import { Button } from '@/components/ui/button';
import { useId, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ctfWriteups, type CTFWriteup } from '@/data/ctf';
import { ArchiveDate, ArchiveGlyph, Difficulty } from './ArchivePrimitives';
import { newestFirst } from '@/lib/writeupArchive';
import DigitalFlag from './DigitalFlag';
import { DecodeText } from './ScrollDecrypt';

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
  const ChallengeHeading = compact ? 'h3' : 'h4';
  return <div className={`writeup-archive ctf-archive ${compact ? 'ctf-showcase' : 'ctf-archive-full'}`}>
    {compact && <>
      <svg className="ctf-showcase-frame" viewBox="0 0 1200 600" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path className="ctf-showcase-outline" d="M1 49L49 1H270L294 17H1127L1199 89V551L1151 599H930L906 583H33L1 551Z" />
        <path className="ctf-showcase-pink" d="M1 180V49L49 1H200M1010 17H1127L1199 89V160" />
        <path className="ctf-showcase-cyan" d="M1199 440V551L1151 599H1010M1 440V551L33 583H170" />
        <path className="ctf-showcase-detail" d="M294 17H440M930 583H780M456 17H476" />
      </svg>
      <div className="ctf-showcase-mark"><DigitalFlag /><span><DecodeText>{`${entries.length} challenge writeups`}</DecodeText></span></div>
    </>}
    <div className={compact ? 'ctf-showcase-toolbar' : 'ctf-archive-toolbar'}>
    <div className="archive-categories" role="group" aria-label="Filter CTF writeups by category">
      <button type="button" aria-pressed={selected === 'latest'} aria-controls={listId} onClick={() => setSelected('latest')}><ArchiveGlyph category="latest" /><span><DecodeText>Latest</DecodeText></span><span className="archive-filter-count"><DecodeText>{entries.length}</DecodeText></span></button>
      {!compact && <button type="button" aria-pressed={selected === 'all'} aria-controls={listId} onClick={() => setSelected('all')}><ArchiveGlyph category="all" /><span>All categories</span><span className="archive-filter-count"><DecodeText>{entries.length}</DecodeText></span></button>}
      {categories.map(category => <button type="button" key={category} style={{ '--category-color': categoryDetails[category]?.color ?? '264 85% 76%' } as CSSProperties} aria-pressed={selected === category} aria-controls={listId} onClick={() => setSelected(category)}><ArchiveGlyph category={category} /><span><DecodeText>{categoryDetails[category]?.label ?? category}</DecodeText></span><span className="archive-filter-count"><DecodeText>{entries.filter(entry => entry.category === category).length}</DecodeText></span></button>)}
    </div>
    {compact && <Button asChild size="lg" variant="secondary"><Link to="/ctf"><DecodeText>View archive</DecodeText><ArrowUpRight className="action-arrow" size={18} aria-hidden="true" /></Link></Button>}
    </div>
    <div className="archive-challenge-groups" id={listId} key={selected}>
      {groups.map(group => <section className="archive-challenge-group" data-latest={group.category === 'latest'} key={group.category} style={{ '--category-color': group.details.color } as CSSProperties} aria-label={`${group.details.label} challenges`}>
        {!compact && <div className="archive-category-heading"><ArchiveGlyph category={group.category} /><h3>{group.details.label}</h3><span>{group.entries.length} {group.entries.length === 1 ? 'solve' : 'solves'}</span><i aria-hidden="true" /></div>}
        <ul>{(compact ? group.entries.slice(0, 2) : group.entries).map(entry => <li key={entry.id}><Link className="archive-challenge" to={`/ctf/${entry.id}`}>
          <div className="archive-challenge-main"><span className="archive-challenge-kind"><ArchiveGlyph category={entry.category} /><DecodeText>{categoryDetails[entry.category]?.label ?? entry.category}</DecodeText></span><ChallengeHeading><DecodeText>{entry.title}</DecodeText></ChallengeHeading><span className="archive-challenge-competition"><DecodeText>{entry.competition}</DecodeText></span></div>
          <div className="archive-challenge-techniques">{entry.tags.slice(0, 3).map(tag => <span key={tag}><DecodeText>{tag}</DecodeText></span>)}</div>
          <div className="archive-challenge-meta"><Difficulty value={entry.difficulty} /><ArchiveDate date={entry.publishedAt ?? entry.date} /></div>
          <ArrowUpRight className="archive-row-arrow" size={19} aria-hidden="true" />
        </Link></li>)}</ul>
      </section>)}
      {!entries.length && <div className="archive-empty"><p><DecodeText>No CTF writeups published yet.</DecodeText></p></div>}
    </div>
    <p className="sr-only" role="status">{count} {count === 1 ? 'challenge' : 'challenges'}{selected === 'latest' ? ', newest first' : selected === 'all' ? ' across all categories' : ` in ${categoryDetails[selected]?.label ?? selected}`}.</p>
  </div>;
}
