import { createServer as createHttpServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const site = 'https://gianlucabassani.com';
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

/** Static HTML lets social crawlers see article previews without running React. */
export async function generateArticlePages({outputDir = 'dist', dataDir = 'src/data', publicDir = 'public'} = {}) {
  const template = await readFile(join(outputDir, 'index.html'), 'utf8');
  const css = (await readdir(join(outputDir,'assets')).catch(error => {if (error.code === 'ENOENT') return []; throw error;})).filter(file => /^ArticlePage-.*\.css$/.test(file)).map(file => `<link rel="stylesheet" href="/assets/${escape(file)}" />`).join('\n');
  const records = [];
  let renderBlogIndex;
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
  const prerender = await server.ssrLoadModule('/src/prerender.tsx');
  const { renderArticle } = prerender;
  renderBlogIndex = prerender.renderBlogIndex;
  for (const entry of records) {
    const title = escape(`${entry.title} | Gianluca Bassani`);
    const description = escape(entry.summary);
    const url = `${site}/${entry.route}/`;
    const image = escape(`${site}${entry.previewImage || '/assets/social/portfolio-v2.png'}`);
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
  const staticRoutes = ['', 'about/', 'projects/', 'blog/', 'boxes/', 'ctf/', 'skills/', 'certifications/', 'contact/', 'boxes/hackthebox/', 'boxes/tryhackme/', 'boxes/vulnhub/'];
  const projects = JSON.parse(await readFile(join(dataDir, 'projects.json'), 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '[]';
    throw error;
  }));
  // GitLab Pages serves these paths directly instead of falling through to
  // its authenticated missing-page handling. Each index has its own canonical.
  const labels = {about:'About Me', projects:'Projects', blog:'Blog', boxes:'Box Writeups', ctf:'CTF Solves', skills:'Technical Skills', certifications:'Certifications', contact:'Contact', terminal:'CLI Console'};
  const indexRoutes = [...staticRoutes.filter(Boolean), 'terminal/', ...projects.map(entry => `projects/${encodeURIComponent(entry.id)}/`)];
  for (const route of indexRoutes) {
    const label = labels[route.split('/')[0]];
    const title = `${label} | Gianluca Bassani`;
    const description = `${label} by Gianluca Bassani: cybersecurity research, projects, and practical security lessons.`;
    const url = `${site}/${route}`;
    let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
      .replace(/<link\b[^>]*rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
      .replace(/(<meta\b[^>]*(?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*/g, `$1${escape(description)}`)
      .replace(/(<meta\b[^>]*(?:name|property)="(?:og:title|twitter:title)" content=")[^"]*/g, `$1${escape(title)}`)
      .replace(/(<meta\b[^>]*property="og:url" content=")[^"]*/, `$1${url}`);
    if (route === 'blog/') html = html.replace('<div id="root"></div>', () => `<div id="root">${renderBlogIndex(records.filter(entry => entry.kind === 'blog'))}</div>`);
    await mkdir(join(outputDir, route), {recursive:true});
    await writeFile(join(outputDir, route, 'index.html'), html);
  }
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
