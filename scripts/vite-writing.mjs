// Vite plugin for /writing.
// - `virtual:writing` exports metadata for listed posts (public; drafts too in dev). No bodies.
// - In dev, serves /writing/<slug>/post.json and /writing/images/<name>.webp from content/writing.
//   In production those files are written by scripts/pages.mjs.
import path from 'node:path';
import {loadPosts, loadImages, imageWebp, listed, meta, payload, neighbours, writingDir} from './writing.mjs';

const ID = 'virtual:writing';
const RESOLVED = '\0' + ID;

export default function writing() {
  let mode = 'build';
  return {
    name: 'portfolio-writing',
    configResolved(config) { mode = config.command === 'serve' ? 'dev' : 'build'; },
    resolveId(id) { if (id === ID) return RESOLVED; },
    async load(id) {
      if (id !== RESOLVED) return;
      const dir = writingDir();
      const posts = listed(await loadPosts({mode, dir}), mode).map(meta);
      return `export const posts = ${JSON.stringify(posts)};`;
    },
    configureServer(server) {
      const dir = writingDir();
      server.watcher.add(dir);
      const reload = file => {
        if (!path.resolve(file).startsWith(dir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({type: 'full-reload'});
      };
      for (const event of ['add', 'change', 'unlink']) server.watcher.on(event, reload);
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://local');
        try {
          const post = url.pathname.match(/^\/writing\/([a-z0-9-]+)\/post\.json$/);
          if (post) {
            const all = await loadPosts({mode: 'dev', dir});
            const found = all.find(p => p.slug === post[1]);
            if (!found) { res.statusCode = 404; return res.end('{}'); }
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({...payload(found), ...neighbours(found, listed(all, 'dev'))}));
          }
          const img = url.pathname.match(/^\/writing\/images\/([^/]+)\.webp$/);
          if (img) {
            const image = [...(await loadImages(dir)).values()].find(i => i.output === `${decodeURIComponent(img[1])}.webp`);
            if (!image) { res.statusCode = 404; return res.end(); }
            res.setHeader('Content-Type', 'image/webp');
            return res.end(await imageWebp(image));
          }
        } catch (error) {
          server.config.logger.error(error.message);
          res.statusCode = 500;
          return res.end(error.message);
        }
        next();
      });
    }
  };
}
