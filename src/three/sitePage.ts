import * as THREE from 'three';
import { CONTACT, PROCESS, SERVICES } from '../data/content';

/*
 * Canvas renderings of the Yantra website itself, used on the laptop and phone screens in the hero.
 * Each page is drawn once into a tall texture; the device "scrolls" by moving the texture window,
 * so scrolling costs nothing per frame. The fixed site header is a separate overlay texture.
 */

const INK = '#08090B';
const PAPER = '#FAF8F3';
const LIME = '#CDF22B';
const D_MUTED = '#9a9da4';
const D_TEXT = '#e8e6de';
const D_LINE = '#2a2d32';
const D_SURFACE = '#0f1114';
const L_MUTED = '#55585e';
const L_LINE = '#e2dfd6';
const DISPLAY = '"Space Grotesk", Inter, system-ui, sans-serif';
const BODY = 'Inter, system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
/** Keeps tall pages inside the texture size every WebGL device supports. */
const MAX_TEX = 4096;

export type SiteKind = 'desktop' | 'mobile';

let assets: Promise<HTMLImageElement | null> | null = null;
/** Waits (briefly) for the web fonts and the logo so the canvas text matches the real site. */
function loadAssets() {
  if (!assets) {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const fonts = document.fonts
      ? Promise.all(
          [`700 40px ${DISPLAY}`, `600 40px ${DISPLAY}`, `400 16px ${BODY}`, `500 16px ${BODY}`, `600 16px ${BODY}`, `500 12px ${MONO}`].map((f) =>
            document.fonts.load(f).catch(() => []),
          ),
        )
      : Promise.resolve();
    const logo = new Promise<HTMLImageElement | null>((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = `${import.meta.env.BASE_URL}logo.png`;
    });
    assets = Promise.all([Promise.race([fonts, wait(2500)]), logo]).then(([, l]) => l);
  }
  return assets;
}

/** Small 2D painter working in logical (CSS) pixels. */
class Painter {
  g: CanvasRenderingContext2D;
  constructor(
    public canvas: HTMLCanvasElement,
    public s: number,
  ) {
    this.g = canvas.getContext('2d')!;
    this.reset();
  }
  reset() {
    this.g.setTransform(this.s, 0, 0, this.s, 0, 0);
  }
  rect(x: number, y: number, w: number, h: number, fill: string) {
    this.g.fillStyle = fill;
    this.g.fillRect(x, y, w, h);
  }
  rr(x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, lw = 1) {
    const g = this.g;
    g.beginPath();
    g.roundRect(x, y, w, h, r);
    if (fill) {
      g.fillStyle = fill;
      g.fill();
    }
    if (stroke) {
      g.strokeStyle = stroke;
      g.lineWidth = lw;
      g.stroke();
    }
  }
  circle(x: number, y: number, r: number, fill: string) {
    this.g.fillStyle = fill;
    this.g.beginPath();
    this.g.arc(x, y, r, 0, Math.PI * 2);
    this.g.fill();
  }
  font(f: string, ls = 0) {
    this.g.font = f;
    (this.g as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
  }
  measure(str: string, f: string, ls = 0) {
    this.font(f, ls);
    return this.g.measureText(str).width;
  }
  text(str: string, x: number, y: number, f: string, color: string, ls = 0, align: CanvasTextAlign = 'left') {
    this.font(f, ls);
    this.g.fillStyle = color;
    this.g.textAlign = align;
    this.g.fillText(str, x, y);
    this.g.textAlign = 'left';
  }
  /** Word-wraps a paragraph; returns the baseline after the last line. */
  wrap(str: string, x: number, y: number, maxW: number, lh: number, f: string, color: string, maxLines = 99) {
    this.font(f);
    this.g.fillStyle = color;
    const words = str.split(' ');
    let line = '';
    let n = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (this.g.measureText(test).width > maxW && line) {
        if (n === maxLines - 1) {
          this.g.fillText(`${line}…`, x, y + n * lh);
          return y + (n + 1) * lh;
        }
        this.g.fillText(line, x, y + n * lh);
        n++;
        line = words[i];
      } else line = test;
    }
    this.g.fillText(line, x, y + n * lh);
    return y + (n + 1) * lh;
  }
}

/* ---------------------------- shared pieces ---------------------------- */

function logoPlate(p: Painter, logo: HTMLImageElement | null, x: number, y: number, h: number) {
  const pad = h * 0.14;
  const lh = h - pad * 2;
  const lw = logo ? (logo.width / logo.height) * lh : lh * 2.9;
  p.rr(x, y, lw + pad * 2, h, h * 0.18, '#ffffff');
  if (logo) p.g.drawImage(logo, x + pad, y + pad, lw, lh);
  else p.text('YANTRA', x + pad, y + h * 0.62, `700 ${lh * 0.5}px ${DISPLAY}`, INK);
  return lw + pad * 2;
}

