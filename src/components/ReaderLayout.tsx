import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { articleHeadings, withoutArticleTitle } from '@/lib/article-headings';

export default function ReaderLayout({content, title, children, related}: {content:string; title:string; children:ReactNode; related?:ReactNode}) {
  const headings = useMemo(() => articleHeadings(withoutArticleTitle(content, title)), [content, title]);
  const [active, setActive] = useState('');
  useEffect(() => {
    const update = () => {
      let current = headings[0]?.id || '';
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= 112) current = heading.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, {passive:true});
    return () => window.removeEventListener('scroll', update);
  }, [headings]);
  const links = () => <nav aria-label="Article chapters">
    {headings.map(heading => <a key={heading.id} href={`#${heading.id}`}
      aria-current={active === heading.id ? 'location' : undefined}
      className={heading.level === 3 ? 'reader-toc-subsection' : ''}
      onClick={event => {
        setActive(heading.id);
        event.currentTarget.closest('details')?.removeAttribute('open');
      }}>{heading.title}</a>)}
  </nav>;
  return <main id="main-content" className={`reader-layout reader-container mx-auto relative z-10 ${headings.length || related ? '' : 'reader-layout-no-toc'}`} tabIndex={-1}>
    {headings.length > 0 && <aside className="reader-sidebar">
      <div className="reader-toc reader-toc-desktop"><p>On this page</p>{links()}</div>
      <details className="reader-toc reader-toc-mobile">
        <summary>On this page <span>{headings.length} chapters</span></summary>
        {links()}
      </details>
    </aside>}
    <div className="reader-body">{children}</div>
    {related && <aside className="reader-related" aria-label="Related links">{related}</aside>}
  </main>;
}
