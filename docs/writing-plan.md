# Plan: a writing section at `/writing`

Status: **proposal, revised 21 Nov 2026**. Nothing is built yet. Items marked ❓ are still open.

Changes from the first draft (`/notes`):
- Renamed to **`/writing`**, since posts are both technical and personal.
- Post kinds replaced by two **tracks**: Technical and Personal.
- Added **visibility** levels: public, unlisted, draft.
- Added **free-tier Netlify rules** and **comments without a backend** (Giscus).

## 1. What it is

One writing section for two kinds of posts:

- **Technical:** build logs, findings (including negative results) and first-principles explainers. The homepage presents each project as a question; these posts are where the answers go.
- **Personal:** whatever's on my mind. Feelings, reflections, life. Not tied to work.

It stays one section with two shelves rather than two separate sites. That's more honest and simpler to maintain.

### Name: `/writing`

`/notes` sounds like lab notes. `/thoughts` is odd above a CUDA walkthrough. `/writing` covers both without leaning either way.

- Nav label: **Writing**.
- Page intro: *“Things I’ve built and things I’ve felt, written down.”* ❓ (wording is up to me)

### Seed posts

Technical, pick one for launch:
1. **sql-engine: from pages to two-phase commit.** A from-scratch SQL database, milestone by milestone.
2. **UncertaRAG’s negative result.** The no-retrieval baseline beat the RAG variants.
3. **lobcast: quoting at the touch lost money.** A short finding.
4. **Qwen3-8B in raw CUDA.** What you write when there’s no framework.

Personal: whenever one is ready. No launch pressure.

> **Pre-publish rules**
> - No employer-internal details (ticket numbers, internal service, class, team or environment names).
> - No unpublished research (for example, the AST capstone) until the paper is out.
> - Personal posts sit as drafts or unlisted for **at least a day** before going public. The site is linked from my résumé.

## 2. Constraints: free Netlify, no backend

The site runs on a free Netlify account with no server and no database. **Everything in this plan is static**:

| Feature | How it works without a backend |
|---|---|
| Posts | Markdown in the repo, rendered to HTML at build time |
| List page, RSS, sitemap | Static files generated at build time |
| Unlisted posts | A static page with `noindex`, left out of lists, RSS and the sitemap |
| Email replies | A `mailto:` link |
| Comments (technical posts) | **Giscus**: stored in GitHub Discussions, loaded by a script tag. GitHub hosts the data. |
| View counts (optional, later) | GoatCounter or similar: a free script tag. **Not** Netlify Analytics, which is paid. |

### Keeping inside the free allowance

Netlify’s free plan counts usage in credits. Each **production deploy** costs credits, as does bandwidth. As far as I know that works out to roughly 20 deploys a month; **check the account’s billing page for the real numbers**. If credits run out, the site pauses until the month resets.

Rules:
1. **Every push to `main` deploys.** Write and edit drafts on a branch or locally with `npm run dev`. Merge to `main` only when a post is ready. Batch typo fixes.
2. **Skip deploys for changes that don’t affect the site.** Add an `ignore` command to `netlify.toml` so pushes that only touch `docs/` (and similar non-site paths) don’t build. Test it on a branch first.

   ```toml
   [build]
     ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- . ':(exclude)docs' ':(exclude)README.md'"
   ```
3. **Images are the only bandwidth risk.** Resize and compress at build time (for example, `sharp` to WebP at most 1600px wide). Fail the build if a source image is over about 2 MB, so one phone photo can’t eat the allowance.
4. **Build time.** Markdown, Shiki and image processing add seconds, not minutes.

**Way out:** `dist/` is plain static files. If the free tier is ever too tight, the same output can be hosted on Cloudflare Pages or GitHub Pages without code changes.

## 3. How it fits the current site

Current state, from reading the code:

- React 19 + Vite SPA, Motion for transitions, one `index.html`.
- `src/navigation.js` intercepts clicks only for an **exact-match** `supported` path set, then swaps views with fades and saves scroll positions.
- `scripts/pages.mjs` copies `dist/index.html` to `contact.html` and `resume.html` with a changed `<title>`. It also writes `sitemap.xml` and `robots.txt`.
- Content lives in `content/` (`projects.md`, `profile.json`).

**The main constraint:** link previews on LinkedIn and X (and most crawlers) don’t run JavaScript. Every public post needs a **real HTML file with its own title, description and Open Graph tags, with the article text in the HTML**.

### Architecture