function eyebrowDark(p: Painter, x: number, y: number, label: string, size: number) {
  p.circle(x + 5, y - size * 0.35, 5, LIME);
  p.text(label, x + 20, y, `500 ${size}px ${MONO}`, D_MUTED, size * 0.22);
}

function eyebrowNum(p: Painter, x: number, y: number, num: string, label: string, dark: boolean, size = 12) {
  const w = p.measure(num, `500 ${size}px ${MONO}`) + 14;
  p.rr(x, y - size - 5, w, size + 12, 6, dark ? LIME : INK);
  p.text(num, x + 7, y, `500 ${size}px ${MONO}`, dark ? INK : LIME);
  p.text(label.toUpperCase(), x + w + 12, y, `500 ${size}px ${MONO}`, dark ? D_MUTED : L_MUTED, size * 0.16);
}

/** Heading where one word gets the site's lime highlighter or lime colour. */
function heading(
  p: Painter,
  lines: { text: string; accent?: string }[],
  x: number,
  y: number,
  size: number,
  dark: boolean,
) {
  const f = `600 ${size}px ${DISPLAY}`;
  const ls = -size * 0.03;
  lines.forEach((l, i) => {
    const by = y + i * size * 1.06;
    let cx = x;
    const parts = l.accent ? l.text.split(l.accent) : [l.text];
    parts.forEach((part, j) => {
      if (part) {
        p.text(part, cx, by, f, dark ? PAPER : INK, ls);
        cx += p.measure(part, f, ls);
      }
      if (l.accent && j < parts.length - 1) {
        const w = p.measure(l.accent, f, ls);
        if (dark) p.text(l.accent, cx, by, f, LIME, ls);
        else {
          p.rect(cx - 2, by - size * 0.36, w + 4, size * 0.42, LIME);
          p.text(l.accent, cx, by, f, INK, ls);
        }
        cx += w;
      }
    });
  });
  return y + (lines.length - 1) * size * 1.06;
}

function pill(p: Painter, x: number, y: number, w: number, h: number, label: string, kind: 'lime' | 'ghost' | 'dark', size: number, arrow = false) {
  const fill = kind === 'lime' ? LIME : kind === 'dark' ? INK : undefined;
  p.rr(x, y, w, h, h / 2, fill, kind === 'ghost' ? '#3a3d43' : undefined, 1.5);
  const color = kind === 'lime' ? INK : PAPER;
  const f = `600 ${size}px ${BODY}`;
  const tw = p.measure(label, f) + (arrow ? size * 1.5 : 0);
  const tx = x + (w - tw) / 2;
  p.text(label, tx, y + h / 2 + size * 0.36, f, color);
  if (arrow) {
    const ax = tx + tw - size * 0.8;
    const ay = y + h / 2;
    const g = p.g;
    g.strokeStyle = color;
    g.lineWidth = 2;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(ax - size * 0.4, ay);
    g.lineTo(ax + size * 0.4, ay);
    g.moveTo(ax, ay - size * 0.4);
    g.lineTo(ax + size * 0.4, ay);
    g.lineTo(ax, ay + size * 0.4);
    g.stroke();
  }
}

function capsPill(p: Painter, x: number, y: number, label: string, size: number) {
  const f = `500 ${size}px ${MONO}`;
  const w = p.measure(label, f, size * 0.06) + size * 2.2;
  const h = size * 2.6;
  p.rr(x, y, w, h, h / 2, 'rgba(8,9,11,0.55)', D_LINE);
  p.text(label, x + size * 1.1, y + h / 2 + size * 0.36, f, D_MUTED, size * 0.06);
  return w;
}

function gridBg(p: Painter, x: number, y: number, w: number, h: number, step: number) {
  const g = p.g;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.strokeStyle = 'rgba(255,255,255,0.045)';
  g.lineWidth = 1;
  for (let gx = x; gx <= x + w; gx += step) {
    g.beginPath();
    g.moveTo(gx, y);
    g.lineTo(gx, y + h);
    g.stroke();
  }
  for (let gy = y; gy <= y + h; gy += step) {
    g.beginPath();
    g.moveTo(x, gy);
    g.lineTo(x + w, gy);
    g.stroke();
  }
  const glow = g.createRadialGradient(x + w * 0.75, y + h * 0.35, 0, x + w * 0.75, y + h * 0.35, w * 0.55);
  glow.addColorStop(0, 'rgba(205,242,43,0.10)');
  glow.addColorStop(1, 'rgba(205,242,43,0)');
  g.fillStyle = glow;
  g.fillRect(x, y, w, h);
  g.restore();
}

