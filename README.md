# E-BIZ Technics — Corporate Website

**Secure. Smart. Scalable.** The website of E-BIZ Technics, a Sri Lankan IT solutions and consulting company (cybersecurity, software engineering, and data science, analytics & AI). A fully static, multi-page company website built with HTML5, CSS3 and vanilla JavaScript. There's no build step, backend or framework, so it's ready for GitHub Pages as-is.

## Features

- **7 pages:** Home, About, Services, Solutions/Industries, Careers, Contact, and a custom 404
- **Dark/light theme** toggle that remembers each visitor's choice
- **Animations:** preloader, animated hero (particle network, floating cards, typing text, gradient orbs, moving grid), scroll reveals, animated counters, logo marquee, cursor spotlight on cards, 3D image tilt, testimonial carousel (auto-play, swipe, keyboard), animated timeline, scroll progress bar, back-to-top progress ring
- All motion is turned off for visitors who set *prefers-reduced-motion*
- **Contact form** with live validation, a spam honeypot, Formspree support and an animated success state. Links like `contact.html?service=networking` open the form with that service already selected
- **Business hours** that highlight today and show an "Open now / Closed" badge in Sri Lanka time
- **Accessibility:** semantic HTML, skip link, ARIA on the menu, tabs, accordions and carousel, visible focus states, full keyboard support
- **SEO:** unique titles and descriptions, Open Graph and Twitter cards, canonical URLs, JSON-LD Organization schema, `sitemap.xml`, `robots.txt`
- **Offline support:** a service worker caches the site after the first visit (it only runs on HTTPS)
- **Image fallback:** if a remote image fails to load, an on-brand gradient appears in its place

## File structure

```
├── index.html          Home
├── about.html          About us (story, mission, values, timeline, team, certifications)
├── services.html       Three service areas in detail + support & maintenance
├── solutions.html      Industries (tabs) + packaged solutions
├── careers.html        Culture, benefits, open roles
├── contact.html        Form, details, hours, map, FAQ
├── 404.html            Custom "page not found"
├── css/styles.css      All styles (design tokens at the top)
├── js/main.js          All interactivity (one file, modular functions)
├── assets/             favicon.svg, apple-touch-icon.png, icon-512.png, og-image.png
├── sw.js               Service worker (offline cache)
├── site.webmanifest    PWA manifest
├── sitemap.xml / robots.txt
└── .nojekyll           Tells GitHub Pages to serve files as-is
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub (for example `ebiz-technics`).
2. Upload **the contents of this folder** to the repository root, so that `index.html` sits at the top level:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ebiz-technics.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/ebiz-technics/`.

**Custom domain (optional):** add your domain under Settings → Pages → Custom domain, then create a `CNAME` DNS record pointing to `<your-username>.github.io`.

## Before going live: replace the placeholders

| What | Where |
|---|---|
| Address and phone | Search for `Galle Road` and `+94 11 234 5678` (the site uses `www.ebtech.lk` and `info@ebtech.lk`) |
| **Contact form** | Create a free form at [formspree.io](https://formspree.io), then replace `YOUR_FORM_ID` in `contact.html`. Until you do, the form runs in demo mode (it shows the success screen but doesn't send anything). |
| Map | In `contact.html`, change the `q=` value in the Google Maps iframe, or paste the embed URL from Google Maps → Share → Embed |
| Stats, testimonials, case studies, team, certifications, client logos | These are sample content. Replace them with real names and figures. |
| Social links | Footer `href="#"` links (in every page) |
| Business hours | `contact.html`. Each row's `data-day` uses 0 = Sunday … 6 = Saturday, and `data-hours` is opening–closing time in 24h decimals (for example `8.5-17.5`) |

## Customising

### Colours and fonts
Everything is driven by CSS variables at the top of `css/styles.css`:

```css
:root {
  --navy-900: #0a1628;  /* primary background */
  --cyan: #22d3ee;      /* accent */
  --indigo: #6366f1;    /* secondary */
  --purple: #8b5cf6;
  --emerald: #10b981;   /* trust/success */
}
```
The light theme overrides live in the `[data-theme="light"]` block. To make light mode the default, change `data-theme="dark"` to `data-theme="light"` on the `<html>` tag of each page.

### Images
Images load from Unsplash. To use your own photos, put them in `assets/` and point the `src` attributes at them (for example `src="assets/team.jpg"`). Compressed WebP or JPG at about 1200px wide works best.

### Icons
Icons come from [Lucide](https://lucide.dev/icons). To use one, write `<i data-lucide="icon-name"></i>`. To change an icon, swap the name.

### Header and footer
The header and footer are repeated in every page (plain HTML, so SEO stays simple and nothing has to be built). If you edit one, make the same change in all 7 pages, or use a find-and-replace across files.

### After updating the site
Bump `CACHE_VERSION` in `sw.js` (for example `ebiz-v2`) so returning visitors get the new files.

## Running locally
Any static server works:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Credits
- Fonts: [Inter](https://rsms.me/inter/) and [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)
- Icons: [Lucide](https://lucide.dev) (ISC licence)
- Photos: [Unsplash](https://unsplash.com) (free to use under the Unsplash licence)
