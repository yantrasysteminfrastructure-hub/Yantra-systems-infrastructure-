import * as THREE from 'three';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = 'Inter, system-ui, sans-serif';
const DISPLAY = '"Space Grotesk", Inter, system-ui, sans-serif';
const INKL = '#1b1d22';
const LIME = '#CDF22B';

function tex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

type Seg = { x0: number; y0: number; x1: number; y1: number } | { cx: number; cy: number; r: number; a0: number; a1: number };
interface Stroke {
  segs: Seg[];
  width: number;
  color: string;
  dash?: number[];
  /** Area wiped to paper colour when the stroke starts (wall openings for doors and windows). */
  clear?: [number, number, number, number];
}

const segLen = (s: Seg) => ('r' in s ? Math.abs(s.a1 - s.a0) * s.r : Math.hypot(s.x1 - s.x0, s.y1 - s.y0));
const segPoint = (s: Seg, f: number): [number, number] =>
  'r' in s
    ? [s.cx + Math.cos(s.a0 + (s.a1 - s.a0) * f) * s.r, s.cy + Math.sin(s.a0 + (s.a1 - s.a0) * f) * s.r]
    : [s.x0 + (s.x1 - s.x0) * f, s.y0 + (s.y1 - s.y0) * f];

const L = (x0: number, y0: number, x1: number, y1: number): Seg => ({ x0, y0, x1, y1 });
const poly = (...pts: [number, number][]) => pts.slice(1).map((p, i) => L(pts[i][0], pts[i][1], p[0], p[1]));
const rectSegs = (x: number, y: number, w: number, h: number) => poly([x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]);

/* Sheet: 1400 x 990 logical (A-series landscape). Plan drawn at 1 px = 10 mm. */
const SW = 1400;
const SH = 990;
const PX = 150; // plan outer-wall origin
const PY = 190;
const PW = 800;
const PH = 540;
const T = 23; // wall thickness (230 mm)
const PAPER = '#f3f0e7';