/** Isometric dev-board illustration, like the 3D board in the real hero. */
function isoBoard(p: Painter, cx: number, cy: number, k: number) {
  const g = p.g;
  const iso = (oy: number) => g.setTransform(p.s * 0.866 * k, p.s * 0.5 * k, -p.s * 0.866 * k, p.s * 0.5 * k, p.s * cx, p.s * (cy + oy));
  iso(12 * k);
  g.fillStyle = '#050607';
  g.beginPath();
  g.roundRect(-150, -90, 300, 180, 10);
  g.fill();
  iso(0);
  g.fillStyle = '#16191d';
  g.beginPath();
  g.roundRect(-150, -90, 300, 180, 10);
  g.fill();
  g.strokeStyle = 'rgba(205,242,43,0.18)';
  g.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    g.moveTo(-110, -50 + i * 15);
    g.lineTo(-40, -50 + i * 15);
    g.lineTo(-25, -35 + i * 12);
    g.lineTo(40, -35 + i * 12);
    g.stroke();
  }
  g.fillStyle = '#b89b52';
  for (let x = -130; x <= 130; x += 14) {
    g.fillRect(x - 3, -80, 6, 6);
    g.fillRect(x - 3, 74, 6, 6);
  }
  g.fillStyle = '#c9ccd1';
  g.fillRect(50, -55, 90, 110);
  g.fillStyle = '#aeb2b8';
  g.fillRect(58, -47, 74, 70);
  g.strokeStyle = LIME;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(60, 38);
  for (let i = 0; i < 6; i++) g.lineTo(66 + i * 12, i % 2 ? 38 : 48);
  g.stroke();
  g.fillStyle = '#0b0c0e';
  g.fillRect(-45, -25, 50, 50);
  g.fillStyle = '#d4d6da';
  g.fillRect(-165, -20, 26, 40);
  const glow = g.createRadialGradient(-100, 40, 0, -100, 40, 26);
  glow.addColorStop(0, 'rgba(205,242,43,0.9)');
  glow.addColorStop(1, 'rgba(205,242,43,0)');
  g.fillStyle = glow;
  g.fillRect(-130, 10, 60, 60);
  p.reset();
}

/** Three exploded layers (enclosure, board, cover), like the About illustration. */
function isoLayers(p: Painter, cx: number, cy: number, k: number) {
  const g = p.g;
  const layers: [number, string, string | null][] = [
    [90, '#17191d', null],
    [10, '#1e2226', LIME],
    [-70, 'rgba(205,242,43,0.12)', LIME],
  ];
  layers.forEach(([oy, fill, stroke]) => {
    g.setTransform(p.s * 0.866 * k, p.s * 0.5 * k, -p.s * 0.866 * k, p.s * 0.5 * k, p.s * cx, p.s * (cy + oy * k));
    g.fillStyle = fill;
    g.beginPath();
    g.roundRect(-120, -80, 240, 160, 12);
    g.fill();
    if (stroke) {
      g.strokeStyle = stroke;
      g.lineWidth = 1.5;
      g.stroke();
    }
    if (oy === 10) {
      g.fillStyle = '#c9ccd1';
      g.fillRect(20, -40, 70, 80);
      g.fillStyle = '#0b0c0e';
      g.fillRect(-60, -20, 40, 40);
    }
  });
  p.reset();
  g.strokeStyle = 'rgba(8,9,11,0.25)';
  g.setLineDash([4, 6]);
  g.beginPath();
  g.moveTo(cx, cy - 70 * k);
  g.lineTo(cx, cy + 90 * k);
  g.stroke();
  g.setLineDash([]);
}

/** Small isometric building used in the Domains viewer preview. */
function isoBuilding(p: Painter, cx: number, cy: number, k: number) {
  const g = p.g;
  for (let f = 0; f < 5; f++) {
    const y = cy - f * 34 * k;
    g.setTransform(p.s * 0.866 * k, p.s * 0.5 * k, -p.s * 0.866 * k, p.s * 0.5 * k, p.s * cx, p.s * y);
    g.fillStyle = f === 4 ? '#dcd9d2' : 'rgba(143,163,173,0.35)';
    g.fillRect(-70, -45, 140, 90);
    g.strokeStyle = '#bdb9b1';
    g.lineWidth = 2;
    g.strokeRect(-70, -45, 140, 90);
  }
  p.reset();
  g.strokeStyle = LIME;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(cx + 130 * k, cy + 20 * k);
  g.lineTo(cx + 130 * k, cy - 210 * k);
  g.lineTo(cx - 60 * k, cy - 210 * k);
  g.stroke();
}

