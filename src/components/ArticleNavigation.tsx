import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleNavigationProps {
  content:string;
}

export default function ArticleNavigation({content}: ArticleNavigationProps) {
  const [status, setStatus] = useState('');
  const words = content.replace(/```[\s\S]*?```/g, ' ').replace(/[#*_`>|]/g, '').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const share = async () => {
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      url.search = '';
      await navigator.clipboard.writeText(url.href);
      setStatus('Link copied');
    } catch { setStatus('Copy failed. Copy the address from your browser.'); }
  };
  return <div className="article-navigation">
    <nav aria-label="Article navigation">
      <Button asChild variant="outline" className="article-back-link">
        <Link to="/"><ArrowLeft aria-hidden="true" />Back to Home</Link>
      </Button>
    </nav>
    <div className="article-reading-tools">
      {content && <span><Clock size={15} aria-hidden="true" />{minutes} min read</span>}
      <button type="button" onClick={share}><LinkIcon size={15} aria-hidden="true" />Copy link</button>
      <span role="status">{status}</span>
    </div>
  </div>;
}
