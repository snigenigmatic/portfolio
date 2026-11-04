import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
const html = await readFile('dist/index.html', 'utf8');
for (const page of ['about','projects','contact','resume']) {
  await writeFile(`dist/${page}.html`, html.replace('<title>C Kaustubh — Systems & Intelligence</title>', `<title>${page[0].toUpperCase()+page.slice(1)} — C Kaustubh</title>`));
}
// Keep existing resume and portrait URLs valid after the rebuild.
await mkdir('dist/static', {recursive:true});
for(const f of ['resume.pdf','Kaustubh.jpg','favicon.ico','favicon.png']) await copyFile(`static/${f}`,`dist/static/${f}`);
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://c-kaustubh.netlify.app/sitemap.xml\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','about.html','projects.html','contact.html','resume.html'].map(p=>`<url><loc>https://c-kaustubh.netlify.app/${p}</loc></url>`).join('')}</urlset>`);
