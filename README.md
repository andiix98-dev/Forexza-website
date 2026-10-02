# Forexza website

A static website (plain HTML, CSS and JavaScript, so no build step) hosted on Vercel.

## Pages
- `index.html`: Home
- `about.html`: About
- `services.html`: Services
- `contact.html`: Contact and quote request form

## Common edits
- **Email, phone, location and contact form key:** `assets/config.js`
- **Brand colours:** the top of `assets/styles.css` (`--red`, `--grey`)
- **Logo:** add your file as `assets/logo.svg` (or `.png`) and replace the `<svg class="logo-mark">…</svg>` + `FOREXZA` text in each page's header and footer with `<img src="/assets/logo.svg" alt="Forexza">`
- **Spanish text:** `assets/i18n.js`. English text is written directly in the HTML pages.

## Deploy
Vercel → Add New → Project → import this GitHub repo → Framework preset: **Other** → Deploy.
Every push to `main` redeploys automatically.