const ICONS: Record<string, (g: CanvasRenderingContext2D) => void> = {
  embedded: (g) => {
    g.strokeRect(-8, -8, 16, 16);
    for (let i = -4; i <= 4; i += 4) {
      g.beginPath();
      g.moveTo(i, -8);
      g.lineTo(i, -13);
      g.moveTo(i, 8);
      g.lineTo(i, 13);
      g.moveTo(-8, i);
      g.lineTo(-13, i);
      g.moveTo(8, i);
      g.lineTo(13, i);
      g.stroke();
    }
  },
  btech: (g) => {
    g.beginPath();
    g.moveTo(-13, -3);
    g.lineTo(0, -10);
    g.lineTo(13, -3);
    g.lineTo(0, 4);
    g.closePath();
    g.moveTo(-7, 1);
    g.lineTo(-7, 8);
    g.quadraticCurveTo(0, 12, 7, 8);
    g.lineTo(7, 1);
    g.stroke();
  },
  degree: (g) => {
    g.beginPath();
    g.moveTo(-12, -9);
    g.lineTo(-1, -6);
    g.lineTo(-1, 11);
    g.lineTo(-12, 8);
    g.closePath();
    g.moveTo(12, -9);
    g.lineTo(1, -6);
    g.lineTo(1, 11);
    g.lineTo(12, 8);
    g.closePath();
    g.stroke();
  },
  docs: (g) => {
    g.strokeRect(-9, -12, 18, 24);
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(-5, -5 + i * 6);
      g.lineTo(5, -5 + i * 6);
      g.stroke();
    }
  },
  webapp: (g) => {
    g.beginPath();
    g.moveTo(-5, -8);
    g.lineTo(-12, 0);
    g.lineTo(-5, 8);
    g.moveTo(5, -8);
    g.lineTo(12, 0);
    g.lineTo(5, 8);
    g.moveTo(2, -11);
    g.lineTo(-2, 11);
    g.stroke();
  },
  civil: (g) => {
    g.strokeRect(-11, -4, 9, 16);
    g.strokeRect(-2, -12, 13, 24);
    g.beginPath();
    g.moveTo(2, -7);
    g.lineTo(7, -7);
    g.moveTo(2, -2);
    g.lineTo(7, -2);
    g.moveTo(2, 3);
    g.lineTo(7, 3);
    g.stroke();
  },
};

function serviceIcon(p: Painter, kind: string, x: number, y: number, size: number) {
  p.rr(x, y, size, size, size * 0.28, INK);
  const g = p.g;
  g.save();
  g.translate(x + size / 2, y + size / 2);
  g.scale(size / 44, size / 44);
  g.strokeStyle = LIME;
  g.lineWidth = 1.8;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  ICONS[kind]?.(g);
  g.restore();
}

function field(p: Painter, x: number, y: number, w: number, h: number, label: string, size: number) {
  p.text(label.toUpperCase(), x, y - 10, `500 ${size * 0.78}px ${MONO}`, D_MUTED, 1);
  p.rr(x, y, w, h, 12, '#14171b', D_LINE);
}

/* -------------------------------- pages -------------------------------- */

const CAPS = ['EMBEDDED SYSTEMS & IOT', 'B.TECH & DEGREE PROJECTS', 'PROJECT DOCUMENTATION', 'WEB & MOBILE APPS', 'CIVIL WORKS'];
const LEAD =
  'From embedded systems and academic engineering projects to software development and infrastructure solutions, Yantra transforms technical ideas into practical outcomes.';
const ABOUT =
  'Yantra Systems & Infrastructure works across engineering, technology, academic project development, software solutions, and infrastructure-related services. We help turn concepts into practical implementations through technical expertise and structured execution.';
const CONTACT_LEAD = 'Tell us about your requirement. Our team will connect with you to understand your needs and discuss the next steps.';

interface Layout {
  w: number;
  h: number;
  /** Top of each nav section: Home, About, Services, Domains, Contact. */
  sections: number[];
  draw(p: Painter, logo: HTMLImageElement | null): void;
}

