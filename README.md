# C Kaustubh — portfolio

React + Vite portfolio. White background, aubergine text, coral accents, Google Sans, and hairline-separated rows.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

## Content

- `content/profile.json`: current role, experience, education, and open source contributions.
- `content/projects.md`: five selected projects, parsed by `src/data.js` and shared by the home and Projects pages.
- `content/about.md`: About page.
- `static/resume.pdf`: current résumé. Replaced with the user-supplied résumé on 4 November 2026.

The site lists ASR fairness, UncertaRAG, Qwen CUDA, Rakshak-AI, and LocalLens. Dates and experience are based on the supplied résumé. Project descriptions omit performance comparisons without enough evaluation context.

Netlify runs `npm run build` and publishes `dist/`. The build emits the existing `/about.html`, `/projects.html`, `/contact.html`, and `/resume.html` routes. `/static/resume.pdf` remains valid. Navigation uses Motion for React with 180ms transitions and reduced-motion support.

`rendered/` and `layout/` retain the previous Anna implementation and are not published. `.openai/hosting.json` configures the private review deployment; `netlify.toml` configures Netlify.
