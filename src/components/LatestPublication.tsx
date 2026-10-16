import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Box, FileText, Flag, X } from 'lucide-react';
import { getBlogPosts } from '@/data/blog';
import { writeups } from '@/data/writeups';
import { ctfWriteups } from '@/data/ctf';
import { newestPublication, type Publication } from '@/lib/publications';

const publications: Publication[] = [
  ...getBlogPosts().map(post => ({...post, kind:'Article' as const, image:post.coverImage || post.previewImage, path:`/blog/${post.id}`})),
  ...writeups.map(post => ({...post, kind:'Writeup' as const, image:post.icon, path:`/boxes/${post.platform}/${post.id}`})),
  ...ctfWriteups.map(post => ({...post, kind:'CTF solve' as const, path:`/ctf/${post.id}`})),
];

export default function LatestPublication() {
  const {pathname} = useLocation();
  const [latest] = useState(() => newestPublication(publications));
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    if (!latest) return;
    try { setVisible(localStorage.getItem('latest-publication-dismissed') !== latest.key); }
    catch { setVisible(true); }
  }, [latest]);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setVisible(false), 160);
    return () => window.clearTimeout(timer);
  }, [closing]);
  // Let readers concentrate; show the notice on discovery pages only.
  if (!latest || !visible || !['/', '/blog', '/boxes', '/ctf'].includes(pathname.replace(/\/$/, '') || '/')) return null;
  const dismiss = () => {
    setClosing(true);
    try { localStorage.setItem('latest-publication-dismissed', latest.key); } catch { /* Dismissal still works without storage. */ }
  };
  const Icon = latest.kind === 'CTF solve' ? Flag : latest.kind === 'Writeup' ? Box : FileText;
  return <aside className="latest-publication" data-closing={closing || undefined} aria-label="Latest publication">
    <Link to={latest.path} onClick={dismiss} tabIndex={closing ? -1 : undefined}>
      <span className={`latest-publication-art ${latest.kind === 'Writeup' ? 'latest-publication-logo' : ''}`} aria-hidden="true">
        {latest.image && !imageFailed ? <img src={latest.image} alt="" width={52} height={52} onError={() => setImageFailed(true)} /> : <Icon size={24} />}
      </span>
      <span className="latest-publication-copy">
        <span className="latest-publication-label">Latest {latest.kind.toLowerCase()}</span>
        <span className="latest-publication-title">{latest.title} <ArrowUpRight size={14} aria-hidden="true" /></span>
      </span>
    </Link>
    <button type="button" onClick={dismiss} disabled={closing} aria-label="Dismiss latest publication"><X size={16} /></button>
  </aside>;
}
