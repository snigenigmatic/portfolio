// Single source of truth for /writing: reads Markdown posts, validates frontmatter,
// renders HTML at build time, and describes images. Used by the Vite plugin (dev and
// client index) and by scripts/pages.mjs (static pages, feeds, sitemap).
import {readdir, readFile, stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {Marked} from 'marked';
import markedFootnote from 'marked-footnote';
import {createHighlighter} from 'shiki';
import sharp from 'sharp';

export const SITE = 'https://c-kaustubh.netlify.app';
export const TRACKS = ['technical', 'personal'];
export const VISIBILITY = ['public', 'unlisted', 'draft'];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 1600;
const LANGS = ['bash', 'shell', 'c', 'cpp', 'python', 'rust', 'go', 'javascript', 'typescript', 'jsx', 'tsx', 'json', 'yaml', 'toml', 'sql', 'html', 'css', 'markdown', 'diff'];
const ALIASES = {cuda: 'cpp', cu: 'cpp', sh: 'bash', zsh: 'bash', console: 'bash', py: 'python', js: 'javascript', ts: 'typescript', rs: 'rust', yml: 'yaml', 'c++': 'cpp', md: 'markdown'};

export const writingDir = () => path.resolve(process.env.WRITING_DIR || 'content/writing');

export const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
export const slugify = s => String(s).toLowerCase().normalize('NFKD').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
const toISODate = d => d instanceof Date ? d.toISOString().slice(0, 10) : d;

let highlighter;
const getHighlighter = async () => highlighter ??= await createHighlighter({themes: ['github-light'], langs: LANGS});

/** Images in <dir>/images: name → {file, width, height} after resizing to at most MAX_IMAGE_WIDTH. */
export async function loadImages(dir = writingDir()) {
  const images = new Map();
  const imgDir = path.join(dir, 'images');
  if (!existsSync(imgDir)) return images;
  for (const name of (await readdir(imgDir)).sort()) {
    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(name)) continue;
    const file = path.join(imgDir, name);
    const {size} = await stat(file);
    if (size > MAX_IMAGE_BYTES) throw new Error(`writing: image ${name} is ${(size / 1048576).toFixed(1)} MB; the limit is 2 MB. Resize it before committing.`);
    const meta = await sharp(file).metadata();
    const scale = Math.min(1, MAX_IMAGE_WIDTH / meta.width);
    images.set(name, {file, width: Math.round(meta.width * scale), height: Math.round(meta.height * scale), output: name.replace(/\.[^.]+$/, '.webp')});
  }
  return images;
}

/** Resized WebP bytes for one image. */
export const imageWebp = image => sharp(image.file).resize({width: image.width, withoutEnlargement: true}).webp({quality: 82}).toBuffer();

