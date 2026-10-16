import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('newest publication compares all kinds, excludes future dates, and has a stable dismissal key', async () => {
  const server = await createServer({server:{middlewareMode:true}, logLevel:'silent'});
  try {
    const { newestPublication } = await server.ssrLoadModule('/src/lib/publications.ts');
    const entries = [
      {title:'Post', date:'2026-10-10', path:'/blog/post', kind:'Article'},
      {title:'Box', date:'2026-10-12', path:'/boxes/hackthebox/box', kind:'Writeup'},
      {title:'Future', date:'2027-01-01', path:'/ctf/future', kind:'CTF solve'},
      {title:'Invalid', date:'invalid', path:'/ctf/invalid', kind:'CTF solve'},
    ];
    const result = newestPublication(entries, new Date('2026-10-16T12:00:00Z'));
    assert.equal(result.title, 'Box');
    assert.equal(result.key, '/boxes/hackthebox/box:2026-10-12');
    assert.equal(newestPublication([], new Date()), undefined);
    assert.equal(newestPublication(entries.slice(2), new Date('2026-10-16')), undefined);
    assert.deepEqual(entries.map(entry => entry.title), ['Post','Box','Future','Invalid']);
  } finally { await server.close(); }
});