function buildStrokes(): { strokes: Stroke[]; poche: number; labels: { at: number; draw(g: CanvasRenderingContext2D): void }[] } {
  const strokes: Stroke[] = [];
  const W = 5;
  const thin = 2.3;
  // column grid
  const gx = [PX + T / 2, PX + 330, PX + 560, PX + PW - T / 2];
  const gy = [PY + T / 2, PY + 290, PY + PH - T / 2];
  gx.forEach((x) => strokes.push({ segs: [L(x, PY - 60, x, PY + PH + 30)], width: 1.5, color: '#8d8a82', dash: [16, 5, 3, 5] }));
  gy.forEach((y) => strokes.push({ segs: [L(PX - 60, y, PX + PW + 30, y)], width: 1.5, color: '#8d8a82', dash: [16, 5, 3, 5] }));
  // outer walls
  strokes.push({ segs: rectSegs(PX, PY, PW, PH), width: W, color: INKL });
  strokes.push({ segs: rectSegs(PX + T, PY + T, PW - 2 * T, PH - 2 * T), width: W, color: INKL });
  const poche = strokes.length - 1;
  // interior walls (115 mm), with door openings
  const iw = 11.5;
  const vWall = (x: number, y0: number, y1: number) => [L(x - iw / 2, y0, x - iw / 2, y1), L(x + iw / 2, y1, x + iw / 2, y0)];
  const hWall = (y: number, x0: number, x1: number) => [L(x0, y - iw / 2, x1, y - iw / 2), L(x1, y + iw / 2, x0, y + iw / 2)];
  const x1 = gx[1];
  const x2 = gx[2];
  const ym = gy[1];
  strokes.push({ segs: [...vWall(x1, PY + T, ym - 110), ...vWall(x1, ym - 20, PY + PH - T)], width: 3.4, color: INKL });
  strokes.push({ segs: [...hWall(ym, PX + T, PX + 140), ...hWall(ym, PX + 230, x1)], width: 3.4, color: INKL });
  strokes.push({ segs: [...vWall(x2, PY + T, ym)], width: 3.4, color: INKL });
  strokes.push({ segs: [...hWall(ym, x1, x1 + 70), ...hWall(ym, x1 + 160, PX + PW - T)], width: 3.4, color: INKL });
  // door swings (leaf + arc)
  const door = (hx: number, hy: number, r: number, a0: number, a1: number) => ({
    segs: [L(hx, hy, hx + Math.cos(a1) * r, hy + Math.sin(a1) * r), { cx: hx, cy: hy, r, a0: a1, a1: a0 }],
    width: thin,
    color: INKL,
  });
  strokes.push(door(x1, ym - 20, 90, -Math.PI / 2, -Math.PI));
  strokes.push(door(PX + 230, ym, 90, Math.PI, Math.PI * 1.5));
  strokes.push(door(x1 + 160, ym, 90, 0, Math.PI / 2));
  // main entrance in the bottom wall
  strokes.push({
    ...door(PX + 560, PY + PH - T, 100, Math.PI, Math.PI * 1.5),
    clear: [PX + 460, PY + PH - T - 1, 100, T + 2],
  });
  // windows: wipe the wall and draw the glazing lines
  const win = (x: number, y: number, w: number, h: number): Stroke => ({
    clear: [x, y, w, h],
    segs: w > h ? [...rectSegs(x, y, w, h), L(x, y + h / 2, x + w, y + h / 2)] : [...rectSegs(x, y, w, h), L(x + w / 2, y, x + w / 2, y + h)],
    width: thin,
    color: INKL,
  });
  strokes.push(win(PX + 110, PY, 130, T));
  strokes.push(win(PX + 390, PY, 110, T));
  strokes.push(win(PX + 640, PY, 90, T));
  strokes.push(win(PX + 120, PY + PH - T, 130, T));
  strokes.push(win(PX + PW - T, PY + 340, T, 120));
  strokes.push(win(PX, PY + 90, T, 110));
  // kitchen counter + sink
  strokes.push({ segs: poly([x1 + 12, PY + T + 60], [x2 - 12, PY + T + 60]), width: thin, color: INKL });
  strokes.push({ segs: rectSegs(x1 + 70, PY + T + 12, 70, 38), width: thin, color: INKL });
  // toilet fixtures
  strokes.push({ segs: rectSegs(x2 + 150, PY + T + 14, 50, 36), width: thin, color: INKL });
  strokes.push({ segs: [{ cx: x2 + 175, cy: PY + T + 82, r: 24, a0: 0, a1: Math.PI * 2 }], width: thin, color: INKL });
  // dimension chains
  const dimH = (y: number, xs: number[]) => xs.slice(1).map((x, i) => L(xs[i], y, x, y));
  const dimV = (x: number, ys: number[]) => ys.slice(1).map((y, i) => L(x, ys[i], x, y));
  strokes.push({ segs: dimH(PY - 90, [PX, gx[1], gx[2], PX + PW]), width: 1.7, color: '#4a4c52' });
  strokes.push({ segs: dimV(PX - 90, [PY, gy[1], PY + PH]), width: 1.7, color: '#4a4c52' });

  const labels = [
    {
      at: 0.08,
      draw(g: CanvasRenderingContext2D) {
        g.font = `600 19px ${MONO}`;
        g.textAlign = 'center';
        ['A', 'B', 'C', 'D'].forEach((n, i) => bubble(g, gx[i], PY - 78 + 0, n));
        ['1', '2', '3'].forEach((n, i) => bubble(g, PX - 78, gy[i], n));
      },
    },
    {
      at: 0.93,
      draw(g: CanvasRenderingContext2D) {
        g.fillStyle = '#4a4c52';
        g.font = `500 19px ${MONO}`;
        g.textAlign = 'center';
        const xs = [PX, gx[1], gx[2], PX + PW];
        xs.slice(1).forEach((x, i) => g.fillText(String(Math.round((x - xs[i]) * 10)), (x + xs[i]) / 2, PY - 98));
        xs.forEach((x) => tick(g, x, PY - 90));
        const ys = [PY, gy[1], PY + PH];
        ys.forEach((y) => tick(g, PX - 90, y));
        g.save();
        g.translate(PX - 98, 0);
        g.rotate(-Math.PI / 2);
        ys.slice(1).forEach((y, i) => g.fillText(String(Math.round((y - ys[i]) * 10)), -(y + ys[i]) / 2, 0));
        g.restore();
      },
    },
    {
      at: 0.98,
      draw(g: CanvasRenderingContext2D) {
        g.fillStyle = INKL;
        g.textAlign = 'center';
        const room = (name: string, x: number, y: number) => {
          g.font = `600 21px ${MONO}`;
          g.fillText(name, x, y);
        };
        room('BED ROOM', (PX + x1) / 2, (PY + ym) / 2 + 20);
        room('KITCHEN', (x1 + x2) / 2, (PY + ym) / 2 + 40);
        room('TOILET', (x2 + PX + PW) / 2, (PY + ym) / 2 + 60);
        room('LIVING', (PX + x1) / 2, (ym + PY + PH) / 2 + 10);
        room('DINING / HALL', (x1 + PX + PW) / 2 + 20, (ym + PY + PH) / 2 + 10);
        g.font = `500 16px ${MONO}`;
        g.fillStyle = '#6a6c72';
        g.fillText('ENTRY', PX + 510, PY + PH + 30);
      },
    },
  ];
  return { strokes, poche, labels };
}