const DESKTOP: Layout = (() => {
  const W = 1280;
  const X0 = 96;
  const X1 = 1184;
  const CW = X1 - X0;
  const Y = { about: 800, services: 1400, domains: 2180, process: 2900, contact: 3400, footer: 3980, end: 4080 };
  return {
    w: W,
    h: Y.end,
    sections: [0, Y.about, Y.services, Y.domains, Y.contact],
    draw(p, logo) {
      /* hero */
      p.rect(0, 0, W, Y.about, INK);
      gridBg(p, 0, 0, W, Y.about, 64);
      eyebrowDark(p, X0, 196, 'YANTRA SYSTEMS & INFRASTRUCTURE', 13);
      const hf = `700 86px ${DISPLAY}`;
      const hls = -3.4;
      p.text('ENGINEERING', X0 - 4, 300, hf, PAPER, hls);
      p.text('IDEAS', X0 - 4, 382, hf, LIME, hls);
      p.text(' INTO', X0 - 4 + p.measure('IDEAS', hf, hls), 382, hf, PAPER, hls);
      p.text('REALITY.', X0 - 4, 464, hf, LIME, hls);
      const ly = p.wrap(LEAD, X0, 528, 540, 29, `400 18px ${BODY}`, D_MUTED);
      pill(p, X0, ly + 14, 236, 56, 'Explore Our Services', 'lime', 16, true);
      pill(p, X0 + 250, ly + 14, 196, 56, 'Contact Our Team', 'ghost', 16);
      isoBoard(p, 900, 410, 1.05);
      let cx = X0;
      CAPS.forEach((c) => (cx += capsPill(p, cx, 716, c, 11) + 8));

      /* about */
      p.rect(0, Y.about, W, Y.services - Y.about, PAPER);
      eyebrowNum(p, X0, Y.about + 120, '01', 'About Yantra', false);
      heading(p, [{ text: 'Engineering with' }, { text: 'purpose.', accent: 'purpose.' }], X0, Y.about + 200, 60, false);
      p.wrap(ABOUT, X0, Y.about + 330, 500, 29, `400 18px ${BODY}`, L_MUTED);
      isoLayers(p, 900, Y.about + 300, 1.05);

      /* services */
      p.rect(0, Y.services, W, Y.domains - Y.services, '#f4f2ec');
      p.rect(0, Y.services, W, 1, L_LINE);
      eyebrowNum(p, X0, Y.services + 110, '02', 'Services', false);
      heading(p, [{ text: 'What we engineer.', accent: 'engineer.' }], X0, Y.services + 186, 60, false);
      p.wrap('Six focused areas across electronics, academic engineering projects, software and infrastructure.', 820, Y.services + 160, 364, 25, `400 16px ${BODY}`, L_MUTED);
      const cw = (CW - 40) / 3;
      SERVICES.forEach((s, i) => {
        const x = X0 + (i % 3) * (cw + 20);
        const y = Y.services + 250 + Math.floor(i / 3) * 250;
        p.rr(x, y, cw, 230, 20, '#ffffff', L_LINE);
        serviceIcon(p, s.visual, x + 26, y + 26, 48);
        p.text(s.num, x + cw - 26, y + 44, `500 12px ${MONO}`, '#8a8d93', 1, 'right');
        p.text(s.title, x + 26, y + 118, `600 21px ${DISPLAY}`, INK, -0.4);
        p.wrap(s.description, x + 26, y + 150, cw - 52, 22, `400 14.5px ${BODY}`, L_MUTED, 3);
      });

      /* domains */
      p.rect(0, Y.domains, W, Y.process - Y.domains, PAPER);
      p.rect(0, Y.domains, W, 1, L_LINE);
      eyebrowNum(p, X0, Y.domains + 110, '03', 'Industries / Domains', false);
      heading(p, [{ text: 'Across engineering disciplines.', accent: 'disciplines.' }], X0, Y.domains + 186, 60, false);
      const sy = Y.domains + 250;
      p.rr(X0, sy, 400, 50, 25, '#ffffff', L_LINE);
      ['B.Tech', 'Degree', 'MBA', 'School'].forEach((l, i) => {
        if (i === 0) p.rr(X0 + 4, sy + 4, 96, 42, 21, INK);
        p.text(l, X0 + 52 + i * 100, sy + 31, `600 15px ${BODY}`, i === 0 ? PAPER : L_MUTED, 0, 'center');
      });
      [
        ['CSE', 'Computer Science & Engineering'],
        ['ECE', 'Electronics & Communication'],
        ['EEE', 'Electrical & Electronics'],
        ['MECH', 'Mechanical Engineering'],
        ['CIVIL', 'Civil Engineering'],
      ].forEach(([code, name], i) => {
        const y = sy + 76 + i * 66;
        const on = code === 'CIVIL';
        p.rr(X0, y, 400, 56, 14, '#ffffff', on ? INK : L_LINE, on ? 2 : 1);
        p.text(code, X0 + 20, y + 34, `500 12px ${MONO}`, on ? INK : '#8a8d93', 1);
        p.text(name, X0 + 92, y + 34, `500 15.5px ${BODY}`, INK);
      });
      p.rr(540, sy, X1 - 540, 450, 24, INK);
      gridBg(p, 540, sy, X1 - 540, 450, 32);
      isoBuilding(p, 860, sy + 300, 1);
      p.text('B.TECH · CIVIL', 568, sy + 40, `500 12px ${MONO}`, D_TEXT, 1.4);
      p.text('DRAG TO ROTATE', X1 - 28, sy + 40, `500 12px ${MONO}`, D_MUTED, 1.4, 'right');
      p.circle(574, sy + 418, 4, LIME);
      p.text('Civil · structure & site plan', 588, sy + 423, `500 13px ${BODY}`, D_TEXT);

      /* process */
      p.rect(0, Y.process, W, Y.contact - Y.process, INK);
      eyebrowNum(p, X0, Y.process + 110, '04', 'Process', true);
      heading(p, [{ text: 'From concept to' }, { text: 'implementation.', accent: 'implementation.' }], X0, Y.process + 186, 60, true);
      const stepW = CW / PROCESS.length;
      p.rect(X0 + 22, Y.process + 340, CW - 44, 1, D_LINE);
      PROCESS.forEach((s, i) => {
        const x = X0 + i * stepW;
        p.rr(x, Y.process + 318, 44, 44, 22, i === 0 ? LIME : INK, i === 0 ? undefined : '#3a3d43', 1.5);
        p.text(s.num, x + 22, Y.process + 345, `500 13px ${MONO}`, i === 0 ? INK : LIME, 0, 'center');
        p.text(s.title, x, Y.process + 400, `600 21px ${DISPLAY}`, PAPER, -0.4);
        p.wrap(s.text, x, Y.process + 430, stepW - 30, 22, `400 14px ${BODY}`, D_MUTED, 3);
      });

      /* contact */
      p.rect(0, Y.contact, W, Y.footer - Y.contact, '#0b0c0f');
      p.rect(0, Y.contact, W, 1, D_LINE);
      eyebrowNum(p, X0, Y.contact + 110, '06', 'Project Enquiry', true);
      heading(p, [{ text: 'Have an idea?' }, { text: 'Let’s engineer it.', accent: 'Let’s engineer it.' }], X0, Y.contact + 186, 56, true);
      p.wrap(CONTACT_LEAD, X0, Y.contact + 290, 440, 27, `400 17px ${BODY}`, D_MUTED);
      [
        ['PHONE', CONTACT.phoneDisplay],
        ['EMAIL', CONTACT.email],
        ['WHATSAPP', 'Chat with our team'],
      ].forEach(([k, v], i) => {
        const y = Y.contact + 370 + i * 74;
        p.rr(X0, y, 460, 62, 16, D_SURFACE, D_LINE);
        p.text(k, X0 + 20, y + 26, `500 11px ${MONO}`, D_MUTED, 1.2);
        p.text(v, X0 + 20, y + 47, `500 15px ${BODY}`, D_TEXT);
      });
      const fx = 640;
      const fw = X1 - fx;
      p.rr(fx, Y.contact + 70, fw, 500, 24, D_SURFACE, D_LINE);
      const iw = (fw - 80) / 2;
      field(p, fx + 32, Y.contact + 130, iw, 50, 'Name', 14);
      field(p, fx + 48 + iw, Y.contact + 130, iw, 50, 'Phone', 14);
      field(p, fx + 32, Y.contact + 220, fw - 64, 50, 'Email', 14);
      field(p, fx + 32, Y.contact + 310, fw - 64, 50, 'Service', 14);
      p.text('B.Tech Project', fx + 50, Y.contact + 341, `400 15px ${BODY}`, D_TEXT);
      field(p, fx + 32, Y.contact + 400, fw - 64, 80, 'Message', 14);
      pill(p, fx + 32, Y.contact + 500, 200, 50, 'Send Enquiry', 'lime', 15, true);

      /* footer */
      p.rect(0, Y.footer, W, Y.end - Y.footer, INK);
      p.rect(0, Y.footer, W, 1, D_LINE);
      logoPlate(p, logo, X0, Y.footer + 26, 50);
      p.text('Turning Ideas Into Innovation.', 300, Y.footer + 57, `500 15px ${BODY}`, D_MUTED);
      p.text(`© ${new Date().getFullYear()} Yantra Systems & Infrastructure`, X1, Y.footer + 57, `400 13px ${BODY}`, '#6b6f76', 0, 'right');
    },
  };
})();

