# Plan: a writing section at `/notes`

Status: **proposal**. Nothing is built yet. Decisions marked ❓ need a yes/no before Phase 1 starts.

## 1. What it is

A small writing section on the portfolio where I publish what I learn while building: build logs, negative results, and short explainers. The homepage presents each project as a question (“Does retrieval actually improve uncertainty estimation?”). Notes are where I write up the answers.

### Name: `/notes` ❓

| Option | Feel | Verdict |
|---|---|---|
| **`/notes`** | Lab notebook. Fine for a 300-word finding or a 3,000-word deep dive. Little pressure to polish. | **Recommended** |
| `/writing` | Neutral and professional, but sounds like essays only. | Good fallback |
| `/thoughts` | Personal and opinion-led. Odd fit for a CUDA kernel walkthrough. | Skip |
| `/blog` | Clear, but generic. | Skip |

Nav label: **Notes**. Page heading: “Notes”, with the intro line *“What I learn while building things, written down so I don’t forget it.”*

### What a note can be

The frontmatter `kind` field sets a small label on each post:

- **Build log**: one milestone of an ongoing project (for example, “Adding a WAL to my SQL engine”).
- **Finding**: a result, especially a negative one (for example, “Retrieval didn’t make my uncertainty estimates better”).
- **Explainer**: first-principles walkthrough of one idea (for example, “What a CUDA matmul kernel actually does”).

### Seed posts (pick 1–2 for launch)

1. **sql-engine: from pages to two-phase commit.** I built a SQL database from scratch, milestone by milestone, from the buffer pool to the WAL to 2PC. A strong systems story.
2. **UncertaRAG’s negative result.** The no-retrieval baseline beat the RAG variants on AUROC. This is the content the project row can’t fit.
3. **lobcast: quoting at the touch lost money.** A short Finding post about the first backtest.
4. **Qwen3-8B in raw CUDA.** What you need to write when there’s no framework.

> Pre-publish rule: no employer-internal details (ticket numbers, internal service, class, team, or environment names). Hold off on unpublished research (for example, the AST capstone) until the paper is out.

## 2. How it fits the current site

Current state, from reading the code:

- React 19 + Vite SPA, Motion for transitions, one `index.html`.
- `src/navigation.js` intercepts clicks only for an **exact-match** `supported` path set, then swaps views with fades and saves scroll positions.
- `scripts/pages.mjs` copies `dist/index.html` to `contact.html` and `resume.html` with a changed `<title>`. It also writes `sitemap.xml` and `robots.txt`.
- Content already lives in `content/` (`projects.md`, `profile.json`).
- Netlify publishes `dist/`.

**The main constraint:** blog posts are shared on LinkedIn and X, and their link previews (and most crawlers) don’t run JavaScript. Every post needs a **real HTML file with its own `<title>`, description, and Open Graph tags, plus the article text in the HTML**. The current “copy index.html and change the title” approach is close. It just needs per-post meta tags and prerendered body content.

### Architecture

```
content/notes/
  2026-12-sql-engine-wal.md        ← one Markdown file per post, frontmatter on top
  images/…                         ← post images (copied to dist/notes/images)

scripts/notes.mjs                  ← single source of truth: read, parse, render
  loadNotes({drafts}) → [{slug, title, date, summary, kind, tags, html, readingTime, …}]

vite.config.js
  + notesPlugin()                  ← virtual module "virtual:notes"
                                     - index: metadata only (small, ships with app)
                                     - each post body: lazy chunk, loaded on navigation

scripts/pages.mjs (extended)
  dist/notes/index.html            ← list page: meta + prerendered list
  dist/notes/<slug>/index.html     ← per post: title, description, canonical, OG/Twitter
                                     tags, article HTML inside #root
  dist/notes/feed.xml              ← RSS
  sitemap.xml                      ← add /notes/ and every post
```

**Why this design:**

- **No new framework.** Astro or Next would handle this well, but it means re-platforming a site that was just redesigned. Here the Markdown is rendered once at build time and both the SPA and the static HTML use the same output.
- **No Markdown parser ships to the browser.** HTML is generated at build time, and post bodies are lazy-loaded, so the homepage bundle barely grows.
- **Works without JS.** The prerendered HTML is readable on its own. When JS loads, `createRoot` replaces it with the same content and the usual navigation takes over.

**Libraries:** `gray-matter` (frontmatter), `marked` or `markdown-it` (Markdown), `shiki` (build-time code highlighting with a light theme matched to the palette). Phase 3 adds `katex` for math. All are dev dependencies only.

### Frontmatter schema

```yaml
---
title: "Adding a write-ahead log to my SQL engine"
date: 2026-12-04
updated: 2026-12-10        # optional
summary: "Crash safety from first principles: what fsync promises, and what it doesn't."
kind: build-log            # build-log | finding | explainer
tags: [databases, sql-engine]
project: sql-engine        # optional, links to the matching project row
draft: false               # drafts appear in `npm run dev` only
---
```

The slug comes from the filename without its date prefix (`sql-engine-wal`). The build **fails** if a required field is missing or two posts share a slug.

### Routing changes (`src/navigation.js`, `src/main.jsx`)