function bubble(g: CanvasRenderingContext2D, x: number, y: number, n: string) {
  g.fillStyle = PAPER;
  g.strokeStyle = '#4a4c52';
  g.lineWidth = 1.2;
  g.beginPath();
  g.arc(x, y, 19, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.fillStyle = INKL;
  g.fillText(n, x, y + 7);
}

function tick(g: CanvasRenderingContext2D, x: number, y: number) {
  g.strokeStyle = '#4a4c52';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x - 6, y + 6);
  g.lineTo(x + 6, y - 6);
  g.stroke();
}

/** Border, title block, north arrow and scale bar — printed on the sheet before drawing starts. */
function drawStatic(g: CanvasRenderingContext2D) {
  g.fillStyle = PAPER;
  g.fillRect(0, 0, SW, SH);
  // paper grain
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = `rgba(60,50,30,${rnd() * 0.035})`;
    g.fillRect(rnd() * SW, rnd() * SH, 2, 2);
  }
  g.strokeStyle = INKL;
  g.lineWidth = 2.4;
  g.strokeRect(26, 26, SW - 52, SH - 52);
  g.lineWidth = 1;
  g.strokeRect(36, 36, SW - 72, SH - 72);
  // title block
  const tx = 1040;
  const ty = 700;
  const tw = SW - 36 - tx;
  const th = SH - 36 - ty;
  g.lineWidth = 1.6;
  g.strokeRect(tx, ty, tw, th);
  [62, 140, 196].forEach((y) => {
    g.beginPath();
    g.moveTo(tx, ty + y);
    g.lineTo(tx + tw, ty + y);
    g.stroke();
  });
  g.beginPath();
  g.moveTo(tx + tw / 2, ty + 196);
  g.lineTo(tx + tw / 2, ty + th);
  g.stroke();
  g.fillStyle = INKL;
  g.fillRect(tx + 18, ty + 18, 26, 26);
  g.fillStyle = LIME;
  g.fillRect(tx + 24, ty + 24, 14, 14);
  g.fillStyle = INKL;
  g.textAlign = 'left';
  g.font = `600 15px ${MONO}`;
  g.fillText('YANTRA SYSTEMS & INFRASTRUCTURE', tx + 58, ty + 37);
  g.font = `600 30px ${DISPLAY}`;
  g.fillText('GROUND FLOOR PLAN', tx + 18, ty + 104);
  g.font = `500 13px ${MONO}`;
  g.fillStyle = '#6a6c72';
  g.fillText('SAMPLE DRAWING · FOR ILLUSTRATION', tx + 18, ty + 128);
  g.fillText('SCALE', tx + 18, ty + 164);
  g.fillText('UNITS', tx + tw / 2 + 18, ty + 164);
  g.fillText('SHEET', tx + 18, ty + 220);
  g.fillText('REV', tx + tw / 2 + 18, ty + 220);
  g.fillStyle = INKL;
  g.font = `600 16px ${MONO}`;
  g.fillText('1 : 100', tx + 18, ty + 186);
  g.fillText('mm', tx + tw / 2 + 18, ty + 186);
  g.fillText('A-101', tx + 18, ty + 242);
  g.fillText('R0', tx + tw / 2 + 18, ty + 242);
  // north arrow
  const nx = 1200;
  const ny = 260;
  g.strokeStyle = INKL;
  g.lineWidth = 1.4;
  g.beginPath();
  g.arc(nx, ny, 42, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(nx, ny - 52);
  g.lineTo(nx + 14, ny + 18);
  g.lineTo(nx, ny + 8);
  g.closePath();
  g.fill();
  g.font = `600 18px ${MONO}`;
  g.textAlign = 'center';
  g.fillText('N', nx, ny - 62);
  // scale bar
  const sx = 1090;
  const sy = 560;
  for (let i = 0; i < 5; i++) {
    g.fillStyle = i % 2 ? PAPER : INKL;
    g.fillRect(sx + i * 40, sy, 40, 10);
  }
  g.strokeRect(sx, sy, 200, 10);
  g.fillStyle = INKL;
  g.font = `500 12px ${MONO}`;
  ['0', '1', '2', '3', '4', '5 m'].forEach((t, i) => g.fillText(t, sx + i * 40, sy + 30));
}

