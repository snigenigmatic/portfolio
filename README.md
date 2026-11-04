# C Kaustubh — portfolio

React + Vite portfolio. A personal introduction and portrait, an interactive view of the questions behind the work, five projects, experience, and open source contributions. White background, aubergine text, coral accents, Google Sans, and hairline-separated rows.

```sh
npm ci
npm run dev
npm run build
npm run preview
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
