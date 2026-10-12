import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy, X } from 'lucide-react';
import type { Element, Root, RootContent } from 'hast';
import 'highlight.js/styles/github-dark.css';

function textOf(children: ReactNode): string {
  return Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    return isValidElement<{ children?: ReactNode }>(child) ? textOf(child.props.children) : '';
  }).join('');
}

function headingLinks() {
  return (tree: Root) => {
    const ids = new Set<string>();
    const nodeText = (node: RootContent): string => 'value' in node ? String(node.value) :
      'children' in node ? node.children.map(nodeText).join('') : '';
    const visit = (node: Root | RootContent) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) {
        const slug = nodeText(node).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
        let id = `section-${slug}`;
        let count = 1;
        while (ids.has(id)) id = `section-${slug}-${count++}`;
        ids.add(id);
        node.properties.id = id;
        const link: Element = {type:'element', tagName:'a', properties:{href:`#${id}`, className:['heading-link']}, children:node.children};
        node.children = [link];
      } else if ('children' in node) node.children.forEach(visit);
    };
    visit(tree);
  };
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const code = Children.toArray(children).find(child => isValidElement(child));
  const language = isValidElement<{ className?: string }>(code) ?
    /language-([\w-]+)/.exec(code.props.className || '')?.[1] : undefined;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textOf(children));
      setStatus('Copied');
    } catch {
      setStatus('Copy failed; select the code below');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), 3000);
  };
  return (
    <div className="reader-code">
      <div className="reader-code-toolbar">
        <span>{language || 'Code'}</span>
        <button type="button" onClick={copy} aria-label="Copy code">
          {status === 'Copied' ? <Check size={16} /> : <Copy size={16} />} Copy
        </button>
        <span role="status" className="sr-only">{status}</span>
      </div>
      {status && <div className="reader-copy-status" aria-hidden="true">{status}</div>}
      <pre tabIndex={0} aria-label={`${language || 'Code'} block, horizontally scrollable`}>{children}</pre>
    </div>
  );
}

interface ArticleContentProps {
  content: string;
  theme?: 'purple' | 'green' | 'blue' | 'yellow' | 'orange';
}

export default function ArticleContent({content, theme = 'purple'}: ArticleContentProps) {
  const article = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [headings, setHeadings] = useState<{id:string; title:string; level:number}[]>([]);
  const [image, setImage] = useState<{src:string; alt:string} | null>(null);
  useEffect(() => {
    setHeadings(Array.from(article.current?.querySelectorAll('h1, h2, h3') || []).map(heading => ({
      id:heading.id, title:heading.textContent || '', level:Number(heading.tagName[1]),
    })));
  }, [content]);
  useEffect(() => {
    let id: string;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    if (id.startsWith('section-')) document.getElementById(id)?.scrollIntoView();
  }, [content]);
  useEffect(() => {
    if (!image) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [image]);
  return (
    <>
      {headings.length > 1 && (
        <details className="reader-toc">
          <summary>On this page <span>{headings.length} sections</span></summary>
          <nav aria-label="Article sections">
            {headings.map(heading => <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? 'reader-toc-subsection' : ''}>{heading.title}</a>)}
          </nav>
        </details>
      )}
      <div ref={article} className={`prose prose-invert prose-${theme} reader-prose`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, headingLinks]} components={{
          pre: ({children}) => <CodeBlock>{children}</CodeBlock>,
          img: ({src, alt}) => <button type="button" className="reader-image" aria-label={`Enlarge image: ${alt || 'article screenshot'}`} onClick={() => src && setImage({src, alt:alt || 'Article screenshot'})}>
            <img src={src} alt={alt || ''} loading="lazy" decoding="async" />
            <span>Tap to enlarge</span>
          </button>,
          table: ({children}) => <div className="reader-table" tabIndex={0} role="region" aria-label="Horizontally scrollable table"><table>{children}</table></div>,
        }}>{content}</ReactMarkdown>
      </div>
      <dialog ref={dialog} className="reader-image-dialog" aria-label="Enlarged article image" onClose={() => setImage(null)} onClick={event => {if (event.target === event.currentTarget) dialog.current?.close();}}>
        <button type="button" className="reader-image-close" aria-label="Close image" onClick={() => dialog.current?.close()}><X size={22} /></button>
        {image && <img src={image.src} alt={image.alt} />}
      </dialog>
    </>
  );
}
