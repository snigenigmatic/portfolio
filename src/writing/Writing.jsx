import React, {useState, useEffect, useRef} from 'react';
import Icon from '../Icon';
import {Arrow, Label, email} from '../layout';
import {giscus, writingIntro} from './config';

const TRACK_LABELS = {all: 'All', technical: 'Technical', personal: 'Personal'};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const formatDate = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
export const normaliseTrack = t => (t === 'technical' || t === 'personal') ? t : 'all';

function PostRow({post}) {
  const technical = post.track === 'technical';
  return <article className={`writing-row writing-row-${post.track}`}>
    <time className="writing-date" dateTime={post.date}>{formatDate(post.date)}</time>
    <div>
      <h3><a href={`/writing/${post.slug}/`} data-prefetch={post.slug}>{post.title}</a></h3>
      {technical && post.summary && <p>{post.summary}</p>}
      {post.visibility === 'draft' && <span className="draft-badge">Draft · only visible in dev</span>}
    </div>
    <span className="eyebrow writing-meta">{TRACK_LABELS[post.track]}{technical && <> · {post.readingTime} min</>}</span>
  </article>;
}

export function PostList({posts, groupByYear}) {
  if (!groupByYear) return <div className="writing-list">{posts.map(p => <PostRow key={p.slug} post={p}/>)}</div>;
  const years = [...new Set(posts.map(p => p.date.slice(0, 4)))];
  return <div className="writing-list">{years.map(y => <section key={y} aria-labelledby={`year-${y}`}>
    <h2 className="writing-year eyebrow" id={`year-${y}`}>{y}</h2>
    {posts.filter(p => p.date.startsWith(y)).map(p => <PostRow key={p.slug} post={p}/>)}
  </section>)}</div>;
}

export function WritingIndex({posts, initialTrack = 'all'}) {
  const [track, setTrack] = useState(normaliseTrack(initialTrack));
  const choose = next => {
    setTrack(next);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (next === 'all') url.searchParams.delete('track'); else url.searchParams.set('track', next);
    window.history.replaceState(window.history.state, '', url);
  };
  const shown = track === 'all' ? posts : posts.filter(p => p.track === track);
  const counts = {all: posts.length, technical: posts.filter(p => p.track === 'technical').length, personal: posts.filter(p => p.track === 'personal').length};
  return <main id="main" className="section inner-page writing-page">
    <Label>Technical &amp; personal</Label>
    <h1>Writing</h1>
    <p className="page-intro">{writingIntro}</p>
    {posts.length > 0 ? <>
      <div className="writing-toolbar">
        <div className="interest-buttons writing-filter" role="group" aria-label="Filter posts by track">
          {Object.keys(TRACK_LABELS).map(t => <button key={t} type="button" aria-pressed={track === t} onClick={() => choose(t)}>{TRACK_LABELS[t]} <span>{counts[t]}</span></button>)}
        </div>
        <a className="feed-link" href="/writing/feed.xml"><Icon name="rss"/> RSS</a>
      </div>
      {shown.length ? <PostList posts={shown} groupByYear={shown.length > 8}/> : <p className="writing-empty">Nothing in this track yet.</p>}
    </> : <p className="writing-empty">Nothing published yet. The first post is on its way.</p>}
  </main>;
}

function Comments({slug}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } }, {rootMargin: '400px'});
    io.observe(node);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || !ref.current) return;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    Object.entries({repo: giscus.repo, 'repo-id': giscus.repoId, category: giscus.category, 'category-id': giscus.categoryId, mapping: 'specific', term: `writing/${slug}`, strict: '1', 'reactions-enabled': '1', 'emit-metadata': '0', 'input-position': 'top', theme: 'light', lang: 'en', loading: 'lazy'})
      .forEach(([k, v]) => s.setAttribute(`data-${k}`, v));
    ref.current.appendChild(s);
  }, [visible, slug]);
  return <section className="post-comments" aria-label="Comments"><h2 className="eyebrow">Comments</h2><div ref={ref} className="giscus"/></section>;
}
export const commentsConfigured = () => Boolean(giscus.repoId && giscus.categoryId);

function useCopyButtons(ref, html) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !navigator.clipboard) return;
    const buttons = [...root.querySelectorAll('.code-block')].map(block => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(block.querySelector('pre')?.innerText ?? ''); button.textContent = 'Copied'; }
        catch { button.textContent = 'Press ⌘C'; }
        setTimeout(() => { button.textContent = 'Copy'; }, 1600);
      });
      block.appendChild(button);
      return button;
    });
    return () => buttons.forEach(b => b.remove());
  }, [html]);
}

export function PostView({post, newer, older, projectHref}) {
  const technical = post.track === 'technical';
  const body = useRef(null);
  useCopyButtons(body, post.html);
  const replySubject = encodeURIComponent(`Re: ${post.title}`);
  return <main id="main" className={`section inner-page post post-${post.track}`}>
    <article>
      <header className="post-header">
        <a className="post-back text-link" href={technical ? '/writing/?track=technical' : '/writing/?track=personal'}><Icon name="left"/> Writing</a>
        {post.visibility === 'draft' && <p className="draft-badge">Draft · only visible in dev</p>}
        <p className="eyebrow post-kicker">
          {technical && <>{'Technical'} · </>}<time dateTime={post.date}>{formatDate(post.date)}</time>{technical && <> · {post.readingTime} min read</>}
        </p>
        <h1>{post.title}</h1>
        {technical && post.summary && <p className="post-dek">{post.summary}</p>}
        {post.updated && <p className="eyebrow post-updated">Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></p>}
      </header>
      <div className="post-body" ref={body} dangerouslySetInnerHTML={{__html: post.html}}/>
      <footer className="post-footer">
        {technical && post.tags.length > 0 && <p className="eyebrow post-tags">{post.tags.join(' · ')}</p>}
        {projectHref && <a className="text-link" href={projectHref}><Icon name="code"/> Related project <Arrow/></a>}
        {post.replies && <a className="text-link" href={`${email}?subject=${replySubject}`}><Icon name="mail"/> Reply by email <Arrow/></a>}
      </footer>
    </article>
    {(newer || older) && <nav className="post-nav" aria-label={`More ${technical ? 'technical' : 'personal'} writing`}>
      {older ? <a href={`/writing/${older.slug}/`} data-prefetch={older.slug}><Label>Previous</Label><span>{older.title}</span></a> : <span/>}
      {newer ? <a className="post-nav-next" href={`/writing/${newer.slug}/`} data-prefetch={newer.slug}><Label>Next</Label><span>{newer.title}</span></a> : <span/>}
    </nav>}
    {post.comments && commentsConfigured() && post.visibility === 'public' && <Comments slug={post.slug}/>}
  </main>;
}

export function NotFound() {
  return <main id="main" className="section inner-page writing-page"><Label>Writing</Label><h1>Post not found</h1><p className="page-intro">This post doesn’t exist, or it has moved.</p><a className="text-link" href="/writing/"><Icon name="left"/> All writing</a></main>;
}

export function RecentWriting({posts}) {
  const recent = posts.filter(p => p.track === 'technical').slice(0, 3);
  if (!recent.length) return null;
  return <section className="section recent-writing" aria-labelledby="recent-writing-heading">
    <div className="section-title"><h2 id="recent-writing-heading"><Icon name="pen"/> What I’ve written</h2><a className="text-link" href="/writing/">All writing <Arrow/></a></div>
    <PostList posts={recent}/>
  </section>;
}
