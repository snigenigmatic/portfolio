# C Kaustubh — portfolio

A responsive React + Vite portfolio with Motion for React (formerly Framer Motion). Original content remains in `content/`; the project directory is parsed from `content/projects.md` and the About page renders `content/about.md`.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Netlify runs `npm run build` and publishes `dist/`. The build emits the existing `/about.html`, `/projects.html`, `/contact.html`, and `/resume.html` routes, and preserves old `/static/resume.pdf` and portrait links. Replace `static/resume.pdf` to update the résumé.

Design: warm paper, graphite, copper, procedural illustrations, and responsive typography. Motion respects the visitor’s reduced-motion setting. Project filters, mobile navigation, source links, and PDF downloads are keyboard accessible. No backend or API keys required.

`rendered/` and `layout/` are retained as the previous Anna implementation for reference; they are no longer the published build. `.openai/hosting.json` configures the private review deployment; Netlify is configured independently in `netlify.toml`.
