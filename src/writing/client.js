import {useEffect, useState} from 'react';
import {posts} from 'virtual:writing';
export {posts};

// Bodies are fetched as /writing/<slug>/post.json and kept in memory, so Back/Forward
// re-renders synchronously and scroll restoration has the full page height.
const cache = new Map();
const inflight = new Map();

// The prerendered page embeds its own post (this is also how unlisted posts load,
// since they are never in the client index).
function embedded(slug) {
  if (typeof document === 'undefined') return null;
  const node = document.getElementById('writing-post');
  if (!node) return null;
  try {
    const data = JSON.parse(node.textContent);
    if (data.slug === slug) { cache.set(slug, data); return data; }
  } catch { /* fall through to fetch */ }
  return null;
}

export function fetchPost(slug) {
  if (cache.has(slug)) return Promise.resolve(cache.get(slug));
  if (!inflight.has(slug)) {
    inflight.set(slug, fetch(`/writing/${slug}/post.json`).then(r => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).then(data => { cache.set(slug, data); return data; }).finally(() => inflight.delete(slug)));
  }
  return inflight.get(slug);
}

export function usePost(slug) {
  const [state, setState] = useState(() => {
    const data = cache.get(slug) || embedded(slug);
    return data ? {status: 'ready', data} : {status: 'loading', data: null};
  });
  useEffect(() => {
    if (state.status === 'ready' && state.data.slug === slug) return;
    let live = true;
    fetchPost(slug).then(data => live && setState({status: 'ready', data}), () => live && setState({status: 'missing', data: null}));
    return () => { live = false; };
  }, [slug]);
  return state;
}

// Warm the cache when a reader points at or focuses a post link.
export function installPrefetch() {
  const warm = e => {
    const a = e.target instanceof Element ? e.target.closest('a[data-prefetch]') : null;
    if (a) fetchPost(a.dataset.prefetch).catch(() => {});
  };
  document.addEventListener('pointerover', warm, {passive: true});
  document.addEventListener('focusin', warm);
}
