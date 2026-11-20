import * as THREE from 'three';

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const SANS = 'Inter, system-ui, sans-serif';

function tex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

type Tok = [string, string];
const K = '#CDF22B'; // keyword (brand lime)
const S = '#e8e6de'; // standard
const D = '#7d8189'; // dim / comment
const N = '#b9c3cf'; // names / strings

const CODE: Tok[][] = [
  [['# telemetry.py  — ESP32 sensor node', D]],
  [['import', K], [' network, time', S]],
  [['from', K], [' machine ', S], ['import', K], [' Pin', S]],
  [['from', K], [' sensors ', S], ['import', K], [' read_climate', S]],
  [],
  [['led', S], [' = ', D], ['Pin', N], ['(2, Pin.OUT)', S]],
  [],
  [['def', K], [' publish', N], ['(reading):', S]],
  [['    payload = {', S], ['"temp"', N], [': reading.t,', S]],
  [['               ', S], ['"hum"', N], [': reading.h}', S]],
  [['    client.send(', S], ['"/telemetry"', N], [', payload)', S]],
  [],
  [['while', K], [' True', K], [':', S]],
  [['    reading = read_climate()', S]],
  [['    publish(reading)', S]],
  [['    led.toggle()', S]],
  [['    time.sleep(', S], ['5', K], [')', S]],
];

