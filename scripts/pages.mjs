import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
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
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://c-kaustubh.netlify.app/sitemap.xml\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','contact.html','resume.html'].map(p=>`<url><loc>https://c-kaustubh.netlify.app/${p}</loc></url>`).join('')}</urlset>`);
