// Runs the real production build against the fixtures and checks dist/.
import {test, before} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile, readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';

const read = f => readFile(`dist/${f}`, 'utf8');
before(() => { execFileSync('npm', ['run', 'build'], {env: {...process.env, WRITING_DIR: 'test/fixtures/writing'}, stdio: 'pipe'}); });

test('pages exist for public and unlisted posts, not drafts', () => {
  for (const s of ['sql-engine-wal', 'a-quiet-week', 'older-technical', 'just-for-friends']) {
    assert.ok(existsSync(`dist/writing/${s}/index.html`), s);
    assert.ok(existsSync(`dist/writing/${s}/post.json`), s);
  }
  assert.ok(!existsSync('dist/writing/not-yet'));
  assert.ok(!existsSync('dist-ssr'), 'temporary SSR build is cleaned up');
});

test('post pages carry their own meta tags and prerendered article', async () => {
  const html = await read('writing/sql-engine-wal/index.html');
  assert.match(html, /<title>Adding a write-ahead log to a toy database — Kaustubh<\/title>/);
  assert.match(html, /<meta name="description" content="Crash safety/);
  assert.match(html, /<meta property="og:type" content="article"\/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/c-kaustubh.netlify.app\/writing\/sql-engine-wal\/"\/>/);
  assert.match(html, /<div id="root"><a class="skip-link"[\s\S]*<h1>Adding a write-ahead log/);
  assert.match(html, /aria-current="page"><svg[^]*?<\/svg> Writing<\/a>/);
  assert.doesNotMatch(html, /noindex/);
  assert.doesNotMatch(html, /<noscript>/);
  assert.doesNotMatch(html, /Good to meet you/, 'contact band is hidden on posts');
  assert.match(html, /Reply by email/);
  assert.match(html, /href="\/#project-qwen-cuda"/);
});

test('embedded post JSON cannot close its script tag early', async () => {
  const html = await read('writing/sql-engine-wal/index.html');
  const json = html.match(/<script type="application\/json" id="writing-post">([\s\S]*?)<\/script>/)[1];
  assert.doesNotMatch(json, /</);
  assert.equal(JSON.parse(json).slug, 'sql-engine-wal');
});

test('personal posts are quiet: no reading time, no reply, no project', async () => {
  const html = await read('writing/a-quiet-week/index.html');
  assert.doesNotMatch(html, /min read|Reply by email|Related project|Technical ·/);
  assert.match(html, /<time dateTime="2026-11-20">20 Nov 2026<\/time>/);
});

test('unlisted posts are noindex and appear in no list, feed or sitemap', async () => {
  assert.match(await read('writing/just-for-friends/index.html'), /<meta name="robots" content="noindex"\/>/);
  for (const f of ['writing/index.html', 'writing/feed.xml', 'writing/technical.xml', 'sitemap.xml', 'index.html']) assert.doesNotMatch(await read(f), /just-for-friends/, f);
  const assets = await readdir('dist/assets');
  for (const a of assets.filter(f => f.endsWith('.js'))) {
    const js = await read(`assets/${a}`);
    assert.doesNotMatch(js, /just-for-friends|not-yet/, a);
  }
});

test('feeds and sitemap', async () => {
  const feed = await read('writing/feed.xml');
  assert.equal((feed.match(/<item>/g) || []).length, 3);
  const tech = await read('writing/technical.xml');
  assert.equal((tech.match(/<item>/g) || []).length, 2);
  assert.doesNotMatch(tech, /a-quiet-week/);
  const sitemap = await read('sitemap.xml');
  for (const p of ['writing/', 'writing/sql-engine-wal/', 'writing/a-quiet-week/', 'writing/older-technical/']) assert.ok(sitemap.includes(`netlify.app/${p}<`), p);
});

test('images are converted and the list page is prerendered with the filter', async () => {
  assert.ok(existsSync('dist/writing/images/diagram.webp'));
  const index = await read('writing/index.html');
  assert.match(index, /aria-label="Filter posts by track"/);
  assert.match(index, /href="\/writing\/sql-engine-wal\/"/);
  assert.match(index, /<title>Writing — Kaustubh<\/title>/);
});
