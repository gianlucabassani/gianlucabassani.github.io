import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';

test('portfolio navigation, project identities, and blog feature expose real destinations', async () => {
  const server = await createServer({server:{middlewareMode:true}, logLevel:'silent'});
  const render = (Component, props, path) => renderToStaticMarkup(createElement(StaticRouter, {location:path}, createElement(Component, props)));
  try {
    const {default: SiteNavigation} = await server.ssrLoadModule('/src/components/SiteNavigation.tsx');
    const navigation = render(SiteNavigation, {}, '/projects/nidavellir');
    assert.match(navigation, /aria-label="Main navigation"/);
    assert.match(navigation, /<a(?=[^>]*href="\/projects")(?=[^>]*aria-current="page")[^>]*>/);
    for (const path of ['/blog', '/boxes', '/ctf', '/skills']) assert.ok(navigation.includes(`href="${path}"`));
    const {default: ProjectsView} = await server.ssrLoadModule('/src/components/ProjectsView.tsx');
    const projects = render(ProjectsView, {onBack:()=>{}, onProjectSelect:()=>{}}, '/projects');
    assert.equal((projects.match(/aria-haspopup="listbox"/g) || []).length, 2);
    assert.match(projects, /href="\/projects\/nidavellir"/);
    assert.match(projects, /href="\/projects\/gosint"/);
    assert.match(projects, /src="\/assets\/projects\/nidavellir.webp"/);
    assert.ok(projects.indexOf('href="/projects/nidavellir"') < projects.indexOf('href="/projects/browsint"'));
    const {default: PlatformView} = await server.ssrLoadModule('/src/components/PlatformView.tsx');
    for (const platform of ['hackthebox', 'tryhackme', 'vulnhub']) {
      assert.ok(render(PlatformView, {platform, onBack:()=>{}, onWriteupSelect:()=>{}}, `/boxes/${platform}`).includes(`/assets/platforms/${platform}.svg`));
    }
    const {default: ProjectRail} = await server.ssrLoadModule('/src/components/ProjectRail.tsx');
    const {projects: projectData} = await server.ssrLoadModule('/src/data/projects.ts');
    const rail = render(ProjectRail, {projects:projectData}, '/');
    for (const project of projectData) assert.ok(rail.includes(`href="/projects/${project.id}"`));
    assert.equal((rail.match(/role="listitem"/g) || []).length, projectData.length);
    assert.match(rail, /aria-label="Next projects"/);
    assert.match(rail, /aria-label="Previous projects"/);
    assert.match(rail, /View all projects/);
    const {default: BlogListView} = await server.ssrLoadModule('/src/components/BlogListView.tsx');
    const posts = [
      {id:'first', title:'First story', date:'2026-10-19', summary:'A story', tags:['security'], coverImage:'/cover.webp'},
      {id:'second', title:'Second story', date:'2026-10-18', summary:'Another story', tags:[]},
    ];
    const blog = render(BlogListView, {posts, onBack:()=>{}}, '/blog');
    assert.equal((blog.match(/class="blog-feature book-leaf/g) || []).length, 2);
    assert.match(blog, /href="\/blog\/first"/);
    assert.match(blog, /href="\/blog\/second"/);
    assert.match(blog, /Read article/);
    assert.match(blog, /class="blog-incoming book-leaf/);
    assert.match(blog, /book-byte-field/);
    assert.doesNotMatch(blog, /href="[^"]*(?:incoming|coming-soon)/);
    assert.doesNotMatch(render(BlogListView, {posts:[], onBack:()=>{}}, '/blog'), /undefined/);
  } finally { await server.close(); }
});
