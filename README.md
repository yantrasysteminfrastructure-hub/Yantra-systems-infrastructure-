# Yantra Systems & Infrastructure — Website

Marketing website for **Yantra Systems & Infrastructure** — *Turning Ideas Into Innovation.*
Live: https://yantra-lyart.vercel.app/

Single-page site built with **Vite + React 18 + TypeScript**, with real-time 3D scenes in
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

## Project structure

```
src/
  data/content.ts         All site copy: services, programmes → branches → project types, process, contact details
  components/             Page sections: Header, Hero, About, Services, Domains, Process, Why, Contact, Footer
  components/visuals/     SVG technical illustrations + static fallbacks for devices without WebGL
  three/                  3D scenes (lazy-loaded)
    DevBoard.tsx          ESP32-style development board with sensor module and data pulses
    pcbLayout.ts          Shared board layout (keeps the circuit texture and 3D parts aligned)
    pcbTexture.ts         Procedurally drawn PCB texture: soldermask, copper, ENIG pads, silkscreen
    DomainModels.tsx      Animated branch scenes: workstation (software), relay-motor rig (electrical),
                          gear + crank-slider (mechanical), building under construction (civil)
    SceneCanvas.tsx       Canvas wrapper: lazy mount, offscreen pause, adaptive DPR, WebGL fallback
  lib/enquiry.ts          Form validation and delivery (Web3Forms / WhatsApp / email)
  styles/global.css       Design tokens and all styles
public/                   Logo, favicons, Open Graph image, robots.txt, sitemap.xml, web manifest
brand/                    Original logo source file (not shipped)
```

## Design system

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#08090B` | Dark sections, navigation, hero |
| Paper | `#FAF8F3` | Light sections, logo plate |
| Lime | `#CDF22B` | CTAs, active states, highlights, technical accents |

Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (technical labels) via Google Fonts.

The original logo has dark lettering, so on dark backgrounds it is placed — unaltered — on a light
`#FAF8F3` plate rather than being recoloured.

## Performance & accessibility notes

- Initial JS is ~61 KB gzipped; the 3D bundle (~270 KB gzipped) loads only on devices with WebGL,
  after the page content renders. Without WebGL, static illustrations are shown and the 3D code is never downloaded.
- Canvases mount only near the viewport and stop rendering when scrolled away.
- Resolution adapts down automatically if a device cannot hold a steady frame rate.
- `prefers-reduced-motion` disables idle 3D motion, reveal animations and smooth scrolling.
- Drag-to-rotate is enabled for mouse users only, so touch scrolling is never captured by a 3D scene.
- Semantic landmarks, skip link, keyboard-operable tabs (arrow keys / Home / End), labelled form fields
  with inline errors, and focus management after submit.

## Content rules

The site intentionally contains **no** invented projects, clients, testimonials, statistics,
certifications, awards or addresses. Academic project services are described as guidance and
development support, separate from Yantra's own commercial work. Update `src/data/content.ts`
when real case studies or details become available.

## SEO

Title, meta description, canonical URL, Open Graph / Twitter tags with a 1200×630 share image,
Organization JSON-LD, `robots.txt` and `sitemap.xml`. If the production domain changes, update the URLs
in `index.html`, `public/robots.txt` and `public/sitemap.xml`.
