import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageBackground from './PageBackground';
import BoxArchive from './BoxArchive';
import CTFArchive from './CTFArchive';
import DigitalFlag from './DigitalFlag';

export default function WriteupArchiveView({ kind }: { kind: 'boxes' | 'ctf' }) {
  return <div className="min-h-screen bg-background text-foreground cyber-grid">
    <PageBackground primary="hsl(270,85%,65%)" secondary="hsl(185,95%,48%)" />
    <main id="main-content" tabIndex={-1} className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 ${kind === 'ctf' ? 'archive-ctf-page' : ''}`}>
      <Button asChild variant="ghost" className="page-back archive-back"><Link to="/"><ArrowLeft size={16} aria-hidden="true" />Back to Home</Link></Button>
      <header className={kind === 'ctf' ? 'ctf-page-heading' : 'htb-page-heading'}><h1 className="font-display text-3xl sm:text-4xl font-semibold"><span className="site-section-title">{kind === 'boxes' ? 'HackTheBox Writeups' : 'CTF Solves'}</span></h1>{kind === 'ctf' && <DigitalFlag />}</header>
      {kind === 'boxes' ? <BoxArchive /> : <CTFArchive />}
    </main>
  </div>;
}
