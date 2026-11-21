// Build-time renderer for /writing pages (built with `vite build --ssr`, used by scripts/pages.mjs).
// Produces the same markup the client renders, so pages are readable without JavaScript and
// link previews/crawlers see the real content. The client replaces it on load.
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Header, Footer} from './layout';
import {WritingIndex, PostView} from './writing/Writing';
import {projectForPost, projectKey} from './data';

function Shell({path, showWriting, children}) {
  return <><a className="skip-link" href="#main">Skip to content</a><div id="top"/><Header path={path} showWriting={showWriting}/><div className="route-view">{children}<Footer path={path}/></div></>;
}

export function renderIndex(posts) {
  return renderToStaticMarkup(<Shell path="/writing/" showWriting={posts.length > 0}><WritingIndex posts={posts}/></Shell>);
}

export function renderPost(post, {newer, older, showWriting}) {
  const project = projectForPost(post);
  return renderToStaticMarkup(<Shell path={`/writing/${post.slug}/`} showWriting={showWriting}><PostView post={post} newer={newer} older={older} projectHref={project && `/#project-${projectKey(project)}`}/></Shell>);
}
