import {useEffect, useRef, useState} from 'react';

const storageKey = 'kaustubh-scroll-positions';
const supported = new Set(['/', '/index.html', '/contact', '/contact.html', '/resume', '/resume.html', '/about', '/about.html', '/projects', '/projects.html']);
const newKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

export function canonicalURL(input) {
  const url = new URL(input, window.location.href);
  if (url.pathname === '/index.html' || /^\/about(?:\.html)?\/?$/.test(url.pathname)) url.pathname = '/';
  if (/^\/projects(?:\.html)?\/?$/.test(url.pathname)) { url.pathname = '/'; url.hash = '#work'; }
  if (url.pathname === '/contact') url.pathname = '/contact.html';
  if (url.pathname === '/resume') url.pathname = '/resume.html';
  return url;
}

function ensureKey() {
  const key = window.history.state?.__kaustubh?.key || newKey();
  window.history.replaceState({...window.history.state, __kaustubh: {key}}, '', window.location.href);
  return key;
}

export function useNavigation() {
  const positions = useRef(null);
  if (!positions.current) {
    try { positions.current = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); }
    catch { positions.current = {}; }
  }
  const [route, setRoute] = useState(() => {
    const url = canonicalURL(window.location.href);
    window.history.replaceState(window.history.state, '', url);
    const key = ensureKey();
    return {key, path: url.pathname, hash: url.hash, kind:'initial', y:positions.current[key]};
  });
  const current = useRef(route);
  const restoring = useRef(false);
  const save = () => {
    if (!restoring.current) positions.current[current.current.key] = window.scrollY;
    try { sessionStorage.setItem(storageKey, JSON.stringify(positions.current)); } catch { /* Storage is optional. */ }
  };

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const visit = (url, kind, key) => {
      const next = {key, path:url.pathname, hash:url.hash, kind, y:positions.current[key]};
      restoring.current = true;
      current.current = next;
      setRoute(next);
    };
    const click = e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      const raw = new URL(anchor.href, window.location.href);
      if (raw.origin !== window.location.origin || !supported.has(raw.pathname)) return;
      const url = canonicalURL(raw);
      e.preventDefault();
      save();
      if (url.href === window.location.href) {
        visit(url, 'repeat', current.current.key);
        return;
      }
      const key = newKey();
      window.history.pushState({...window.history.state, __kaustubh:{key}}, '', url);
      visit(url, 'push', key);
    };
    const pop = () => {
      save();
      const url = canonicalURL(window.location.href);
      window.history.replaceState(window.history.state, '', url);
      visit(url, 'pop', ensureKey());
    };
    const scroll = () => {
      if (!restoring.current) positions.current[current.current.key] = window.scrollY;
    };
    document.addEventListener('click', click);
    window.addEventListener('popstate', pop);
    window.addEventListener('scroll', scroll, {passive:true});
    window.addEventListener('pagehide', save);
    return () => {
      save();
      window.history.scrollRestoration = previous;
      document.removeEventListener('click', click);
      window.removeEventListener('popstate', pop);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('pagehide', save);
    };
  }, []);

  const complete = (next, reduced) => {
    // A rapidly superseded page must not override the latest navigation.
    if (next.key !== current.current.key) return;
    let target = null;
    if (next.hash) {
      try { target = document.getElementById(decodeURIComponent(next.hash.slice(1))); } catch { /* Malformed hashes fall back to the top. */ }
    }
    const restore = (next.kind === 'pop' || next.kind === 'initial') && Number.isFinite(next.y);
    if (restore) window.scrollTo({top:next.y, behavior:'instant'});
    else if (target) target.scrollIntoView({behavior:reduced || next.kind === 'initial' ? 'instant' : 'smooth', block:'start'});
    else window.scrollTo({top:0, behavior:next.kind === 'repeat' && !reduced ? 'smooth' : 'instant'});
    if (next.kind !== 'initial') {
      const focus = target || document.querySelector('main h1') || document.querySelector('main');
      if (focus) {
        const added = !focus.hasAttribute('tabindex');
        if (added) focus.setAttribute('tabindex', '-1');
        focus.focus({preventScroll:true});
        if (added) focus.addEventListener('blur', () => focus.removeAttribute('tabindex'), {once:true});
      }
    }
    restoring.current = false;
    positions.current[next.key] = window.scrollY;
  };
  return {route, complete};
}