- Replace the exact-match `supported` set with a matcher that also accepts `/notes`, `/notes/`, and `/notes/<slug>/`.
- `canonicalURL`: `/notes` → `/notes/`, `/notes.html` → `/notes/`. Netlify pretty URLs serve `notes/index.html` at `/notes/`.
- `RouteContent`: add `NotesIndex` and `NotePage`. Unknown slugs show a small “Note not found” view with a link back to the list.
- `document.title` and the meta description update per post, as Contact and Résumé already do.
- Scroll restoration, focus moving to `main h1`, and reduced-motion support all apply automatically because the new routes use the same `useNavigation` hook.

## 3. Design (follows the existing system)

Same white paper, aubergine ink, coral accent, Google Sans and Google Sans Mono, and hairline rows. Nothing new except a reading measure.

**`/notes/` list**
- Eyebrow `NOTES`, then H1 and the intro line.
- One hairline row per post, like `.project-row`: a mono date on the left, title and one-line summary in the middle, and `kind` and reading time on the right in mono eyebrow style. Rows highlight on hover with `--wash`, like project rows.
- Grouped by year once there are more than ~8 posts.
- Phase 3: tag filter, reusing the project filter rail pattern from the redesign.

**`/notes/<slug>/` post**
- Column of about 68ch, body text 17–18px, line-height about 1.7. Headings use the same light weight and tight tracking as the hero, at a smaller size.
- Header: `BUILD LOG · 4 DEC 2026 · 7 MIN`, then the title, then the summary as a dek.
- Coral links and blockquote rule. Code in Google Sans Mono on a very light tint, with a copy button. `h2` and `h3` get hover `#` anchor links.
- Footnotes as Markdown footnotes, shown as small numbered notes at the end.
- Footer: “Related project → sql-engine” (from `project:`), previous and next posts, and **“Reply by email”** (`mailto:` with the post title as the subject). No comment system, which keeps the site static and spam-free.
- The global footer stays, but the “Good to meet you” contact band is hidden on posts because “Reply by email” replaces it.

**Site-wide hooks**
- Header nav: Home · **Notes** · Contact · Résumé on desktop and mobile, with a new `pen` icon in `Icon.jsx`.
- Homepage: a short **“Recently written”** section after *What I’ve built* with the latest 3 posts as rows and a “All notes →” link. Hidden while there are no published posts.
- Project rows: if a post sets `project: X`, that project row gets a small “Read the notes →” link.

## 4. Phases

### Phase 0: decide (≈ 15 min)
- [ ] Confirm the name (`/notes`) and the three post kinds.
- [ ] Pick the first seed post and draft it in `content/notes/`. The plumbing is quicker to build than the first post is to write.

### Phase 1: MVP (≈ 1 session)
- [ ] `scripts/notes.mjs`: load, validate, and render Markdown with Shiki; compute reading time.
- [ ] Vite `notesPlugin` with the `virtual:notes` index and lazy post bodies; drafts only in dev.
- [ ] `NotesIndex` and `NotePage` components plus article typography CSS in `style.css`.
- [ ] Routing: path matcher, canonical URLs, titles, and the not-found state.
- [ ] Notes link in desktop and mobile nav; `pen` icon.
- [ ] `pages.mjs`: per-post `index.html` with meta, canonical, OG/Twitter tags, and prerendered body; `/notes/index.html`; sitemap entries.
- [ ] One real post published.

### Phase 2: polish (≈ 1 session)
- [ ] RSS at `/notes/feed.xml`, plus `<link rel="alternate" type="application/rss+xml">` in the head.
- [ ] “Recently written” on the homepage; “Read the notes” on project rows.
- [ ] Heading anchors, code copy button, previous/next links, Reply by email.
- [ ] Image handling: copy `content/notes/images`, `loading="lazy"`, width and height required, optional captions.
- [ ] README section: “How to write a note”.

### Phase 3: optional
- [ ] Generated OG image per post (title on white with the K monogram and a coral mark) via `satori` + `resvg` at build time.
- [ ] KaTeX for research posts.
- [ ] Tag filter on `/notes/` and series grouping (for example, all sql-engine build logs).
- [ ] Privacy-friendly view counts (Netlify Analytics or Plausible) if wanted.

## 5. Done means

- `npm run build` writes `dist/notes/index.html`, one `dist/notes/<slug>/index.html` per published post, `feed.xml`, and an updated `sitemap.xml`. Drafts appear in none of them.
- Loading `/notes/<slug>/` directly works, and with JS disabled the article is still readable.
- Pasting a post URL into the LinkedIn Post Inspector or an X card validator shows the right title, description, and image.
- Navigating Home → Notes → post → Back restores the scroll position on the list, matching current behaviour, and focus moves to the H1.
- Reduced motion turns off the fades, as it does on existing pages.
- The homepage JS bundle grows by less than about 5 KB gzipped (index metadata only).
- Lighthouse scores for accessibility and SEO on a post page are ≥ 95.

## 6. Open questions

1. ❓ `/notes`, or one of the alternatives?
2. ❓ How often? A rough target (for example, one post a month) affects whether the homepage “Recently written” section is worth it from day one.
3. ❓ Is “Reply by email” enough, or do you want reactions or comments later? (Recommendation: email only.)
4. ❓ Should the first post launch with Phase 1, or should Phase 1 be built first and merged with zero published posts (section hidden until the first one)?
