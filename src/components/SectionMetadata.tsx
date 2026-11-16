import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const sections: Record<string, string> = {
  blog:'Blog', projects:'Projects', boxes:'Box Writeups', ctf:'CTF Solves',
  skills:'Technical Skills', certifications:'Certifications', about:'About Me', terminal:'CLI Console',
};

export default function SectionMetadata() {
  const {pathname} = useLocation();
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    // ArticleMetadata owns all article routes.
    const isArticle = ((segments[0] === 'blog' || segments[0] === 'ctf') && segments[1]) || (segments[0] === 'boxes' && segments[2]);
    if (!window.location.hash) window.scrollTo(0, 0);
    if (isArticle) return;
    const label = sections[segments[0]];
    document.title = label ? `${label} | Gianluca Bassani` : 'Portfolio - Gianluca Bassani';
    const url = `https://gianlucabassani.com${pathname.replace(/\/$/, '')}/`;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = url;
    const description = label ? `${label} by Gianluca Bassani: cybersecurity research, projects, and practical security lessons.` : 'Cybersecurity enthusiast, developer, and problem solver sharing knowledge through writeups, CTF solutions, and security projects.';
    for (const [selector, value] of [
      ['meta[name="description"]', description], ['meta[property="og:title"]', document.title],
      ['meta[property="og:description"]', description], ['meta[property="og:url"]', url],
      ['meta[name="twitter:title"]', document.title], ['meta[name="twitter:description"]', description],
    ]) document.querySelector(selector)?.setAttribute('content', value);
  }, [pathname]);
  return null;
}