```
content/writing/
  2026-12-sql-engine-wal.md        ← one Markdown file per post, frontmatter on top
  images/…                         ← source images (resized at build)

scripts/writing.mjs                ← single source of truth: read, validate, render
  loadPosts({mode}) → [{slug, title, date, summary, track, visibility, tags, html, …}]

vite.config.js
  + writingPlugin()                ← virtual module "virtual:writing"
                                     - index: metadata for public posts only (ships with app)
                                     - each post body: lazy chunk, loaded on navigation

scripts/pages.mjs (extended)
  dist/writing/index.html          ← list page: meta + prerendered list
  dist/writing/<slug>/index.html   ← per post (public + unlisted): title, description,
                                     canonical, OG/Twitter tags, article HTML in #root
  dist/writing/feed.xml            ← RSS, everything public
  dist/writing/technical.xml       ← RSS, technical only
  sitemap.xml                      ← adds /writing/ and public posts only
```

**Why this design:**
- **No new framework.** No re-platforming a site that was just redesigned.
- **No Markdown parser ships to the browser.** HTML is generated at build time, and post bodies are lazy-loaded.
- **Works without JS.** The prerendered HTML is readable on its own; React takes over when it loads.

**Libraries (dev dependencies only):** `gray-matter` (frontmatter), `marked` or `markdown-it` (Markdown), `shiki` (code highlighting at build time, light theme matched to the palette), `sharp` (images). Later: `katex` (math).

### Frontmatter schema

```yaml
---
title: "Adding a write-ahead log to my SQL engine"
date: 2026-12-04
updated: 2026-12-10        # optional
summary: "Crash safety from first principles."   # required for technical; optional for personal
track: technical           # technical | personal
visibility: public         # public | unlisted | draft
tags: [databases, sql-engine]   # optional
project: sql-engine        # optional, technical only: links to the project row
comments: true             # optional; default true for technical, false for personal
replies: true              # optional "Reply by email"; default true for technical, false for personal
---
```

**Visibility:**

| | Listed on /writing | RSS | Sitemap | Search engines | Has a URL |
|---|---|---|---|---|---|
| `public` | ✅ | ✅ | ✅ | indexed | ✅ |
| `unlisted` | ❌ | ❌ | ❌ | `noindex` | ✅ (share the link directly) |
| `draft` | ❌ | ❌ | ❌ | — | dev server only |

Unlisted posts are hidden, not secret. Anyone with the link can read them, and the source is in a public repo. Anything truly private shouldn’t be committed.

The slug comes from the filename without its date prefix. The build **fails** if a required field is missing, a value is invalid, or two posts share a slug.

### Routing changes (`src/navigation.js`, `src/main.jsx`)

- Replace the exact-match `supported` set with a matcher that also accepts `/writing`, `/writing/`, and `/writing/<slug>/`.
- `canonicalURL`: `/writing` and `/writing.html` → `/writing/`.
- `RouteContent`: add `WritingIndex` and `PostPage`. Unknown slugs show a small “Post not found” view with a link back.
- `document.title` and the meta description update per post, as Contact and Résumé already do. Unlisted posts also get `<meta name="robots" content="noindex">`.
- Scroll restoration, focus moving to `main h1` and reduced motion all work through the existing `useNavigation` hook.

### Comments: Giscus

- One-time setup: enable Discussions on `snigenigmatic/portfolio`, install the Giscus GitHub app, and create a “Comments” discussion category. Generate the repo and category IDs at giscus.app and put them in a small config file.
- `<Comments>` component: injects the Giscus script **only when the comments section scrolls into view**, so pages stay fast. Maps each thread to the post’s slug. Uses a light theme matched to the palette.
- Shown only when `comments` is true (default: technical posts only).
- Moderation happens in GitHub Discussions: lock, hide or delete there.
- Readers need a GitHub account to comment. That suits technical readers and is part of why personal posts default to off.

## 4. Design (follows the existing system)

Same white paper, aubergine ink, coral accent, Google Sans and Google Sans Mono, and hairline rows. The only addition is a reading measure.

**`/writing/` list**
- Eyebrow `WRITING`, then H1 and the intro line.
- Track toggle: **All · Technical · Personal**, default All. The choice is kept in the URL (`?track=personal`) so it survives Back.
- One hairline row per public post, like `.project-row`: a mono date on the left, title (and summary for technical posts) in the middle, and track on the right in mono eyebrow style. Technical rows also show reading time. Rows highlight on hover with `--wash`.
- Grouped by year once there are more than ~8 posts.