const MOBILE: Layout = (() => {
  const W = 390;
  const X0 = 20;
  const CW = W - X0 * 2;
  const Y = { about: 960, services: 1380, contact: 2330, footer: 2780, end: 2870 };
  return {
    w: W,
    h: Y.end,
    sections: [0, Y.about, Y.services, Y.services + 900, Y.contact],
    draw(p, logo) {
      /* hero (the status bar and header sit on top as an overlay) */
      p.rect(0, 0, W, Y.about, INK);
      gridBg(p, 0, 0, W, Y.about, 48);
      eyebrowDark(p, X0, 150, 'YANTRA SYSTEMS & INFRASTRUCTURE', 10);
      const hf = `700 47px ${DISPLAY}`;
      const hls = -1.9;
      p.text('ENGINEERING', X0 - 2, 212, hf, PAPER, hls);
      p.text('IDEAS', X0 - 2, 256, hf, LIME, hls);
      p.text(' INTO', X0 - 2 + p.measure('IDEAS', hf, hls), 256, hf, PAPER, hls);
      p.text('REALITY.', X0 - 2, 300, hf, LIME, hls);
      const ly = p.wrap(LEAD, X0, 346, CW, 24, `400 15px ${BODY}`, D_MUTED);
      pill(p, X0, ly + 6, CW, 52, 'Explore Our Services', 'lime', 15, true);
      pill(p, X0, ly + 70, CW, 52, 'Contact Our Team', 'ghost', 15);
      isoBoard(p, W / 2, ly + 250, 0.62);
      let cx = X0;
      let cy = ly + 360;
      CAPS.forEach((c) => {
        const w = p.measure(c, `500 9.5px ${MONO}`, 0.6) + 21;
        if (cx + w > W - X0) {
          cx = X0;
          cy += 32;
        }
        cx += capsPill(p, cx, cy, c, 9.5) + 6;
      });

      /* about */
      p.rect(0, Y.about, W, Y.services - Y.about, PAPER);
      eyebrowNum(p, X0, Y.about + 70, '01', 'About Yantra', false, 10.5);
      heading(p, [{ text: 'Engineering with' }, { text: 'purpose.', accent: 'purpose.' }], X0, Y.about + 128, 36, false);
      p.wrap(ABOUT, X0, Y.about + 210, CW, 24, `400 15px ${BODY}`, L_MUTED);

      /* services */
      p.rect(0, Y.services, W, Y.contact - Y.services, '#f4f2ec');
      p.rect(0, Y.services, W, 1, L_LINE);
      eyebrowNum(p, X0, Y.services + 70, '02', 'Services', false, 10.5);
      heading(p, [{ text: 'What we engineer.', accent: 'engineer.' }], X0, Y.services + 128, 34, false);
      SERVICES.forEach((s, i) => {
        const y = Y.services + 170 + i * 124;
        p.rr(X0, y, CW, 112, 16, '#ffffff', L_LINE);
        serviceIcon(p, s.visual, X0 + 16, y + 16, 38);
        p.text(s.num, X0 + CW - 16, y + 30, `500 10.5px ${MONO}`, '#8a8d93', 1, 'right');
        p.text(s.title, X0 + 66, y + 40, `600 16.5px ${DISPLAY}`, INK, -0.3);
        p.wrap(s.description, X0 + 16, y + 74, CW - 32, 19, `400 13px ${BODY}`, L_MUTED, 2);
      });

      /* contact */
      p.rect(0, Y.contact, W, Y.footer - Y.contact, '#0b0c0f');
      eyebrowNum(p, X0, Y.contact + 70, '06', 'Project Enquiry', true, 10.5);
      heading(p, [{ text: 'Have an idea?' }, { text: 'Let’s engineer it.', accent: 'Let’s engineer it.' }], X0, Y.contact + 128, 34, true);
      p.wrap(CONTACT_LEAD, X0, Y.contact + 210, CW, 23, `400 14.5px ${BODY}`, D_MUTED);
      [
        ['PHONE', CONTACT.phoneDisplay],
        ['EMAIL', CONTACT.email],
      ].forEach(([k, v], i) => {
        const y = Y.contact + 290 + i * 66;
        p.rr(X0, y, CW, 56, 14, D_SURFACE, D_LINE);
        p.text(k, X0 + 16, y + 22, `500 9.5px ${MONO}`, D_MUTED, 1.1);
        p.text(v, X0 + 16, y + 42, `500 13.5px ${BODY}`, D_TEXT);
      });

      /* footer */
      p.rect(0, Y.footer, W, Y.end - Y.footer, INK);
      p.rect(0, Y.footer, W, 1, D_LINE);
      logoPlate(p, logo, X0, Y.footer + 22, 40);
      p.text('Turning Ideas Into Innovation.', W - X0, Y.footer + 48, `500 11.5px ${BODY}`, D_MUTED, 0, 'right');
    },
  };
})();

