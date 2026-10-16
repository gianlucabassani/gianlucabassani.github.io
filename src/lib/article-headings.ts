import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root, RootContent } from 'mdast';

export function headingId(title:string, ids:Set<string>) {
  const slug = title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-') || 'section';
  let id = `section-${slug}`;
  let suffix = 1;
  while (ids.has(id)) id = `section-${slug}-${suffix++}`;
  ids.add(id);
  return id;
}

export function articleHeadings(content:string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content);
  const ids = new Set<string>();
  const headings:{id:string; title:string; level:number}[] = [];
  const text = (node:RootContent):string => 'value' in node ? node.value : 'children' in node ? node.children.map(text).join('') : 'alt' in node ? node.alt || '' : '';
  const visit = (node:Root | RootContent) => {
    if (node.type === 'heading') {
      const title = text(node);
      const id = headingId(title,ids);
      if (node.depth <= 3) headings.push({id,title,level:node.depth});
    } else if ('children' in node) node.children.forEach(visit);
  };
  visit(tree);
  return headings;
}

/** The page header already names the article; keep only its body headings. */
export function withoutArticleTitle(content:string, title:string) {
  return title ? content.replace(/^\s*# [^\n]+\r?\n/, '') : content;
}