function createMarked(images, errors, file) {
  const marked = new Marked({gfm: true});
  marked.use(markedFootnote({description: 'Notes'}));
  const used = new Map();
  marked.use({
    renderer: {
      heading({tokens, depth}) {
        const inner = this.parser.parseInline(tokens);
        if (depth < 2 || depth > 3) return `<h${depth}>${inner}</h${depth}>\n`;
        let id = slugify(inner) || 'section';
        const n = used.get(id) || 0;
        used.set(id, n + 1);
        if (n) id += `-${n}`;
        return `<h${depth} id="${id}">${inner}<a class="heading-anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
      code({text, lang}) {
        let language = (lang || '').split(/\s/)[0].toLowerCase();
        language = ALIASES[language] || language;
        const known = LANGS.includes(language) ? language : 'text';
        return `<div class="code-block">${highlighter.codeToHtml(text, {lang: known, theme: 'github-light'})}</div>\n`;
      },
      paragraph({tokens}) {
        // A paragraph holding only an image renders as the image/figure itself (a <figure> can't sit in a <p>).
        if (tokens.length === 1 && tokens[0].type === 'image') return this.parser.parseInline(tokens) + '\n';
        return `<p>${this.parser.parseInline(tokens)}</p>\n`;
      },
      image({href, title, text}) {
        let src = href, size = '';
        if (href.startsWith('images/')) {
          const image = images.get(href.slice(7));
          if (!image) { errors.push(`${file}: image ${href} not found in images/`); return ''; }
          src = `/writing/images/${image.output}`;
          size = ` width="${image.width}" height="${image.height}"`;
        }
        const img = `<img src="${escapeHTML(src)}" alt="${escapeHTML(text)}"${size} loading="lazy" decoding="async">`;
        return title ? `<figure>${img}<figcaption>${escapeHTML(title)}</figcaption></figure>` : img;
      },
      link({href, title, tokens}) {
        const inner = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE);
        return `<a href="${escapeHTML(href)}"${title ? ` title="${escapeHTML(title)}"` : ''}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`;
      }
    }
  });
  return marked;
}

function validate(data, file, errors) {
  const fail = msg => errors.push(`${file}: ${msg}`);
  if (!data.title || typeof data.title !== 'string') fail('`title` is required');
  const date = toISODate(data.date);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) fail('`date` must be YYYY-MM-DD');
  if (data.updated !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(toISODate(data.updated))) fail('`updated` must be YYYY-MM-DD');
  if (!TRACKS.includes(data.track)) fail(`\`track\` must be one of ${TRACKS.join(', ')}`);
  if (!VISIBILITY.includes(data.visibility)) fail(`\`visibility\` must be one of ${VISIBILITY.join(', ')}`);
  if (data.track === 'technical' && !data.summary) fail('`summary` is required for technical posts');
  if (data.tags !== undefined && !(Array.isArray(data.tags) && data.tags.every(t => typeof t === 'string'))) fail('`tags` must be a list of strings');
  for (const key of ['comments', 'replies']) if (data[key] !== undefined && typeof data[key] !== 'boolean') fail(`\`${key}\` must be true or false`);
  if (data.project !== undefined && data.track !== 'technical') fail('`project` is only for technical posts');
}

/**
 * Load every post. mode: 'build' drops drafts; 'dev' keeps them.
 * Returns posts sorted newest first. Throws one error listing every problem found.
 */
export async function loadPosts({mode = 'build', dir = writingDir()} = {}) {
  if (!existsSync(dir)) return [];
  await getHighlighter();
  const images = await loadImages(dir);
  const errors = [];
  const posts = [];
  const files = (await readdir(dir)).filter(f => f.endsWith('.md') && !f.startsWith('_')).sort();
  for (const file of files) {
    const {data, content} = matter(await readFile(path.join(dir, file), 'utf8'));
    const before = errors.length;
    validate(data, file, errors);
    if (errors.length > before) continue;
    const slug = slugify(file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}(-\d{2})?-/, ''));
    if (!slug) { errors.push(`${file}: could not derive a slug from the filename`); continue; }
    const html = createMarked(images, errors, file).parse(content);
    const words = content.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
    const technical = data.track === 'technical';
    posts.push({
      slug, file,
      title: data.title,
      date: toISODate(data.date),
      updated: data.updated ? toISODate(data.updated) : null,
      summary: data.summary || '',
      track: data.track,
      visibility: data.visibility,
      tags: data.tags || [],
      project: data.project || null,
      comments: data.comments ?? technical,
      replies: data.replies ?? technical,
      readingTime: Math.max(1, Math.round(words / 220)),
      html
    });
  }
  const seen = new Map();
  for (const p of posts) {
    if (seen.has(p.slug)) errors.push(`${p.file}: slug "${p.slug}" is already used by ${seen.get(p.slug)}`);
    seen.set(p.slug, p.file);
  }
  if (errors.length) throw new Error(`writing: ${errors.length} problem(s) in ${path.relative(process.cwd(), dir) || dir}\n  - ${errors.join('\n  - ')}`);
  return posts.filter(p => mode === 'dev' || p.visibility !== 'draft').sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** Metadata safe to ship in the client bundle: public posts only (plus drafts in dev). */
export const listed = (posts, mode = 'build') => posts.filter(p => p.visibility === 'public' || (mode === 'dev' && p.visibility === 'draft'));
export const meta = ({html, file, ...rest}) => rest;
/** Body payload served at /writing/<slug>/post.json. */
export const payload = ({file, ...rest}) => rest;

/** Previous/next within the same track, among listed posts. */
export function neighbours(post, all) {
  const same = all.filter(p => p.track === post.track);
  const i = same.findIndex(p => p.slug === post.slug);
  if (i < 0) return {newer: null, older: null};
  const pick = p => p ? {slug: p.slug, title: p.title} : null;
  return {newer: pick(same[i - 1]), older: pick(same[i + 1])};
}

export function rss(posts, {title, description, path: feedPath}) {
  const items = posts.map(p => `<item><title>${escapeHTML(p.title)}</title><link>${SITE}/writing/${p.slug}/</link><guid isPermaLink="true">${SITE}/writing/${p.slug}/</guid><pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate><category>${p.track}</category>${p.summary ? `<description>${escapeHTML(p.summary)}</description>` : ''}<content:encoded><![CDATA[${p.html.replaceAll(']]>', ']]]]><![CDATA[>')}]]></content:encoded></item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>${escapeHTML(title)}</title><link>${SITE}/writing/</link><description>${escapeHTML(description)}</description><language>en</language><atom:link href="${SITE}${feedPath}" rel="self" type="application/rss+xml"/>${posts[0] ? `<lastBuildDate>${new Date(`${posts[0].date}T00:00:00Z`).toUTCString()}</lastBuildDate>` : ''}${items}</channel></rss>`;
}
