import { createServer as createHttpServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const site = 'https://gianlucabassani.gitlab.io';
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

/** Static HTML lets social crawlers see article previews without running React. */
export async function generateArticlePages({outputDir = 'dist', dataDir = 'src/data', publicDir = 'public'} = {}) {
  const template = await readFile(join(outputDir, 'index.html'), 'utf8');
  const css = (await readdir(join(outputDir,'assets')).catch(error => {if (error.code === 'ENOENT') return []; throw error;})).filter(file => /^ArticlePage-.*\.css$/.test(file)).map(file => `<link rel="stylesheet" href="/assets/${escape(file)}" />`).join('\n');
  const records = [];
  for (const [file, kind, folder, route] of [
    ['blog.json', 'blog', 'blog', entry => `blog/${encodeURIComponent(entry.id)}`],
    ['writeups.json', 'writeup', 'writeups', entry => `boxes/${encodeURIComponent(entry.platform)}/${encodeURIComponent(entry.id)}`],
    ['ctf.json', 'ctf', 'ctf', entry => `ctf/${encodeURIComponent(entry.id)}`],
  ]) {
    const entries = JSON.parse(await readFile(join(dataDir, file), 'utf8'));
    for (const entry of entries) records.push({...entry, kind, folder, route:route(entry)});
  }
  const { createServer } = await import('vite');
  const server = await createServer({server:{middlewareMode:true, watch:null, hmr:{server:createHttpServer()}}, appType:'custom', logLevel:'error', optimizeDeps:{noDiscovery:true, include:[]}});
  try {
  const { renderArticle } = await server.ssrLoadModule('/src/prerender.tsx');
  for (const entry of records) {
    const title = escape(`${entry.title} | Gianluca Bassani`);
    const description = escape(entry.summary);
    const url = `${site}/${entry.route}/`;
    const image = escape(`${site}${entry.previewImage || '/og-image.png'}`);
    const content = await readFile(join(publicDir, entry.folder, entry.contentPath), 'utf8');
    const article = {kind:entry.kind, entry, route:entry.route, content};
    const body = renderArticle(article);
    const data = JSON.stringify(article).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    const head = `
    ${css}
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="Gianluca Bassani" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="article:published_time" content="${escape(entry.date)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${title}" />
`;
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/gi, '')
      .replace(/<meta\b[^>]*(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+|article:[^"]+)"[^>]*>/gi, '')
      .replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '')
      .replace('</head>', `${head}</head>`)
      .replace('<div id="root"></div>', () => `<div id="root">${body}</div><script id="article-data" type="application/json">${data}</script>`);
    const destination = join(outputDir, entry.route);
    await mkdir(destination, {recursive:true});
    await writeFile(join(destination, 'index.html'), html);
  }
  } finally { await server.close(); }
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
  console.log(`Pre-rendered ${await generateArticlePages()} articles and their social previews.`);
}
