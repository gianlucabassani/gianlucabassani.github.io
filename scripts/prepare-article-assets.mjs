import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { imageSize } from 'image-size';

const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const imageData = async path => {
  const bytes = await readFile(path);
  return `data:image/${path.endsWith('.jpg') ? 'jpeg' : 'png'};base64,${bytes.toString('base64')}`;
};
const wrap = (title, limit) => {
  const lines = [''];
  for (const word of title.split(/\s+/)) {
    const last = lines.length - 1;
    if (lines[last] && lines[last].length + word.length + 1 > limit) lines.push(word);
    else lines[last] += `${lines[last] ? ' ' : ''}${word}`;
  }
  return lines;
};

async function preview(entry, kind) {
  const accent = kind === 'writeup' ? '#9fef00' : kind === 'blog' ? '#c092ff' : '#ffba70';
  const label = kind === 'writeup' ? `${entry.platform} / ${entry.os} / ${entry.difficulty}` : kind === 'blog' ? 'Blog' : `${entry.competition} / ${entry.category}`;
  let artwork = '';
  if (entry.icon) {
    artwork = `<rect x="854" y="183" width="270" height="270" rx="32" fill="#151c25"/><image href="${await imageData(join('public',entry.icon))}" x="877" y="206" width="224" height="224"/>`;
  } else if (entry.coverImage) {
    artwork = `<image href="${await imageData(join('public',entry.coverImage.replace(/\.webp$/,'.jpg')))}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/><rect width="850" height="630" fill="url(#shade)"/>`;
  } else {
    artwork = `<rect x="864" y="208" width="256" height="208" rx="20" fill="#17121e" stroke="${accent}" stroke-opacity="0.3"/><path d="M922 264l-26 24 26 24m80-48l26 24-26 24m-70 58h124" stroke="${accent}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  const lines = wrap(entry.title, 24);
  const title = lines.map((line,index) => `<text x="64" y="${236 + index * 70}" font-size="60" font-weight="700" fill="#f9f7ff">${escape(line)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><linearGradient id="shade"><stop stop-color="#0b0912"/><stop offset="0.8" stop-color="#0b0912" stop-opacity="0.92"/><stop offset="1" stop-color="#0b0912" stop-opacity="0"/></linearGradient></defs>
    <rect width="1200" height="630" fill="#0b0912"/>${artwork}
    <g font-family="Liberation Sans"><text x="64" y="98" font-size="22" fill="${accent}">${escape(label.toUpperCase())}</text>
    ${title}<text x="64" y="${Math.max(408, 254 + lines.length * 70)}" font-size="21" fill="#bbb3c7">${escape(entry.tags.slice(0,3).join(' / '))}</text>
    <text x="64" y="546" font-size="24" font-weight="700" fill="#f9f7ff">Gianluca Bassani</text>
    <text x="64" y="582" font-size="20" fill="#a39bb0">gianlucabassani.gitlab.io</text></g>
  </svg>`;
  const renderer = new Resvg(svg, {font:{loadSystemFonts:false, fontFiles:[resolve('scripts/assets/LiberationSans-Regular.ttf'),resolve('scripts/assets/LiberationSans-Bold.ttf')]}});
  const path = join('public',entry.previewImage);
  await mkdir(resolve(path,'..'),{recursive:true});
  await writeFile(path,renderer.render().asPng());
}

async function sizes(folder, result = {}) {
  for (const entry of await readdir(folder,{withFileTypes:true})) {
    const path = join(folder,entry.name);
    if (entry.isDirectory()) await sizes(path,result);
    else if (/\.(png|jpe?g|webp)$/i.test(path)) {
      const {width,height} = imageSize(await readFile(path));
      result[`/${path.replace(/^public\//,'')}`] = {width,height};
    }
  }
  return result;
}

for (const [file,kind] of [['writeups','writeup'],['blog','blog'],['ctf','ctf']]) {
  const entries = JSON.parse(await readFile(`src/data/${file}.json`,'utf8'));
  for (const entry of entries) if (entry.previewImage) await preview(entry,kind);
}
await writeFile('src/data/image-sizes.json',JSON.stringify(await sizes('public/assets'))+'\n');
console.log('Prepared article artwork and screenshot dimensions.');
