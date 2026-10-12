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
    const record = {id:'example', title:'A <test> & "title"', summary:'Preview & description', date:'2026-10-13'};
    await writeFile(join(dataDir, 'blog.json'), JSON.stringify([record]));
    await writeFile(join(dataDir, 'writeups.json'), JSON.stringify([{...record, platform:'hackthebox'}]));
    await writeFile(join(dataDir, 'ctf.json'), JSON.stringify([record]));
    const count = await generateArticlePages({outputDir, dataDir});
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
      assert.match(html, /property="og:image" content="https:\/\/gianlucabassani.gitlab.io\/og-image.png"/);
    }
    const sitemap = await readFile(join(outputDir,'sitemap.xml'),'utf8');
    assert.match(sitemap, /blog\/example\//);
    assert.match(sitemap, /boxes\/hackthebox\/example\//);
  } finally {
    await rm(root, {recursive:true, force:true});
  }
});
