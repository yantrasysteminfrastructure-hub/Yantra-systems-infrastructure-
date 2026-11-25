# Yantra Systems & Infrastructure — Website

Marketing website for **Yantra Systems & Infrastructure** — *Turning Ideas Into Innovation.*
Live: https://yantra-lyart.vercel.app/

Multi-page site built with **Vite + React 18 + TypeScript**, with real-time 3D scenes in
**Three.js / React Three Fiber / Drei**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Requires Node 18+.

## Enquiry form — delivery configuration

The form never shows a fake "submitted" message. How it delivers depends on configuration:

| `VITE_WEB3FORMS_ACCESS_KEY` | Behaviour |
| --- | --- |
| **Set** | "Send Enquiry" posts to [Web3Forms](https://web3forms.com), which emails the enquiry to the inbox the key was created for. A success message is shown only after Web3Forms confirms delivery; failures show an error with WhatsApp / phone / email alternatives. |
| **Not set** (default) | The form still validates, then hands the enquiry to **WhatsApp** (pre-filled message to +91 8977843546) or the visitor's **email app** (pre-filled to yantrasysteminfrastructure@gmail.com). The status message states clearly that the enquiry is only delivered once the visitor presses *Send* there. |

To enable direct delivery:

1. Create a free access key at https://web3forms.com using `yantrasysteminfrastructure@gmail.com`.
2. Locally: copy `.env.example` to `.env` and set `VITE_WEB3FORMS_ACCESS_KEY=...`.
3. On Vercel: *Project → Settings → Environment Variables* → add `VITE_WEB3FORMS_ACCESS_KEY`, then redeploy
   (Vite inlines the value at build time).

The Web3Forms access key is designed to be public (it only allows sending to its own inbox), so it is
safe in client-side code. A hidden honeypot field filters basic bots.

## Pages

| Path | Page |
| --- | --- |
| `/` | Home: service hero, services, delivery times, process, ways to start |
| `/about` | About Us, focus areas, principles, process |
| `/services` | All five services |
| `/services/<slug>` | Service detail: overview, offer, technologies, examples, delivery, contact |
| `/projects` | Smart Parking (delivered), project planner, project-idea library |
| `/contact` | Contact details + enquiry form (`?service=<slug>` pre-selects a service) |
| `/quote` | Request a quote (`?service=<slug>` supported) |

Routing is a small History-API router (`src/lib/router.tsx`, no dependency). `vercel.json` rewrites every
non-file path to `index.html`; other hosts need the same SPA fallback.

Service slugs: `embedded-systems-engineering-projects`, `project-documentation`, `school-projects`,
`website-development`, `mobile-app-development`.

## Reference file attachments

Web3Forms accepts file uploads only on its paid plan. When the plan supports it, set
`VITE_WEB3FORMS_ATTACHMENTS=true` (locally and on Vercel) and the form shows a file field (one PDF / Word /
PowerPoint / text / image file, max 5 MB). Otherwise visitors are asked to share files on WhatsApp or email.

## Project structure

```
src/
  data/content.ts      All copy: services (with delivery days), programmes, branches, project types, process, contact
  data/ideas.ts        Project-idea library (ideas, not completed work, except entries marked built)
  pages/               Home, About, Services, ServiceDetail, Projects, Contact, Quote, NotFound
  components/          Header, Footer, HomeHero, Turnaround, StepsCount, WaysToStart, ServiceCard, PageHero,
                       EnquiryForm, ContactCards, Glow (beams / bokeh / glass tiles), Icons,
                       Domains + IdeaExplorer (planner), ServiceScene (3D viewer), ErrorBoundary
  three/               3D models (lazy-loaded, only on pages that show them)
  guide/               Website guide: tour + on-site chat (answers only from site content)
  lib/router.tsx       Routing + per-page title / description / canonical
  lib/enquiry.ts       Validation and delivery (Web3Forms / WhatsApp / email)
  lib/enquiryBus.ts    Pre-fills the enquiry form from anywhere on the site
  styles/global.css    Design tokens and all new styles
  styles/legacy.css    Styles carried over for the planner, idea explorer, 3D labels and guide
```

## Design system

Night-sky indigo backgrounds, coloured stage lighting, frosted-glass tiles and thin oversized type. Each
service has its own light hue; the brand accent is the logo's orange.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#07061A` | Page background |
| `--accent` | `#FC4728` | Brand accent (sampled from the logo) |
| `--text` / `--muted` | `#F4F2FF` / `#BCB8E3` | Text |

Fonts: Outfit (display), Inter (body), JetBrains Mono (labels). The logo is used unaltered on a white plate.

## Delivery estimates

Documentation 1 day · Embedded & engineering 3 days · School projects 3 days · Websites 10 days · Mobile apps
15 days. Shown everywhere as estimates subject to scope, requirements, approvals and materials. Change them in
`SERVICES` in `src/data/content.ts`.

## Content rules

The site intentionally contains **no** invented projects, clients, testimonials, statistics, prices,
certifications, awards or addresses. "Project examples" on service pages are labelled as examples of what the
service covers. The only project presented as delivered is the Smart Parking school model.

## SEO

Per-page titles, descriptions and canonical URLs (set on navigation), Open Graph / Twitter tags, Organization
JSON-LD, `robots.txt` and a `sitemap.xml` listing every page. If the production domain changes, update
`index.html`, `src/lib/router.tsx`, `public/robots.txt` and `public/sitemap.xml`.
