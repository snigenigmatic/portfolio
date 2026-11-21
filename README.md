# C Kaustubh — portfolio

React + Vite portfolio. A personal introduction and portrait, an interactive view of the questions behind the work, five projects, experience, and open source contributions. White background, aubergine text, coral accents, Google Sans, and hairline-separated rows.

```sh
npm ci
npm run dev
npm run build
npm run preview
npm test        # writing pipeline + full build checks (uses test/fixtures/writing)
```

## Content

- `content/profile.json`: current role, experience, education, and open source contributions.
- `content/projects.md`: five selected projects, parsed by `src/data.js` and shared by the home and Projects pages.
- `src/Icon.jsx`: shared SVG icons.
- `static/favicon.svg`: monogram favicon; PNG, ICO, and Apple touch versions are included.
- `static/resume.pdf`: current résumé. Replaced with the user-supplied résumé on 4 November 2026.

The homepage lists ASR fairness, UncertaRAG, Qwen CUDA, Rakshak-AI, and LocalLens. Contact is a small separate page with email, LinkedIn, X/Twitter, and GitHub, sourced from the prior website and the owner’s GitHub profile. Dates and experience are based on the supplied résumé. Project descriptions omit performance comparisons without enough evaluation context.

Netlify runs `npm run build` and publishes `dist/`. The build emits `/contact.html` and `/resume.html`. The former About and Projects URLs redirect to the homepage. `/static/resume.pdf` remains valid. Navigation uses Motion for React with 180ms transitions and reduced-motion support.

`rendered/` and `layout/` retain the previous Anna implementation and are not published. `.openai/hosting.json` configures the private review deployment; `netlify.toml` configures Netlify.

## Navigation

Internal page links use the History API with short Motion transitions. Same-page links scroll smoothly; Back and Forward restore the saved position for each history entry. Modified clicks, external links, PDF opens, and downloads retain browser behaviour. Current navigation is labelled with aria-current and new destinations receive keyboard focus.

The PDF preview loads separately, with delayed loading feedback and a fallback; direct Open and Download links remain available. Reduced-motion preferences disable animated scrolling and page fades.

## Writing

`/writing/` holds technical and personal posts. Everything is generated at build time, so no backend is needed. Details are in `docs/writing-plan.md`.

### How to write a post

1. Copy `content/writing/_template.md` to `content/writing/YYYY-MM-DD-your-slug.md`. The URL becomes `/writing/your-slug/`.
2. Fill in the frontmatter:
   - `title`, `date` (YYYY-MM-DD)
   - `track`: `technical` or `personal`
   - `visibility`: `draft`, `unlisted` or `public`
   - `summary`: required for technical posts
   - Optional: `updated`, `tags`, `project`, `comments`, `replies`
3. Run `npm run dev` and open `/writing/`. Drafts show there with a badge, and edits reload the page.
4. Put images in `content/writing/images/`, under 2 MB each, and reference them as `![alt](images/name.jpg "caption")`. The build resizes them to at most 1600px wide and converts them to WebP.
5. When it's ready, set `visibility: public` and merge to `main`. Write and edit drafts on a branch so typo fixes don't each use up a Netlify deploy.

Visibility:

- **public**: listed, in RSS and the sitemap, indexed by search engines.
- **unlisted**: gets a page at its URL, but is `noindex` and appears in no list, feed, sitemap or JS bundle. It's hidden, not secret: the repo is public.
- **draft**: only shown by `npm run dev`. It is never built.

Personal posts show only the date and title, never appear on the homepage, and default to no comments and no email reply link. The Writing nav link and the homepage "What I’ve written" section appear only once at least one post is public.

The build fails with a list of problems if frontmatter is invalid, two posts share a slug, or an image is missing or too large.

### Comments (Giscus)

Technical posts can show Giscus comments, which are stored in GitHub Discussions. They stay hidden until `repoId` and `categoryId` are filled in `src/writing/config.js`. To set them up:

1. Enable Discussions on the repo.
2. Install the giscus GitHub app.
3. Create a "Comments" category.
4. Copy the two IDs from giscus.app.

Moderate comments in GitHub Discussions.

### How it's built

- `scripts/writing.mjs` reads, validates and renders posts (Markdown, Shiki code highlighting, footnotes, images).
- `scripts/vite-writing.mjs` exposes public post metadata to the app as `virtual:writing`. In dev, it also serves post bodies and images.
- `src/prerender.jsx` is built with `vite build --ssr`. `scripts/pages.mjs` uses it to write each post's own `index.html`, with its own title, description, canonical and Open Graph tags and the article already in the HTML. It also writes `post.json`, `feed.xml`, `technical.xml` and the sitemap entries.
- The client loads post bodies from `post.json` on navigation and caches them, so Back and Forward restore the scroll position.
