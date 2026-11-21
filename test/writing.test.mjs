import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {loadPosts, listed, meta, neighbours, rss, slugify} from '../scripts/writing.mjs';

const dir = path.resolve('test/fixtures/writing');
const tempDir = async files => {
  const d = await mkdtemp(path.join(tmpdir(), 'writing-'));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(d, name)), {recursive: true});
    await writeFile(path.join(d, name), body);
  }
  return d;
};
const post = (fm, body = 'Body.') => `---\n${fm}\n---\n${body}\n`;

test('build mode drops drafts, keeps public and unlisted, newest first', async () => {
  const posts = await loadPosts({dir});
  assert.deepEqual(posts.map(p => p.slug), ['sql-engine-wal', 'just-for-friends', 'a-quiet-week', 'older-technical']);
  assert.ok(!posts.some(p => p.visibility === 'draft'));
});

test('dev mode includes drafts', async () => {
  const posts = await loadPosts({dir, mode: 'dev'});
  assert.ok(posts.some(p => p.slug === 'not-yet' && p.visibility === 'draft'));
});

test('client index (listed) is public only and has no bodies', async () => {
  const index = listed(await loadPosts({dir})).map(meta);
  assert.deepEqual(index.map(p => p.slug), ['sql-engine-wal', 'a-quiet-week', 'older-technical']);
  assert.ok(index.every(p => !('html' in p) && !('file' in p)));
});

test('track defaults: technical gets comments and replies, personal gets neither', async () => {
  const posts = await loadPosts({dir});
  const tech = posts.find(p => p.slug === 'sql-engine-wal');
  const personal = posts.find(p => p.slug === 'a-quiet-week');
  assert.equal(tech.comments, true); assert.equal(tech.replies, true);
  assert.equal(personal.comments, false); assert.equal(personal.replies, false);
  assert.equal(tech.updated, '2026-12-06');
  assert.equal(tech.project, 'qwen-cuda');
});

test('rendering: unique heading anchors, highlighted code, figures, footnotes, links', async () => {
  const {html} = (await loadPosts({dir})).find(p => p.slug === 'sql-engine-wal');
  assert.match(html, /<h2 id="why-a-log">/);
  assert.match(html, /<h2 id="why-a-log-1">/);
  assert.match(html, /<div class="code-block"><pre class="shiki/);
  assert.match(html, /<figure><img src="\/writing\/images\/diagram.webp" alt="A diagram" width="1600" height="800"/);
  assert.doesNotMatch(html, /<p><figure>/);
  assert.match(html, /data-footnote-ref/);
  assert.match(html, /href="https:\/\/example.com" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /<a href="\/contact.html">/);
});

test('neighbours stay within the same track', async () => {
  const pub = listed(await loadPosts({dir}));
  const tech = pub.find(p => p.slug === 'sql-engine-wal');
  assert.deepEqual(neighbours(tech, pub), {newer: null, older: {slug: 'older-technical', title: 'An older technical note'}});
  assert.deepEqual(neighbours(pub.find(p => p.slug === 'a-quiet-week'), pub), {newer: null, older: null});
});

test('validation reports every problem at once', async () => {
  const d = await tempDir({
    'a.md': post('title: A\ndate: 2026-01-01\ntrack: technical\nvisibility: public'),
    'b.md': post('title: B\ndate: nope\ntrack: diary\nvisibility: secret'),
    'c.md': post('title: C\ndate: 2026-01-01\ntrack: personal\nvisibility: public\nproject: x\ncomments: "yes"')
  });
  await assert.rejects(loadPosts({dir: d}), err => {
    for (const m of ['a.md: `summary` is required', 'b.md: `date`', 'b.md: `track`', 'b.md: `visibility`', 'c.md: `comments`', 'c.md: `project`']) assert.ok(err.message.includes(m), `missing: ${m}\n${err.message}`);
    return true;
  });
});

test('duplicate slugs fail the build', async () => {
  const fm = 'title: T\ndate: 2026-01-01\ntrack: personal\nvisibility: public';
  const d = await tempDir({'2026-01-01-same.md': post(fm), '2026-02-same.md': post(fm)});
  await assert.rejects(loadPosts({dir: d}), /slug "same" is already used/);
});

test('missing images and oversized images fail the build', async () => {
  const fm = 'title: T\ndate: 2026-01-01\ntrack: personal\nvisibility: public';
  const missing = await tempDir({'p.md': post(fm, '![x](images/nope.png)')});
  await assert.rejects(loadPosts({dir: missing}), /image images\/nope.png not found/);
  const big = await tempDir({'p.md': post(fm), 'images/huge.jpg': Buffer.alloc(2.2 * 1024 * 1024)});
  await assert.rejects(loadPosts({dir: big}), /huge.jpg is 2.2 MB; the limit is 2 MB/);
});

test('files starting with _ are ignored and a missing directory means no posts', async () => {
  const d = await tempDir({'_template.md': 'not even frontmatter'});
  assert.deepEqual(await loadPosts({dir: d}), []);
  assert.deepEqual(await loadPosts({dir: path.join(d, 'nope')}), []);
});

test('rss escapes titles and contains only what it is given', async () => {
  const xml = rss([{slug: 's', title: 'A & B <c>', date: '2026-01-02', track: 'technical', summary: '', html: '<p>x ]]> y</p>'}], {title: 'T', description: 'D', path: '/f.xml'});
  assert.match(xml, /<title>A &amp; B &lt;c&gt;<\/title>/);
  assert.match(xml, /]]]]><!\[CDATA\[>/);
  assert.match(xml, /<link>https:\/\/c-kaustubh.netlify.app\/writing\/s\/<\/link>/);
});

test('slugify', () => {
  assert.equal(slugify('Why <code>fsync</code> lies — sometimes!'), 'why-fsync-lies-sometimes');
});
