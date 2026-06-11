# Gagan Singh Raut — Cybersecurity Portfolio

Terminal / digital-rain themed portfolio built with React + Vite.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

Static output lands in `dist/` — deploy it anywhere (GitHub Pages, Vercel, Netlify).

## Where to edit

Everything lives in `src/App.jsx`:

- `C` (top of file) — colour palette
- `PROJECTS` — project cards (add/remove/edit objects)
- `SKILLS` — skills grid
- `NAV` — navigation labels
- The boot-sequence lines are in the `Portfolio` component (`bootLines`)
- Experience / education content is inline in the `experience` Window

## Deploy to GitHub Pages (quick option)

1. Push this folder to a GitHub repo
2. In `vite.config.js` add `base: "/<repo-name>/"`
3. `npm run build`, then publish `dist/` (e.g. with the `gh-pages` package or a Pages action)
