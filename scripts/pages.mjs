import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { SITE, loadPosts, loadImages, imageWebp, listed, payload, neighbours, rss, escapeHTML } from './writing.mjs';

const html = await readFile('dist/index.html', 'utf8');
for (const page of ['contact','resume']) {
  await writeFile(`dist/${page}.html`, html.replace('<title>C Kaustubh</title>', `<title>${page[0].toUpperCase()+page.slice(1)} — Kaustubh</title>`));
}
// Keep former page URLs useful, without duplicating homepage content.
for(const [page,target] of [['about','/'],['projects','/#work']]) {
  await writeFile(`dist/${page}.html`, `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><title>Kaustubh</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"></head><body><a href="${target}">Continue to homepage</a></body></html>`);
}
await mkdir('dist/static', {recursive:true});
for(const f of ['resume.pdf','Kaustubh.jpg','favicon.ico','favicon.png','favicon.svg']) await copyFile(`static/${f}`,`dist/static/${f}`);

// ---- Writing -------------------------------------------------------------
const {renderIndex, renderPost} = await import(pathToFileURL(path.resolve('dist-ssr/prerender.js')).href);
const all = await loadPosts({mode: 'build'});            // public + unlisted (drafts dropped)
const pub = listed(all);                                 // public only, newest first
const ogImage = `${SITE}/static/Kaustubh.jpg`;

/** Fill the shared index.html with a page's own head tags and prerendered body. */
function page({title, description, url, type = 'website', noindex = false, body, data, published}) {
  const d = escapeHTML(description), t = escapeHTML(title);
  const head = [
    `<link rel="canonical" href="${url}"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<meta property="og:image" content="${ogImage}"/>`,
    `<meta property="og:site_name" content="Kaustubh"/>`,
    `<meta name="twitter:card" content="summary"/>`,
    `<meta name="twitter:title" content="${t}"/>`,
    `<meta name="twitter:description" content="${d}"/>`,
    published ? `<meta property="article:published_time" content="${published}"/>` : '',
    noindex ? `<meta name="robots" content="noindex"/>` : '',
    // Escape "<" so post HTML can never close this script tag early.
    data ? `<script type="application/json" id="writing-post">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>` : ''
  ].join('');
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*"\/?>/, `<meta name="description" content="${d}"/>`)
    .replace(/<meta property="og:title" content="[^"]*"\/?>/, `<meta property="og:title" content="${t}"/>`)
    .replace(/<meta property="og:description" content="[^"]*"\/?>/, `<meta property="og:description" content="${d}"/>`)
    .replace(/<meta property="og:type" content="[^"]*"\/?>/, `<meta property="og:type" content="${type}"/>`)
    .replace('</head>', `${head}</head>`)
    .replace(/<noscript>[\s\S]*?<\/noscript>/, '')
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

await mkdir('dist/writing', {recursive: true});
const indexMeta = pub.map(({html: _, file, ...m}) => m);
await writeFile('dist/writing/index.html', page({
  title: 'Writing — Kaustubh',
  description: 'Writing by Kaustubh: technical posts and personal ones.',
  url: `${SITE}/writing/`,
  noindex: pub.length === 0,
  body: renderIndex(indexMeta)
}));

for (const post of all) {
  const nav = post.visibility === 'public' ? neighbours(post, pub) : {newer: null, older: null};
  const data = {...payload(post), ...nav};
  const dir = `dist/writing/${post.slug}`;
  await mkdir(dir, {recursive: true});
  await writeFile(`${dir}/post.json`, JSON.stringify(data));
  await writeFile(`${dir}/index.html`, page({
    title: `${post.title} — Kaustubh`,
    description: post.summary || `${post.track === 'personal' ? 'A personal post' : 'A post'} by Kaustubh, ${post.date}.`,
    url: `${SITE}/writing/${post.slug}/`,
    type: 'article',
    noindex: post.visibility === 'unlisted',
    published: post.date,
    body: renderPost(post, {...nav, showWriting: pub.length > 0}),
    data
  }));
}

const images = await loadImages();
if (images.size) {
  await mkdir('dist/writing/images', {recursive: true});
  for (const image of images.values()) await writeFile(`dist/writing/images/${image.output}`, await imageWebp(image));
}

await writeFile('dist/writing/feed.xml', rss(pub, {title: 'Kaustubh — Writing', description: 'Technical and personal writing by Kaustubh.', path: '/writing/feed.xml'}));
await writeFile('dist/writing/technical.xml', rss(pub.filter(p => p.track === 'technical'), {title: 'Kaustubh — Technical writing', description: 'Technical writing by Kaustubh.', path: '/writing/technical.xml'}));

await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://c-kaustubh.netlify.app/sitemap.xml\n');
const urls = [['', null], ['contact.html', null], ['resume.html', null], ...(pub.length ? [['writing/', pub.map(p => p.updated || p.date).sort().pop()]] : []), ...pub.map(p => [`writing/${p.slug}/`, p.updated || p.date])];
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(([p, mod])=>`<url><loc>${SITE}/${p}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`).join('')}</urlset>`);

await rm('dist-ssr', {recursive: true, force: true});
console.log(`writing: ${pub.length} public, ${all.length - pub.length} unlisted post(s) built.`);
