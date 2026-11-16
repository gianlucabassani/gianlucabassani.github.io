import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';

test('writeup archives preserve destinations, publication order, and actual categories', async () => {
  const server = await createServer({ server: { middlewareMode: true }, logLevel: 'silent' });
  const render = (Component, props) => renderToStaticMarkup(createElement(StaticRouter, { location: '/' }, createElement(Component, props)));
  try {
    const { default: BoxArchive } = await server.ssrLoadModule('/src/components/BoxArchive.tsx');
    const boxes = [
      { id: 'old', title: 'Older machine', platform: 'hackthebox', os: 'linux', difficulty: 'medium', tags: ['SSH'], date: '2025-01-01', summary: '', contentPath: 'old.md' },
      { id: 'new', title: 'Newer machine', platform: 'hackthebox', os: 'windows', difficulty: 'medium', tags: ['AD'], date: '2026-01-01', summary: '', contentPath: 'new.md' },
    ];
    const html = render(BoxArchive, { entries: boxes });
    assert.ok(html.indexOf('href="/boxes/hackthebox/new"') < html.indexOf('href="/boxes/hackthebox/old"'));
    assert.match(html, /data-difficulty="medium"/);
    assert.match(html, /Filter HackTheBox writeups by difficulty/);
    const newlyPublished = { ...boxes[0], id: 'upload', date: '2020-01-01', publishedAt: '2026-10-22' };
    const uploads = render(BoxArchive, { entries: [...boxes, newlyPublished] });
    assert.ok(uploads.indexOf('href="/boxes/hackthebox/upload"') < uploads.indexOf('href="/boxes/hackthebox/new"'), 'Publication date takes priority over the original writeup date');
    const legacy = render(BoxArchive, { entries: [{ ...boxes[0], platform: 'vulnhub' }] });
    assert.doesNotMatch(legacy, /href="\/boxes\/vulnhub/);
    assert.match(render(BoxArchive, { entries: [] }), /No writeups/);
    assert.deepEqual(boxes.map(entry => entry.id), ['old', 'new'], 'Rendering must not mutate source metadata');
    const previewBoxes = render(BoxArchive, { compact: true, entries: Array.from({ length: 8 }, (_, index) => ({ ...boxes[0], id: `preview-${index}` })) });
    assert.equal((previewBoxes.match(/href="\/boxes\/hackthebox\/preview-\d+"/g) ?? []).length, 3);
    assert.doesNotMatch(previewBoxes, /Show all 8 writeups/);
    const { matchesQuery } = await server.ssrLoadModule('/src/lib/writeupArchive.ts');
    const probe = { title: 'Autopilot', tags: ['Nextcloud', 'NTLM Relay'], os: 'windows', difficulty: 'insane' };
    assert.ok(matchesQuery(probe, ''), 'Empty search matches everything');
    assert.ok(matchesQuery(probe, '  autopilot '));
    assert.ok(matchesQuery(probe, 'ntlm insane'), 'Terms match across title, tags and difficulty');
    assert.ok(!matchesQuery(probe, 'ntlm easy'), 'Every term has to match');
    const searchable = render(BoxArchive, { entries: boxes });
    assert.match(searchable, /type="search"/);
    assert.match(searchable, /aria-label="Search all HackTheBox machines/);
    const insaneAt = searchable.indexOf('>insane<'), searchAt = searchable.indexOf('type="search"');
    assert.ok(insaneAt > -1 && searchAt > insaneAt, 'Search sits to the right of the last difficulty');
    const { default: CTFArchive } = await server.ssrLoadModule('/src/components/CTFArchive.tsx');
    const challenges = [
      { id: 'old-web', title: 'Old web', category: 'web', competition: 'Event', difficulty: 'easy', points: 100, tags: [], date: '2025-01-01', summary: '', contentPath: 'a.md' },
      { id: 'ai', title: 'AI challenge', category: 'ai', competition: 'Event', difficulty: 'easy', points: 100, tags: [], date: '2026-01-01', summary: '', contentPath: 'b.md' },
      { id: 'new-web', title: 'New web', category: 'web', competition: 'Event', difficulty: 'medium', points: 200, tags: [], date: '2026-01-02', summary: '', contentPath: 'c.md' },
      { id: 'web3', title: 'Web3 challenge', category: 'web3', competition: 'Event', difficulty: 'easy', points: 100, tags: [], date: '2026-01-01', summary: '', contentPath: 'd.md' },
    ];
    const ctf = render(CTFArchive, { entries: challenges });
    for (const entry of challenges) assert.ok(ctf.includes(`href="/ctf/${entry.id}"`));
    assert.ok(ctf.indexOf('href="/ctf/new-web"') < ctf.indexOf('href="/ctf/old-web"'));
    assert.match(ctf, /Web3/);
    assert.match(ctf, /AI/);
    assert.doesNotMatch(ctf, /undefined/);
    assert.match(render(CTFArchive, { entries: [] }), /No CTF writeups/);
    const previewCTF = render(CTFArchive, { compact: true, entries: challenges });
    assert.equal((previewCTF.match(/class="archive-challenge"/g) ?? []).length, 2);
    assert.match(previewCTF, /digital-flag/);
    assert.match(previewCTF, /href="\/ctf\/ai"/);
    assert.match(previewCTF, /href="\/ctf">View archive/);
    assert.doesNotMatch(previewCTF, /Show more/);
    assert.ok(previewCTF.indexOf('>Latest<') < previewCTF.indexOf('>Web<'));
    const { default: WriteupArchiveView } = await server.ssrLoadModule('/src/components/WriteupArchiveView.tsx');
    assert.match(render(WriteupArchiveView, { kind: 'boxes' }), /Filter HackTheBox writeups by difficulty/);
    assert.doesNotMatch(render(WriteupArchiveView, { kind: 'ctf' }), /Where I learn/);
  } finally { await server.close(); }
});