const LAYOUTS: Record<SiteKind, Layout> = { desktop: DESKTOP, mobile: MOBILE };

function makeTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export interface SitePage {
  texture: THREE.CanvasTexture;
  /** Page size in logical pixels. */
  width: number;
  height: number;
  /** Tops of Home / About / Services / Domains / Contact. */
  sections: number[];
  ready: Promise<void>;
  /** Shows the window of the page starting at `top` (logical px), `viewH` tall. */
  scroll(texture: THREE.Texture, top: number, viewH: number): void;
}

/** Full website page as one tall texture. `quality` scales the resolution (lower on phones). */
export function createSitePage(kind: SiteKind, quality = 1): SitePage {
  const L = LAYOUTS[kind];
  const s = Math.min((kind === 'desktop' ? 1 : 1.8) * quality, MAX_TEX / L.h);
  const c = document.createElement('canvas');
  c.width = Math.round(L.w * s);
  c.height = Math.round(L.h * s);
  const p = new Painter(c, s);
  p.rect(0, 0, L.w, L.h, INK);
  const texture = makeTexture(c);
  const ready = loadAssets().then((logo) => {
    p.reset();
    L.draw(p, logo);
    texture.needsUpdate = true;
  });
  return {
    texture,
    width: L.w,
    height: L.h,
    sections: L.sections,
    ready,
    scroll(t, top, viewH) {
      const r = Math.min(1, viewH / L.h);
      const y = Math.max(0, Math.min(L.h - viewH, top));
      t.repeat.set(1, r);
      t.offset.set(0, 1 - r - y / L.h);
    },
  };
}

export interface SiteHeader {
  texture: THREE.CanvasTexture;
  /** Logical size. */
  width: number;
  height: number;
  ready: Promise<void>;
  /** Highlights a nav item (scroll spy), redrawing only when it changes. */
  setActive(i: number): void;
}

const NAV = ['Home', 'About', 'Services', 'Domains', 'Contact'];