/** Code editor screen used on the laptop. */
export function createCodeScreen(w = 1024): THREE.CanvasTexture {
  const h = Math.round(w * 0.64);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const u = w / 1024;
  g.fillStyle = '#0b0d10';
  g.fillRect(0, 0, w, h);
  // title bar
  g.fillStyle = '#121519';
  g.fillRect(0, 0, w, 34 * u);
  ['#3a3d43', '#3a3d43', '#3a3d43'].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc((20 + i * 18) * u, 17 * u, 5 * u, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = D;
  g.font = `500 ${13 * u}px ${MONO}`;
  g.fillText('telemetry.py — firmware', 90 * u, 22 * u);
  // sidebar
  g.fillStyle = '#0f1215';
  g.fillRect(0, 34 * u, 190 * u, h);
  const files = ['▾ firmware', '   main.py', '   telemetry.py', '   sensors.py', '▾ app', '   dashboard.tsx', '   api.ts', '▾ docs', '   report.md'];
  files.forEach((f, i) => {
    if (f.includes('telemetry')) {
      g.fillStyle = 'rgba(205,242,43,0.10)';
      g.fillRect(0, (52 + i * 24) * u, 190 * u, 22 * u);
    }
    g.fillStyle = f.includes('telemetry') ? K : f.startsWith('▾') ? S : D;
    g.font = `500 ${13 * u}px ${MONO}`;
    g.fillText(f, 14 * u, (68 + i * 24) * u);
  });
  // code
  const x0 = 236 * u;
  CODE.forEach((line, i) => {
    const y = (70 + i * 24) * u;
    g.fillStyle = '#3d4148';
    g.font = `400 ${13 * u}px ${MONO}`;
    g.textAlign = 'right';
    g.fillText(String(i + 1), x0 - 18 * u, y);
    g.textAlign = 'left';
    let x = x0;
    g.font = `500 ${15 * u}px ${MONO}`;
    line.forEach(([t, col]) => {
      g.fillStyle = col;
      g.fillText(t, x, y);
      x += g.measureText(t).width;
    });
  });
  // cursor line highlight
  g.fillStyle = 'rgba(255,255,255,0.03)';
  g.fillRect(x0 - 10 * u, (70 + 14 * 24 - 17) * u, w, 24 * u);
  // terminal
  const ty = h - 120 * u;
  g.fillStyle = '#0e1114';
  g.fillRect(190 * u, ty, w, 120 * u);
  g.fillStyle = '#1b1f24';
  g.fillRect(190 * u, ty, w, 1 * u);
  g.font = `500 ${13 * u}px ${MONO}`;
  [
    ['TERMINAL', D],
    ['$ mpremote run telemetry.py', S],
    ['connected · publishing every 5 s', K],
  ].forEach(([t, col], i) => {
    g.fillStyle = col;
    g.fillText(t, 210 * u, ty + (28 + i * 26) * u);
  });
  return tex(c);
}

/** Generic responsive app UI used on the phone (illustrative interface, not a product claim). */
export function createPhoneScreen(w = 360): THREE.CanvasTexture {
  const h = Math.round(w * 2.05);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const u = w / 360;
  g.fillStyle = '#0b0d10';
  g.fillRect(0, 0, w, h);
  g.fillStyle = S;
  g.font = `600 ${14 * u}px ${SANS}`;
  g.fillText('9:41', 24 * u, 34 * u);
  g.font = `700 ${26 * u}px ${SANS}`;
  g.fillText('Dashboard', 24 * u, 92 * u);
  g.fillStyle = D;
  g.font = `500 ${13 * u}px ${SANS}`;
  g.fillText('Connected devices', 24 * u, 116 * u);
  const card = (y: number, hh: number, accent = false) => {
    g.fillStyle = accent ? K : '#15181c';
    g.beginPath();
    g.roundRect(20 * u, y * u, w - 40 * u, hh * u, 18 * u);
    g.fill();
  };
  card(140, 150, true);
  g.fillStyle = '#08090B';
  g.font = `600 ${13 * u}px ${SANS}`;
  g.fillText('Sensor node', 40 * u, 172 * u);
  g.font = `700 ${40 * u}px ${SANS}`;
  g.fillText('Online', 40 * u, 222 * u);
  for (let i = 0; i < 14; i++) {
    const bh = (14 + Math.abs(Math.sin(i * 1.7)) * 30) * u;
    g.fillRect((40 + i * 20) * u, 272 * u - bh, 10 * u, bh);
  }
  card(310, 96);
  card(420, 96);
  card(530, 96);
  ['Device status', 'Readings log', 'Settings'].forEach((t, i) => {
    g.fillStyle = S;
    g.font = `600 ${15 * u}px ${SANS}`;
    g.fillText(t, 40 * u, (350 + i * 110) * u);
    g.fillStyle = D;
    g.font = `500 ${12 * u}px ${SANS}`;
    g.fillText('Tap to open', 40 * u, (374 + i * 110) * u);
    g.fillStyle = '#2a2e34';
    g.beginPath();
    g.roundRect(w - 90 * u, (340 + i * 110) * u, 46 * u, 26 * u, 13 * u);
    g.fill();
    g.fillStyle = i === 0 ? K : '#6b6f76';
    g.beginPath();
    g.arc(w - (i === 0 ? 57 : 77) * u, (353 + i * 110) * u, 10 * u, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = '#3a3d43';
  g.beginPath();
  g.roundRect(w / 2 - 60 * u, h - 22 * u, 120 * u, 5 * u, 3 * u);
  g.fill();
  return tex(c);
}

export function createKeyboardTexture(w = 1024): THREE.CanvasTexture {
  const h = Math.round(w * 0.38);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#26282c';
  g.fillRect(0, 0, w, h);
  const rows = [14, 14, 13, 12, 9];
  const kh = h / 6.2;
  rows.forEach((n, r) => {
    const kw = (w - 40) / 14.6;
    const off = 20 + (14 - n) * kw * 0.5;
    for (let i = 0; i < n; i++) {
      const wide = r === 4 && i === 4 ? 4 : 1;
      g.fillStyle = '#0f1012';
      g.beginPath();
      g.roundRect(off + i * kw + (r === 4 && i > 4 ? kw * 3 : 0), 14 + r * (kh + 6), kw * wide - 6, kh, 6);
      g.fill();
    }
  });
  return tex(c);
}

/** Site-plan drawing used under the architectural model. */
export function createSitePlanTexture(w = 1024): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = w;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e4e1d9';
  g.fillRect(0, 0, w, w);
  g.strokeStyle = 'rgba(8,9,11,0.08)';
  g.lineWidth = 1;
  for (let i = 0; i <= w; i += w / 32) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, w);
    g.moveTo(0, i);
    g.lineTo(w, i);
    g.stroke();
  }
  g.strokeStyle = 'rgba(8,9,11,0.55)';
  g.lineWidth = 2;
  g.setLineDash([18, 8, 4, 8]);
  g.strokeRect(w * 0.08, w * 0.08, w * 0.84, w * 0.84);
  g.setLineDash([]);
  // dimension lines
  g.lineWidth = 1.5;
  const dim = (x0: number, y0: number, x1: number, y1: number, label: string) => {
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
    [
      [x0, y0],
      [x1, y1],
    ].forEach(([x, y]) => {
      g.beginPath();
      g.moveTo(x - 6, y + 6);
      g.lineTo(x + 6, y - 6);
      g.stroke();
    });
    g.fillStyle = 'rgba(8,9,11,0.6)';
    g.font = `500 ${w * 0.022}px ${MONO}`;
    g.textAlign = 'center';
    g.fillText(label, (x0 + x1) / 2, (y0 + y1) / 2 - 10);
  };
  dim(w * 0.2, w * 0.14, w * 0.8, w * 0.14, 'GRID A — D');
  g.save();
  g.translate(w * 0.13, w * 0.5);
  g.rotate(-Math.PI / 2);
  dim(-w * 0.3, 0, w * 0.3, 0, 'GRID 1 — 3');
  g.restore();
  // road + parking
  g.fillStyle = 'rgba(8,9,11,0.12)';
  g.fillRect(w * 0.08, w * 0.8, w * 0.84, w * 0.08);
  g.strokeStyle = 'rgba(8,9,11,0.35)';
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.moveTo(w * (0.12 + i * 0.09), w * 0.8);
    g.lineTo(w * (0.12 + i * 0.09), w * 0.86);
    g.stroke();
  }
  // north arrow
  g.fillStyle = 'rgba(8,9,11,0.7)';
  g.beginPath();
  g.moveTo(w * 0.86, w * 0.2);
  g.lineTo(w * 0.875, w * 0.26);
  g.lineTo(w * 0.845, w * 0.26);
  g.closePath();
  g.fill();
  g.font = `600 ${w * 0.026}px ${MONO}`;
  g.textAlign = 'center';
  g.fillText('N', w * 0.86, w * 0.185);
  const t = tex(c);
  return t;
}