**Technical post**
- Column of about 68ch, body 17–18px, line-height about 1.7. Headings use the hero’s light weight and tight tracking at a smaller size.
- Header: `TECHNICAL · 4 DEC 2026 · 7 MIN`, then the title, then the summary as a dek.
- Coral links and blockquote rule. Code in Google Sans Mono on a light tint, with a copy button. Hover `#` anchors on `h2` and `h3`. Markdown footnotes.
- Footer: “Related project → …”, previous and next posts in the same track, Reply by email, then Giscus comments.

**Personal post**: a quieter room in the same house
- Same column and type, but the header shows **only the date** and title: no track label, reading time or summary dek.
- No related project, no code styling needed, no comments by default, and Reply by email only if `replies: true`.
- Previous and next links stay within personal posts.

**Both:** the global footer stays, but the “Good to meet you” contact band is hidden on post pages.

**Site-wide hooks**
- Header nav: Home · **Writing** · Contact · Résumé on desktop and mobile, with a new `pen` icon in `Icon.jsx`.
- Homepage: a **“Recently written”** section after *What I’ve built* showing the latest 3 **technical** posts, with an “All writing →” link. Hidden while there are none.
- Project rows get a small “Read more →” link when a technical post sets `project:` to that project.
- Personal posts never appear on the homepage or project rows. They’re one click away on `/writing`, not hidden, just not in the professional spots.

## 5. Phases

### Phase 0: decide and write (≈ 15 min, plus writing time)
- [ ] Confirm the list page intro wording.
- [ ] Draft the first technical post in `content/writing/` on a branch.

### Phase 1: MVP (≈ 1 session)
- [ ] `scripts/writing.mjs`: load, validate (track, visibility, required fields, unique slugs) and render Markdown with Shiki; reading time.
- [ ] Vite `writingPlugin`: public index plus lazy post bodies; drafts only in dev.
- [ ] `WritingIndex` with the track toggle, `PostPage` with technical and personal layouts, and article CSS in `style.css`.
- [ ] Routing: path matcher, canonical URLs, titles, `noindex` for unlisted, not-found state.
- [ ] Writing link in desktop and mobile nav; `pen` icon.
- [ ] `pages.mjs`: per-post `index.html` (public + unlisted) with meta tags and prerendered body; `/writing/index.html`; sitemap with public posts only.
- [ ] `netlify.toml` `ignore` rule, tested on a branch.
- [ ] One real post published.

### Phase 2: polish (≈ 1 session)
- [ ] Giscus: enable Discussions, configure, add the lazy `<Comments>` component and per-post `comments` flag.
- [ ] RSS: `feed.xml` (everything public) and `technical.xml`, plus `<link rel="alternate">` tags.
- [ ] “Recently written” (technical only) on the homepage; “Read more” on project rows.
- [ ] Heading anchors, code copy button, previous/next within a track, Reply by email.
- [ ] Image pipeline: `sharp` resize to WebP, width and height set, `loading="lazy"`, captions, build fails if a source image is over 2 MB.
- [ ] README section: “How to write a post”, covering frontmatter, visibility and the publish-from-branch habit.

### Phase 3: optional
- [ ] Generated OG image per technical post (title on white with the K monogram) via `satori` + `resvg` at build time.
- [ ] KaTeX for research posts.
- [ ] Tag filter and series grouping (for example, all sql-engine build logs).
- [ ] Free view counts via GoatCounter, if wanted.

## 6. Done means

- `npm run build` writes `dist/writing/index.html`, a page for every public and unlisted post, both RSS feeds and an updated sitemap.
- Drafts appear nowhere in `dist/`. Unlisted posts appear only as their own page, with `noindex`.
- Loading `/writing/<slug>/` directly works, and with JS disabled the article is readable.
- Pasting a public post URL into the LinkedIn Post Inspector or an X card validator shows the right title, description and image.
- Home → Writing → post → Back restores the list’s scroll position and track filter; focus moves to the H1.
- Reduced motion turns off the fades, as it does on existing pages.
- The homepage JS bundle grows by less than about 5 KB gzipped. Giscus loads only when its section scrolls into view.
- A push that only touches `docs/` doesn’t trigger a Netlify deploy.
- Lighthouse scores for accessibility and SEO on a post page are ≥ 95.

## 7. Open questions

1. ❓ Intro wording for `/writing`.
2. ❓ Should the first post launch with Phase 1, or should Phase 1 merge with zero published posts (section hidden until the first)?
3. ❓ Want view counts at all? (Default: no.)
