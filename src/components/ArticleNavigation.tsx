import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Link as LinkIcon, ChevronRight } from 'lucide-react';

interface ArticleNavigationProps {
  title:string;
  content:string;
  parent:{label:string; path:string};
}

export default function ArticleNavigation({title, content, parent}: ArticleNavigationProps) {
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
    <nav aria-label="Breadcrumb"><ol>
      <li><Link to="/">Home</Link></li>
      <li><ChevronRight size={14} aria-hidden="true" /><Link to={parent.path}>{parent.label}</Link></li>
      <li><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{title}</span></li>
    </ol></nav>
    <div className="article-reading-tools">
      {content && <span><Clock size={15} aria-hidden="true" />{minutes} min read</span>}
      <button type="button" onClick={share}><LinkIcon size={15} aria-hidden="true" />Copy link</button>
      <span role="status">{status}</span>
    </div>
  </div>;
}
