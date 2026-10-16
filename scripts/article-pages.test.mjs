import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateArticlePages } from './generate-article-pages.mjs';

test('article links contain crawler-readable metadata and retain the app entry point', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-preview-'));
  const outputDir = join(root, 'dist');
  const dataDir = join(root, 'data');
  try {
    await mkdir(outputDir);
    await mkdir(dataDir);
    await writeFile(join(outputDir, 'index.html'), '<html><head><title>Home</title><meta property="og:title" content="Home" /><link rel="canonical" href="https://example.com/" /></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>');
    const publicDir = join(root, 'public');
    for (const folder of ['blog', 'writeups', 'ctf']) {
      await mkdir(join(publicDir, folder), {recursive:true});
      await writeFile(join(publicDir, folder, 'example.md'), '# Read immediately\n\nArticle body without JavaScript.\n\n## Commands\n\n```bash\necho "<script>safe</script>"\n```');
    }
    const record = {id:'example', title:'A <test> & "title"', summary:'Preview & description', date:'2026-10-13', contentPath:'example.md', tags:[], difficulty:'easy', os:'linux', competition:'Test CTF', category:'web', points:100, previewImage:'/assets/previews/example.png'};
    await writeFile(join(dataDir, 'blog.json'), JSON.stringify([record]));
    await writeFile(join(dataDir, 'writeups.json'), JSON.stringify([{...record, platform:'hackthebox'}]));
    await writeFile(join(dataDir, 'ctf.json'), JSON.stringify([record]));
    const count = await generateArticlePages({outputDir, dataDir, publicDir});
    assert.equal(count, 3);
    for (const route of ['blog/example','boxes/hackthebox/example','ctf/example']) {
      const html = await readFile(join(outputDir, route, 'index.html'), 'utf8');
      assert.match(html, /A &lt;test&gt; &amp; &quot;title&quot;/);
      assert.match(html, /property="og:description" content="Preview &amp; description"/);
      assert.match(html, /property="og:type" content="article"/);
      assert.match(html, /name="twitter:card" content="summary_large_image"/);
      assert.ok(html.includes(`href="https://gianlucabassani.gitlab.io/${route}/"`));
      assert.match(html, /src="\/assets\/app.js"/);
      assert.equal((html.match(/property="og:title"/g) || []).length, 1);
      assert.match(html, /property="og:image" content="https:\/\/gianlucabassani.gitlab.io\/assets\/previews\/example.png"/);
      assert.match(html, /Article body without JavaScript/);
      assert.match(html, /echo/);
      assert.match(html, /aria-label="Breadcrumb"/);
      assert.match(html, /min read/);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.match(html, /id="article-data"/);
      assert.doesNotMatch(html, /<script>safe<\/script>/);
      assert.doesNotMatch(html, /Loading article/);
    }
    const sitemap = await readFile(join(outputDir,'sitemap.xml'),'utf8');
    assert.match(sitemap, /blog\/example\//);
    assert.match(sitemap, /boxes\/hackthebox\/example\//);
    for (const route of ['blog', 'projects', 'ctf', 'boxes/hackthebox']) {
      const html = await readFile(join(outputDir, route, 'index.html'), 'utf8');
      assert.ok(html.includes(`href="https://gianlucabassani.gitlab.io/${route}/"`));
      assert.match(html, /src="\/assets\/app.js"/);
    }
    const blog = await readFile(join(outputDir, 'blog/index.html'), 'utf8');
    assert.match(blog, /<title>Blog \| Gianluca Bassani<\/title>/);
    assert.match(blog, /<main/);
  } finally {
    await rm(root, {recursive:true, force:true});
  }
});