export interface DrawingSheet {
  texture: THREE.CanvasTexture;
  aspect: number;
  /** Draws the plan up to progress p (0–1). Returns the pen position in UV space (0–1, y down). */
  update(p: number): [number, number];
}

/** Architectural sheet whose floor plan draws itself stroke by stroke. */
export function createDrawingSheet(quality = 1): DrawingSheet {
  const s = 1.15 * quality;
  const c = document.createElement('canvas');
  c.width = Math.round(SW * s);
  c.height = Math.round(SH * s);
  const g = c.getContext('2d')!;
  const texture = tex(c);
  const { strokes, poche, labels } = buildStrokes();
  const lens = strokes.map((st) => st.segs.reduce((n, sg) => n + segLen(sg), 0));
  const total = lens.reduce((a, b) => a + b, 0);
  let lastKey = -1;
  let pen: [number, number] = [0.5, 0.5];
  let fontsReady = false;
  document.fonts?.ready.then(() => {
    fontsReady = true;
    lastKey = -1;
  });

  const draw = (p: number) => {
    g.setTransform(s, 0, 0, s, 0, 0);
    drawStatic(g);
    let left = p * total;
    let penAt: [number, number] | null = null;
    strokes.forEach((st, i) => {
      if (left <= 0) return;
      if (st.clear) {
        g.fillStyle = PAPER;
        g.fillRect(...st.clear);
      }
      g.strokeStyle = st.color;
      g.lineWidth = st.width;
      g.lineCap = 'round';
      g.setLineDash(st.dash ?? []);
      g.beginPath();
      for (const sg of st.segs) {
        if (left <= 0) break;
        const len = segLen(sg);
        const f = Math.min(1, left / len);
        if ('r' in sg) {
          g.moveTo(...segPoint(sg, 0));
          g.arc(sg.cx, sg.cy, sg.r, sg.a0, sg.a0 + (sg.a1 - sg.a0) * f, sg.a1 < sg.a0);
        } else {
          g.moveTo(sg.x0, sg.y0);
          g.lineTo(...segPoint(sg, f));
        }
        if (f < 1) penAt = segPoint(sg, f);
        left -= len;
      }
      g.stroke();
      if (i === poche && left > 0) {
        // outer walls complete: fill the wall poché
        g.fillStyle = 'rgba(27,29,34,0.82)';
        g.beginPath();
        g.rect(PX, PY, PW, PH);
        g.rect(PX + T, PY + T, PW - 2 * T, PH - 2 * T);
        g.fill('evenodd');
      }
    });
    g.setLineDash([]);
    labels.forEach((l) => {
      if (p >= l.at) l.draw(g);
    });
    if (penAt) pen = [penAt[0] / SW, penAt[1] / SH];
    else if (p >= 1) pen = [0.86, 0.72];
    texture.needsUpdate = true;
  };

  return {
    texture,
    aspect: SW / SH,
    update(p) {
      const key = Math.round(Math.min(1, Math.max(0, p)) * 400) + (fontsReady ? 1000 : 0);
      if (key !== lastKey) {
        lastKey = key;
        draw(Math.min(1, Math.max(0, p)));
      }
      return pen;
    },
  };
}