/** The site's fixed header. On mobile it includes the phone status bar. */
export function createSiteHeader(kind: SiteKind, quality = 1): SiteHeader {
  const desktop = kind === 'desktop';
  const w = desktop ? 1280 : 390;
  const h = desktop ? 88 : 108;
  const s = (desktop ? 1 : 1.8) * quality;
  const c = document.createElement('canvas');
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  const p = new Painter(c, s);
  const texture = makeTexture(c);
  let logo: HTMLImageElement | null = null;
  let active = -1;
  let loaded = false;

  const draw = () => {
    p.reset();
    p.g.clearRect(0, 0, w, h);
    p.rect(0, 0, w, h, 'rgba(8,9,11,0.88)');
    p.rect(0, h - 1, w, 1, 'rgba(255,255,255,0.08)');
    if (desktop) {
      logoPlate(p, logo, 96, 12, 64);
      let x = 640;
      NAV.forEach((n, i) => {
        const f = `500 15px ${BODY}`;
        p.text(n, x, 50, f, i === active ? '#ffffff' : '#a9acb2');
        const nw = p.measure(n, f);
        if (i === active) p.circle(x + nw / 2, 64, 2.5, LIME);
        x += nw + 34;
      });
      pill(p, 1184 - 236, 20, 236, 48, 'Let’s Discuss Your Project', 'lime', 14);
    } else {
      // status bar
      const f = `600 14px ${BODY}`;
      p.text('10:30', 34, 30, f, '#ffffff');
      for (let i = 0; i < 4; i++) p.rr(300 + i * 5, 26 - i * 3, 3.2, 4 + i * 3, 1, '#ffffff');
      p.g.strokeStyle = '#ffffff';
      p.g.lineWidth = 1.8;
      p.g.beginPath();
      p.g.arc(332, 29, 8, Math.PI * 1.25, Math.PI * 1.75);
      p.g.stroke();
      p.g.beginPath();
      p.g.arc(332, 29, 4, Math.PI * 1.25, Math.PI * 1.75);
      p.g.stroke();
      p.rr(344, 19, 24, 12, 3.5, undefined, 'rgba(255,255,255,0.5)', 1);
      p.rr(346, 21, 17, 8, 2, '#ffffff');
      // header
      logoPlate(p, logo, 16, 52, 46);
      p.rr(w - 62, 53, 44, 44, 22, undefined, '#3a3d43', 1.2);
      p.rect(w - 50, 70, 20, 2, PAPER);
      p.rect(w - 50, 78, 14, 2, PAPER);
    }
    texture.needsUpdate = true;
  };
  draw();
  const ready = loadAssets().then((l) => {
    logo = l;
    loaded = true;
    draw();
  });
  return {
    texture,
    width: w,
    height: h,
    ready,
    setActive(i) {
      if (i === active) return;
      active = i;
      if (loaded) draw();
    },
  };
}

/** Browser window bar with the site's address. */
export function createBrowserBar(quality = 1): { texture: THREE.CanvasTexture; width: number; height: number } {
  const w = 1280;
  const h = 46;
  const s = quality;
  const c = document.createElement('canvas');
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  const p = new Painter(c, s);
  p.rect(0, 0, w, h, '#1c1e22');
  p.rect(0, h - 1, w, 1, '#2c2f34');
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => p.circle(22 + i * 18, h / 2, 5.5, col));
  const g = p.g;
  g.strokeStyle = '#8a8d93';
  g.lineWidth = 1.8;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(104, h / 2 - 6);
  g.lineTo(98, h / 2);
  g.lineTo(104, h / 2 + 6);
  g.moveTo(124, h / 2 - 6);
  g.lineTo(130, h / 2);
  g.lineTo(124, h / 2 + 6);
  g.stroke();
  const ax = 400;
  p.rr(ax, 9, 480, 28, 14, '#2a2d32');
  // lock
  p.rr(ax + 16, h / 2 - 2, 9, 7, 1.5, '#a9acb2');
  g.strokeStyle = '#a9acb2';
  g.lineWidth = 1.4;
  g.beginPath();
  g.arc(ax + 20.5, h / 2 - 2, 3, Math.PI, 0);
  g.stroke();
  p.text('yantra-lyart.vercel.app', ax + 240, h / 2 + 5, `500 13px ${BODY}`, '#d7d9dd', 0, 'center');
  const texture = makeTexture(c);
  loadAssets().then(() => {
    p.reset();
    p.rr(ax, 9, 480, 28, 14, '#2a2d32');
    p.rr(ax + 16, h / 2 - 2, 9, 7, 1.5, '#a9acb2');
    g.beginPath();
    g.arc(ax + 20.5, h / 2 - 2, 3, Math.PI, 0);
    g.stroke();
    p.text('yantra-lyart.vercel.app', ax + 240, h / 2 + 5, `500 13px ${BODY}`, '#d7d9dd', 0, 'center');
    texture.needsUpdate = true;
  });
  return { texture, width: w, height: h };
}
