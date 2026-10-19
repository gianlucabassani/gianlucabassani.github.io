import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText } from 'lucide-react';
import type { BlogPost } from '@/data/blog';
import IncomingPage from '@/components/IncomingPage';

const dateLabel = (date: string) => new Date(date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'});
const flowPaths = [
  ...[92, 178, 266, 354, 442, 530, 618, 706].flatMap((y, index) => {
    const drift = index % 2 ? 24 : -32;
    return [
      `M22 ${y}C-4 ${y + drift * 0.3}-22 ${y + drift}-50 ${y + drift * 1.5}`,
      `M1178 ${y}C1204 ${y + drift * 0.3}1222 ${y + drift}1250 ${y + drift * 1.5}`,
      `M28 ${y + 9}C2 ${y + 10}-18 ${y + drift * 0.6}-46 ${y + drift * 1.1}`,
      `M1172 ${y + 9}C1198 ${y + 10}1218 ${y + drift * 0.6}1246 ${y + drift * 1.1}`,
    ];
  }),
  'M90 30C56 16 30-6 16-28',
  'M1110 30C1144 16 1170-6 1184-28',
  'M92 748C50 762 0 790-38 814',
  'M1108 748C1150 762 1200 790 1238 814',
];

export default function BlogBook({posts, headingAs: Heading = 'h2'}: {posts: BlogPost[]; headingAs?: 'h2' | 'h3'}) {
  const [page, setPage] = useState(0);
  const total = posts.length + 1;
  const start = Math.min(page, Math.max(0, total - 2));
  const end = Math.min(start + 2, total);
  return <div className="blog-book" aria-label="Blog book">
    <div className={`blog-book-spread ${total === 1 ? 'blog-book-single' : ''}`}>
      <svg className="book-edge-flow" viewBox="0 0 1200 800" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <defs>{flowPaths.map((_, index) => <linearGradient key={index} id={`book-flow-fade-${index}`} x1={index % 2 ? '0%' : '100%'} x2={index % 2 ? '100%' : '0%'}>
          <stop stopColor={['#8ee4e9', '#b79fdf', '#ed94c9'][index % 3]} stopOpacity=".85" />
          <stop offset=".55" stopColor={['#8ee4e9', '#b79fdf', '#ed94c9'][index % 3]} stopOpacity=".5" />
          <stop offset="1" stopColor={['#8ee4e9', '#b79fdf', '#ed94c9'][index % 3]} stopOpacity="0" />
        </linearGradient>)}</defs>
        {flowPaths.map((path, index) => <g key={path} className={`book-flow-current book-flow-current-${index}`} stroke={`url(#book-flow-fade-${index})`} style={{'--flow-delay':`${index * -0.47}s`} as CSSProperties}>
          <path className="book-flow-trail" d={path} pathLength={100} />
          <path className="book-flow-particles" d={path} pathLength={100} />
        </g>)}
      </svg>
      <svg className="book-shape" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="book-left-paper"><stop stopColor="#14101e" /><stop offset=".8" stopColor="#14101e" /><stop offset="1" stopColor="#0d0a14" /></linearGradient>
          <linearGradient id="book-right-paper"><stop stopColor="#0d0a14" /><stop offset=".18" stopColor="#13101c" /><stop offset="1" stopColor="#13101c" /></linearGradient>
          <linearGradient id="book-fold"><stop stopColor="#09060f" stopOpacity="0" /><stop offset=".5" stopColor="#09060f" /><stop offset="1" stopColor="#09060f" stopOpacity="0" /></linearGradient>
        </defs>
        <path d="M22 30H540L600 52V770L540 748H22Z" fill="url(#book-left-paper)" stroke="#a78ac3" strokeOpacity=".45" />
        <path d="M600 52L660 30H1178V748H660L600 770Z" fill="url(#book-right-paper)" stroke="#a78ac3" strokeOpacity=".45" />
        <path d="M584 46L600 52L616 46V764L600 770L584 764Z" fill="url(#book-fold)" />
        <path d="M600 59V763" stroke="#b594dc" strokeOpacity=".25" />
        <path d="M25 30H108M1092 30H1175M25 708V748H108M1092 748H1175V708" stroke="#8ee4e9" strokeOpacity=".6" fill="none" />
      </svg>
      {posts.map((post, index) => <article className="blog-feature book-leaf book-published" key={post.id} hidden={index < start || index >= end}>
        <Link to={`/blog/${post.id}`} className="blog-feature-art" aria-label={`Read ${post.title}`}>
          <span className="book-image-window">{post.coverImage ? <img src={post.coverImage} alt="" width={1200} height={630} loading="lazy" /> : <FileText size={80} strokeWidth={1} aria-hidden="true" />}</span>
          <svg className="book-image-corners" viewBox="0 0 500 260" preserveAspectRatio="none" fill="none" aria-hidden="true">
            <path d="M1 108V1H165" />
            <path d="M499 70V245L485 259H340M302 1H412" />
          </svg>
          <span className="blog-feature-art-action" aria-hidden="true"><ArrowUpRight size={22} /></span>
        </Link>
        <div className="blog-feature-copy">
          <time dateTime={post.date}>{dateLabel(post.date)}</time>
          <Heading className="blog-book-post-title"><Link to={`/blog/${post.id}`}>{post.title}</Link></Heading>
          <p>{post.summary}</p>
          <ul className="blog-topics" aria-label="Topics">{post.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
          <Link className="blog-read-link" to={`/blog/${post.id}`}>Read article<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <span className="book-page-number" aria-label={`Page ${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
      </article>)}
      <aside className="blog-incoming book-leaf book-unfinished" aria-labelledby="incoming-writing-title" hidden={posts.length < start || posts.length >= end}>
        <div className="book-incoming-copy">
          <Heading id="incoming-writing-title">Incoming</Heading>
          <p>This page is still being written.</p>
        </div>
        <IncomingPage />
        <span className="book-page-number" aria-label={`Page ${total}, in progress`}>{String(total).padStart(2, '0')}</span>
      </aside>
    </div>
    <div className="blog-book-navigation">
      <button type="button" aria-label="Previous blog page" disabled={start === 0} onClick={() => setPage(start - 1)}><ArrowLeft size={18} aria-hidden="true" /></button>
      <span aria-live="polite" aria-atomic="true">{total === 1 ? 'Page 1' : `Pages ${start + 1}–${end}`}<span className="book-page-total"> / {total}</span></span>
      <button type="button" aria-label="Next blog page" disabled={end >= total} onClick={() => setPage(start + 1)}><ArrowRight size={18} aria-hidden="true" /></button>
    </div>
  </div>;
}