export interface ScheduleChart {
  texture: THREE.CanvasTexture;
  update(p: number): void;
}

const TASKS: [string, number, number][] = [
  ['Site clearing', 0, 2],
  ['Excavation', 1.5, 4],
  ['Foundation', 3.5, 7],
  ['Columns & beams', 6, 10],
  ['Slabs', 8, 12],
  ['Brickwork', 10.5, 14],
  ['Finishing', 13, 16],
];

/** Construction schedule (Gantt) on the tablet; bars fill in as p goes 0 → 1. */
export function createScheduleChart(quality = 1): ScheduleChart {
  const W = 1000;
  const H = 680;
  const s = quality;
  const c = document.createElement('canvas');
  c.width = Math.round(W * s);
  c.height = Math.round(H * s);
  const g = c.getContext('2d')!;
  const texture = tex(c);
  let lastKey = -1;

  const draw = (p: number) => {
    g.setTransform(s, 0, 0, s, 0, 0);
    g.fillStyle = '#0c0e11';
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#e8e6de';
    g.font = `600 30px ${DISPLAY}`;
    g.textAlign = 'left';
    g.fillText('Construction schedule', 44, 70);
    g.fillStyle = '#868a91';
    g.font = `500 15px ${MONO}`;
    g.fillText('SAMPLE DATA · 16 WEEKS', 44, 100);
    // legend
    g.strokeStyle = '#5a5e66';
    g.lineWidth = 1.5;
    g.strokeRect(W - 300, 56, 22, 12);
    g.fillStyle = LIME;
    g.fillRect(W - 170, 56, 22, 12);
    g.fillStyle = '#9a9da4';
    g.font = `500 14px ${SANS}`;
    g.fillText('Planned', W - 268, 68);
    g.fillText('Progress', W - 138, 68);
    const x0 = 260;
    const x1 = W - 44;
    const y0 = 140;
    const wk = (x1 - x0) / 16;
    for (let i = 0; i <= 16; i++) {
      g.fillStyle = i % 4 === 0 ? '#2a2d32' : '#181b1f';
      g.fillRect(x0 + i * wk, y0, 1, H - y0 - 70);
      if (i % 4 === 0 && i < 16) {
        g.fillStyle = '#6b6f76';
        g.font = `500 13px ${MONO}`;
        g.fillText(`W${i + 1}`, x0 + i * wk + 6, H - 40);
      }
    }
    const now = p * 16;
    const rowH = (H - y0 - 90) / TASKS.length;
    TASKS.forEach(([name, a, b], i) => {
      const y = y0 + 10 + i * rowH;
      g.fillStyle = '#d7d9dd';
      g.font = `500 17px ${SANS}`;
      g.fillText(name, 44, y + rowH / 2 + 6);
      const bx = x0 + a * wk;
      const bw = (b - a) * wk;
      const bh = rowH * 0.46;
      const by = y + (rowH - bh) / 2;
      g.strokeStyle = '#4a4e56';
      g.lineWidth = 1.5;
      g.beginPath();
      g.roundRect(bx, by, bw, bh, bh / 2);
      g.stroke();
      const done = Math.min(1, Math.max(0, (now - a) / (b - a)));
      if (done > 0) {
        g.fillStyle = done >= 1 ? LIME : 'rgba(205,242,43,0.85)';
        g.beginPath();
        g.roundRect(bx, by, Math.max(bh, bw * done), bh, bh / 2);
        g.fill();
      }
    });
    // "today" marker
    const tx = x0 + now * wk;
    g.fillStyle = '#ffffff';
    g.fillRect(tx - 1, y0 - 6, 2, H - y0 - 64);
    g.beginPath();
    g.arc(tx, y0 - 8, 5, 0, Math.PI * 2);
    g.fill();
    texture.needsUpdate = true;
  };

  return {
    texture,
    update(p) {
      const key = Math.round(Math.min(1, Math.max(0, p)) * 160);
      if (key === lastKey) return;
      lastKey = key;
      draw(Math.min(1, Math.max(0, p)));
    },
  };
}
