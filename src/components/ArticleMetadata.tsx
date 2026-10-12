import { useEffect } from 'react';

interface ArticleMetadataProps { title:string; summary:string; path:string; date:string; }

/** Keep browser metadata aligned when navigating between client-side routes. */
export default function ArticleMetadata({title, summary, path, date}: ArticleMetadataProps) {
  useEffect(() => {
    const site = 'https://gianlucabassani.gitlab.io';
    const fullTitle = `${title} | Gianluca Bassani`;
    const homeTitle = 'Portfolio - Gianluca Bassani';
    const homeDescription = 'Cybersecurity enthusiast, developer, and problem solver sharing knowledge through writeups, CTF solutions, and security projects. Explore HackTheBox writeups, penetration testing tutorials, and open-source security tools.';
    const homeSocialDescription = 'Cybersecurity enthusiast sharing knowledge through writeups, CTF solutions, and security projects. HackTheBox writeups, penetration testing tutorials, and security tools.';
    const defaults: Record<string, string> = {
      description: homeDescription,
      'og:title': homeTitle,
      'og:description': homeSocialDescription,
      'og:type': 'website',
      'og:url': `${site}/`,
      'og:image': `${site}/og-image.png`,
      'twitter:title': homeTitle,
      'twitter:description': 'Cybersecurity writeups, CTF solutions, and security projects by Gianluca Bassani',
      'twitter:card': 'summary_large_image',
      'twitter:image': `${site}/og-image.png`,
    };
    document.title = fullTitle;
    const restore: (() => void)[] = [];
    const update = (attribute:string, key:string, value:string) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const element = existing || document.createElement('meta');
      element.setAttribute(attribute, key);
      element.setAttribute('content', value);
      if (!existing) document.head.appendChild(element);
      // A direct article load starts with article metadata in the static HTML.
      // Restore the site defaults instead of leaving that article on the index.
      restore.push(() => {if (key in defaults) element.setAttribute('content', defaults[key]); else element.remove();});
    };
    const url = `${site}${path.replace(/\/$/, '')}/`;
    update('name', 'description', summary);
    for (const [key,value] of Object.entries({title:fullTitle, description:summary, type:'article', url, image:`${site}/og-image.png`})) update('property', `og:${key}`, value);
    for (const [key,value] of Object.entries({title:fullTitle, description:summary, card:'summary_large_image', image:`${site}/og-image.png`})) update('name', `twitter:${key}`, value);
    update('property', 'article:published_time', date);
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = url;
    return () => {
      document.title = homeTitle;
      restore.forEach(reset => reset());
      if (canonical) canonical.href = `${site}/`;
    };
  }, [title, summary, path, date]);
  return null;
}
