import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const site = 'https://gianlucabassani.gitlab.io';
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

/** Static HTML lets social crawlers see article previews without running React. */
export async function generateArticlePages({outputDir = 'dist', dataDir = 'src/data'} = {}) {
  const template = await readFile(join(outputDir, 'index.html'), 'utf8');
  const records = [];
  for (const [file, route] of [
    ['blog.json', entry => `blog/${encodeURIComponent(entry.id)}`],
    ['writeups.json', entry => `boxes/${encodeURIComponent(entry.platform)}/${encodeURIComponent(entry.id)}`],
    ['ctf.json', entry => `ctf/${encodeURIComponent(entry.id)}`],
  ]) {
    const entries = JSON.parse(await readFile(join(dataDir, file), 'utf8'));
    for (const entry of entries) records.push({...entry, route:route(entry)});
  }
  for (const entry of records) {
    const title = escape(`${entry.title} | Gianluca Bassani`);
    const description = escape(entry.summary);
    const url = `${site}/${entry.route}/`;
    const head = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="Gianluca Bassani" />
    <meta property="og:image" content="${site}/og-image.png" />
    <meta property="og:image:alt" content="Gianluca Bassani — cybersecurity and knowledge sharing" />
    <meta property="article:published_time" content="${escape(entry.date)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${site}/og-image.png" />
    <meta name="twitter:image:alt" content="Gianluca Bassani — cybersecurity and knowledge sharing" />
`;
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/gi, '')
      .replace(/<meta\b[^>]*(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+|article:[^"]+)"[^>]*>/gi, '')
      .replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '')
      .replace('</head>', `${head}</head>`);
    const destination = join(outputDir, entry.route);
    await mkdir(destination, {recursive:true});
    await writeFile(join(destination, 'index.html'), html);
  }
  const staticRoutes = ['', 'about/', 'projects/', 'blog/', 'boxes/', 'ctf/', 'skills/', 'certifications/', 'boxes/hackthebox/', 'boxes/tryhackme/', 'boxes/vulnhub/'];
  const projects = JSON.parse(await readFile(join(dataDir, 'projects.json'), 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '[]';
    throw error;
  }));
  const urls = [
    ...staticRoutes.map(route => `<url><loc>${site}/${route}</loc></url>`),
    ...projects.map(entry => `<url><loc>${site}/projects/${encodeURIComponent(entry.id)}/</loc></url>`),
    ...records.map(entry => `<url><loc>${site}/${entry.route}/</loc><lastmod>${escape(entry.date)}</lastmod></url>`),
  ];
  await writeFile(join(outputDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  return records.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`Generated ${await generateArticlePages()} article preview pages.`);
}
