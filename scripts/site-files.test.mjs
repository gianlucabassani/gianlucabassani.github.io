import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateSiteFiles } from './generate-site-files.mjs';

test('llms.txt, llms-full.txt, RSS feed, manifest and icons are generated from site data', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-site-files-'));
  const [outputDir, dataDir, publicDir] = ['dist', 'data', 'public'].map(dir => join(root, dir));
  try {
    for (const dir of [outputDir, dataDir, join(publicDir, 'blog'), join(publicDir, 'writeups'), join(publicDir, 'ctf')]) await mkdir(dir, {recursive:true});
    await writeFile(join(publicDir, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#f00"/></svg>');
    await writeFile(join(publicDir, 'blog', 'post.md'), '# Post body\n\nHello <world> & friends.');
    await writeFile(join(publicDir, 'writeups', 'box.md'), '# Box body');
    const base = {summary:'Summary & <details>', tags:['web'], contentPath:'post.md'};
    await writeFile(join(dataDir, 'blog.json'), JSON.stringify([{...base, id:'post', title:'Old post', date:'2026-01-01'}]));
    await writeFile(join(dataDir, 'writeups.json'), JSON.stringify([{...base, id:'box', title:'New box', date:'2026-02-01', platform:'hackthebox', contentPath:'box.md'}]));
    await writeFile(join(dataDir, 'ctf.json'), '[]');
    await writeFile(join(dataDir, 'projects.json'), JSON.stringify([{id:'tool', title:'Tool', summary:'A tool', status:'completed'}]));

    assert.equal(await generateSiteFiles({outputDir, dataDir, publicDir}), 2);

    const llms = await readFile(join(outputDir, 'llms.txt'), 'utf8');
    assert.match(llms, /^# Gianluca Bassani\n\n> /);
    assert.match(llms, /- \[Tool\]\(https:\/\/gianlucabassani\.com\/projects\/tool\/\): A tool \(completed\)/);
    assert.ok(llms.indexOf('New box') < llms.indexOf('Old post'), 'articles are newest first');
    assert.match(llms, /\(https:\/\/gianlucabassani\.com\/writeups\/box\.md\)/);

    const full = await readFile(join(outputDir, 'llms-full.txt'), 'utf8');
    assert.match(full, /URL: https:\/\/gianlucabassani\.com\/boxes\/hackthebox\/box\//);
    assert.match(full, /Hello <world> & friends\./);

    const feed = await readFile(join(outputDir, 'feed.xml'), 'utf8');
    assert.match(feed, /<guid isPermaLink="true">https:\/\/gianlucabassani\.com\/blog\/post\/<\/guid>/);
    assert.match(feed, /Summary &amp; &lt;details&gt;/);
    assert.doesNotMatch(feed, /<details>/);

    const manifest = JSON.parse(await readFile(join(outputDir, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.start_url, '/');
    for (const icon of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) assert.ok((await stat(join(outputDir, 'icons', icon))).size > 0);
  } finally {
    await rm(root, {recursive:true, force:true});
  }
});
