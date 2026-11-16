import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const site = 'https://gianlucabassani.com';
const name = 'Gianluca Bassani';
const tagline = 'Cybersecurity: penetration testing, OSINT tooling and AI-agent security research.';
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const line = value => String(value).replace(/\s+/g, ' ').trim();

const sources = [
  ['blog.json', 'Article', 'blog', e => `blog/${encodeURIComponent(e.id)}/`],
  ['writeups.json', 'Box writeup', 'writeups', e => `boxes/${encodeURIComponent(e.platform)}/${encodeURIComponent(e.id)}/`],
  ['ctf.json', 'CTF solve', 'ctf', e => `ctf/${encodeURIComponent(e.id)}/`],
];

async function loadContent(dataDir) {
  const articles = [];
  for (const [file, kind, folder, route] of sources) {
    for (const entry of JSON.parse(await readFile(join(dataDir, file), 'utf8'))) {
      articles.push({...entry, kind, folder, url:`${site}/${route(entry)}`});
    }
  }
  articles.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const projects = JSON.parse(await readFile(join(dataDir, 'projects.json'), 'utf8'));
  return {articles, projects};
}

/** llms.txt (https://llmstxt.org): a curated, Markdown map of the site for AI assistants. */
function llmsTxt({articles, projects}) {
  const section = (title, items) => items.length ? `\n## ${title}\n\n${items.join('\n')}\n` : '';
  const link = (title, url, desc) => `- [${line(title)}](${url})${desc ? `: ${line(desc)}` : ''}`;
  return `# ${name}

> ${tagline} Portfolio with security projects, HackTheBox and TryHackMe box writeups, CTF solutions and articles.

All articles are also available as Markdown at the URLs listed under "Markdown sources", and in full in ${site}/llms-full.txt.
${section('Pages', [
    link('About', `${site}/about/`, 'Background, experience and focus areas'),
    link('Projects', `${site}/projects/`, 'Open-source security tools and research platforms'),
    link('Skills', `${site}/skills/`, 'Technical skills'),
    link('Certifications', `${site}/certifications/`, 'Certifications and training'),
  ])}${section('Projects', projects.map(p => link(p.title, `${site}/projects/${encodeURIComponent(p.id)}/`, `${p.summary} (${p.status})`)))}${section('Articles and writeups', articles.map(a => link(`${a.kind}: ${a.title}`, a.url, a.summary)))}${section('Markdown sources', articles.map(a => link(a.title, `${site}/${a.folder}/${encodeURIComponent(a.contentPath)}`)))}
## Optional

- [RSS feed](${site}/feed.xml): new articles and writeups
- [Sitemap](${site}/sitemap.xml)
`;
}

async function llmsFullTxt({articles}, publicDir) {
  const parts = [`# ${name}: all articles and writeups\n\n> ${tagline}\n\nSource: ${site}/llms.txt\n`];
  for (const a of articles) {
    const body = await readFile(join(publicDir, a.folder, a.contentPath), 'utf8');
    parts.push(`\n---\n\n# ${a.kind}: ${line(a.title)}\n\nURL: ${a.url}\nDate: ${a.date}\nSummary: ${line(a.summary)}\n\n${body.trim()}\n`);
  }
  return parts.join('');
}

function rss({articles}) {
  const items = articles.map(a => `    <item>
      <title>${xml(`${a.kind}: ${line(a.title)}`)}</title>
      <link>${a.url}</link>
      <guid isPermaLink="true">${a.url}</guid>
      <pubDate>${new Date(`${a.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${xml(line(a.summary))}</description>
${(a.tags || []).map(t => `      <category>${xml(t)}</category>`).join('\n')}
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(name)}</title>
    <link>${site}/</link>
    <description>${xml(tagline)}</description>
    <language>en</language>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

function manifest() {
  return JSON.stringify({
    name: `${name}: Cybersecurity Portfolio`,
    short_name: name,
    description: tagline,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0c0910',
    theme_color: '#0c0910',
    icons: [
      {src:'/favicon.svg', sizes:'any', type:'image/svg+xml'},
      {src:'/icons/icon-192.png', sizes:'192x192', type:'image/png'},
      {src:'/icons/icon-512.png', sizes:'512x512', type:'image/png'},
    ],
  }, null, 2) + '\n';
}

export async function generateSiteFiles({outputDir = 'dist', dataDir = 'src/data', publicDir = 'public'} = {}) {
  const content = await loadContent(dataDir);
  await writeFile(join(outputDir, 'llms.txt'), llmsTxt(content));
  await writeFile(join(outputDir, 'llms-full.txt'), await llmsFullTxt(content, publicDir));
  await writeFile(join(outputDir, 'feed.xml'), rss(content));
  await writeFile(join(outputDir, 'manifest.webmanifest'), manifest());
  const svg = await readFile(join(publicDir, 'favicon.svg'));
  await mkdir(join(outputDir, 'icons'), {recursive:true});
  for (const size of [180, 192, 512]) {
    const png = new Resvg(svg, {fitTo:{mode:'width', value:size}, background:'#0c0910'}).render().asPng();
    await writeFile(join(outputDir, 'icons', size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`), png);
  }
  return content.articles.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`Generated llms.txt, llms-full.txt, feed.xml and manifest for ${await generateSiteFiles()} articles.`);
}
