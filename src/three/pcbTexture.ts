import * as THREE from 'three';
import {
  BOARD_D,
  BOARD_W,
  BRIDGE,
  BTN_BOOT,
  BTN_EN,
  CAP,
  HEADER_PINS,
  HEADER_Z,
  LED_IO,
  LED_PWR,
  MODULE,
  MODULE_PADS,
  PASSIVES,
  POWER_TRACES,
  REG,
  SIGNAL_TRACES,
  USB,
  headerTraces,
  headerVias,
  type V2,
} from './pcbLayout';

const C = {
  mask: '#0c0e10',
  copper: '#181c1f',
  silk: '#e8e6de',
  pad: '#c8a85c',
};

export interface PcbTextures {
  map: THREE.CanvasTexture;
  metalRough: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
}

/** Draws the board's top layer to canvases and returns PBR textures. */
export function createPcbTextures(size: number, anisotropy: number): PcbTextures {
  const W = size;
  const H = Math.round((size * BOARD_D) / BOARD_W);
  const k = W / BOARD_W;
  const px = (x: number) => (x + BOARD_W / 2) * k;
  const pz = (z: number) => (z + BOARD_D / 2) * k;

  const make = () => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return [c, c.getContext('2d')!] as const;
  };
  const [colorC, g] = make();
  const [mrC, m] = make(); // G = roughness, B = metalness
  const [bumpC, b] = make();

  // --- base ---
  g.fillStyle = C.mask;
  g.fillRect(0, 0, W, H);
  m.fillStyle = 'rgb(0,150,0)';
  m.fillRect(0, 0, W, H);
  b.fillStyle = '#000';
  b.fillRect(0, 0, W, H);

  // --- ground pour (copper under mask), with a margin ---
  const inset = 0.12 * k;
  g.fillStyle = C.copper;
  g.fillRect(inset, inset, W - inset * 2, H - inset * 2);
  b.fillStyle = '#1a1a1a';
  b.fillRect(inset, inset, W - inset * 2, H - inset * 2);

  const allTraces = [...SIGNAL_TRACES, ...POWER_TRACES, ...headerTraces()];
  const pathOf = (ctx: CanvasRenderingContext2D, pts: V2[]) => {
    ctx.beginPath();
    pts.forEach(([x, z], i) => (i ? ctx.lineTo(px(x), pz(z)) : ctx.moveTo(px(x), pz(z))));
  };
  const strokeAll = (ctx: CanvasRenderingContext2D, color: string, width: number, list: V2[][]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    list.forEach((t) => {
      pathOf(ctx, t);
      ctx.stroke();
    });
  };

  // clearance around traces & pads in the pour
  const clear = (fn: (ctx: CanvasRenderingContext2D, color: string) => void) => {
    fn(g, C.mask);
    fn(b, '#000');
  };
  clear((ctx, col) => strokeAll(ctx, col, 0.075 * k, allTraces));
  clear((ctx, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(px(MODULE.x0 - 0.08), pz(MODULE.z0 - 0.08), (MODULE.x1 - MODULE.x0 + 0.16) * k, (MODULE.z1 - MODULE.z0 + 0.16) * k);
    ctx.fillRect(px(BRIDGE.x - 0.4), pz(BRIDGE.z - 0.4), 0.8 * k, 0.8 * k);
    ctx.fillRect(px(-3), pz(USB.z - 0.5), 0.75 * k, 1.0 * k);
  });

  // traces
  strokeAll(g, '#20262a', 0.032 * k, POWER_TRACES.concat(headerTraces()));
  strokeAll(g, '#1f272b', 0.024 * k, SIGNAL_TRACES);
  strokeAll(b, '#555', 0.03 * k, allTraces);

  // --- pads (ENIG gold) ---
  const pad = (x: number, z: number, w: number, h: number, round = false) => {
    for (const [ctx, col] of [
      [g, C.pad],
      [m, 'rgb(0,60,255)'],
      [b, '#777'],
    ] as const) {
      ctx.fillStyle = col;
      if (round) {
        ctx.beginPath();
        ctx.arc(px(x), pz(z), (w / 2) * k, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(px(x - w / 2), pz(z - h / 2), w * k, h * k);
    }
  };
  // through-hole header pads
  for (const side of [-1, 1]) for (const x of HEADER_PINS) pad(x, side * HEADER_Z, 0.2, 0.2, true);
  MODULE_PADS.forEach(([x, z]) => pad(x, z, 0.07, 0.07));
  PASSIVES.forEach(([x, z, rot]) => {
    const d = 0.09;
    if (rot) {
      pad(x, z - d, 0.08, 0.06);
      pad(x, z + d, 0.08, 0.06);
    } else {
      pad(x - d, z, 0.06, 0.08);
      pad(x + d, z, 0.06, 0.08);
    }
  });
  for (let i = 0; i < 4; i++) {
    pad(BRIDGE.x - 0.29, BRIDGE.z - 0.15 + i * 0.1, 0.06, 0.04);
    pad(BRIDGE.x + 0.29, BRIDGE.z - 0.15 + i * 0.1, 0.06, 0.04);
    pad(BRIDGE.x - 0.15 + i * 0.1, BRIDGE.z - 0.29, 0.04, 0.06);
    pad(BRIDGE.x - 0.15 + i * 0.1, BRIDGE.z + 0.29, 0.04, 0.06);
  }
  pad(REG.x + 0.3, REG.z, 0.14, 0.5);
  [-0.15, 0, 0.15].forEach((dz) => pad(REG.x - 0.3, REG.z + dz, 0.12, 0.07));
  for (const btn of [BTN_EN, BTN_BOOT]) {
    [-0.2, 0.2].forEach((dx) => [-0.14, 0.14].forEach((dz) => pad(btn.x + dx, btn.z + dz, 0.08, 0.06)));
  }
  [LED_PWR, LED_IO].forEach((l) => {
    pad(l.x - 0.08, l.z, 0.06, 0.07);
    pad(l.x + 0.08, l.z, 0.06, 0.07);
  });

  // --- vias ---
  const via = (x: number, z: number) => {
    g.fillStyle = '#23292d';
    g.beginPath();
    g.arc(px(x), pz(z), 0.035 * k, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#07080a';
    g.beginPath();
    g.arc(px(x), pz(z), 0.015 * k, 0, Math.PI * 2);
    g.fill();
    b.fillStyle = '#888';
    b.beginPath();
    b.arc(px(x), pz(z), 0.035 * k, 0, Math.PI * 2);
    b.fill();
  };
  headerVias().forEach(([x, z]) => via(x, z));
  for (let x = -2.6; x <= 2.7; x += 0.4) {
    via(x, -1.92);
    via(x, 1.92);
  }
  [
    [-1.2, -1.0],
    [-0.2, -0.65],
    [0.35, 0.55],
    [-1.9, 1.0],
    [-0.15, -1.0],
    [-1.2, 0.55],
  ].forEach(([x, z]) => via(x, z));

  // --- mounting holes ---
  for (const [x, z] of [
    [-2.78, -1.78],
    [2.78, -1.78],
    [-2.78, 1.78],
    [2.78, 1.78],
  ]) {
    pad(x, z, 0.3, 0.3, true);
    g.fillStyle = '#050506';
    g.beginPath();
    g.arc(px(x), pz(z), 0.09 * k, 0, Math.PI * 2);
    g.fill();
  }

  // --- silkscreen ---
  g.strokeStyle = C.silk;
  g.fillStyle = C.silk;
  g.lineWidth = 0.012 * k;
  const box = (x0: number, z0: number, x1: number, z1: number) => g.strokeRect(px(x0), pz(z0), (x1 - x0) * k, (z1 - z0) * k);
  const text = (s: string, x: number, z: number, sizeU: number, align: CanvasTextAlign = 'center', rot = 0) => {
    g.save();
    g.translate(px(x), pz(z));
    g.rotate(rot);
    g.font = `600 ${sizeU * k}px "JetBrains Mono", ui-monospace, monospace`;
    g.textAlign = align;
    g.textBaseline = 'middle';
    g.fillText(s, 0, 0);
    g.restore();
  };
  box(MODULE.x0 - 0.05, MODULE.z0 - 0.05, MODULE.x1 + 0.03, MODULE.z1 + 0.05);
  box(BRIDGE.x - 0.36, BRIDGE.z - 0.36, BRIDGE.x + 0.36, BRIDGE.z + 0.36);
  g.beginPath();
  g.arc(px(BRIDGE.x - 0.42), pz(BRIDGE.z - 0.42), 0.025 * k, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(px(CAP.x), pz(CAP.z), (CAP.r + 0.05) * k, 0, Math.PI * 2);
  g.stroke();
  text('+', CAP.x + 0.32, CAP.z - 0.12, 0.12);
  text('U1', MODULE.x0 + 0.1, MODULE.z0 - 0.2, 0.09, 'left');
  text('U2', BRIDGE.x, BRIDGE.z - 0.5, 0.09);
  text('U3', REG.x, REG.z - 0.42, 0.09);
  text('C1', CAP.x, CAP.z + 0.38, 0.09);
  text('EN', BTN_EN.x + 0.0, BTN_EN.z - 0.32, 0.09);
  text('BOOT', BTN_BOOT.x, BTN_BOOT.z + 0.33, 0.09);
  text('PWR', LED_PWR.x, LED_PWR.z + 0.15, 0.07);
  text('IO2', LED_IO.x, LED_IO.z + 0.15, 0.07);
  const labelsTop = ['3V3', 'EN', 'VP', 'VN', '34', '35', '32', '33', '25', '26', '27', '14', '12', '13', 'GND'];
  const labelsBot = ['GND', '23', '22', 'TX', 'RX', '21', '19', '18', '5', '17', '16', '4', '0', '2', '15'];
  HEADER_PINS.forEach((x, i) => {
    text(labelsTop[i], x, -HEADER_Z + 0.22, 0.065);
    text(labelsBot[i], x, HEADER_Z - 0.22, 0.065);
  });
  text('YANTRA SYSTEMS & INFRASTRUCTURE', -2.85, 1.38, 0.075, 'left');
  text('YSI-DEV32  REV 1.0', -2.85, -1.38, 0.075, 'left');
  // antenna keep-out marker
  g.setLineDash([0.04 * k, 0.04 * k]);
  box(MODULE.shieldX1 + 0.05, MODULE.z0 - 0.1, 3.0, MODULE.z1 + 0.1);
  g.setLineDash([]);

  const toTex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = anisotropy;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  return { map: toTex(colorC, true), metalRough: toTex(mrC, false), bump: toTex(bumpC, false) };
}

/** Engraved label texture for the module's RF shield. */
export function createShieldTexture(size = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = Math.round(size * 1.15);
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, c.width, c.height);
  grad.addColorStop(0, '#b9bcc0');
  grad.addColorStop(0.5, '#d4d6d9');
  grad.addColorStop(1, '#a9acb1');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  // brushed lines
  for (let i = 0; i < 900; i++) {
    g.strokeStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '60,62,66'},${Math.random() * 0.06})`;
    g.lineWidth = 1;
    const y = Math.random() * c.height;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(c.width, y + (Math.random() - 0.5) * 4);
    g.stroke();
  }
  g.fillStyle = 'rgba(40,42,46,0.78)';
  g.textAlign = 'center';
  g.font = `700 ${size * 0.085}px "JetBrains Mono", ui-monospace, monospace`;
  g.fillText('ESP32', c.width / 2, c.height * 0.36);
  g.font = `500 ${size * 0.05}px "JetBrains Mono", ui-monospace, monospace`;
  g.fillText('WI-FI + BLUETOOTH', c.width / 2, c.height * 0.46);
  g.fillText('DUAL-CORE MCU', c.width / 2, c.height * 0.53);
  g.strokeStyle = 'rgba(40,42,46,0.55)';
  g.lineWidth = size * 0.006;
  g.strokeRect(c.width * 0.1, c.height * 0.64, c.width * 0.8, c.height * 0.22);
  g.font = `500 ${size * 0.04}px "JetBrains Mono", ui-monospace, monospace`;
  g.fillText('2.4 GHz', c.width / 2, c.height * 0.76);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Module PCB (antenna end) texture with meander antenna. */
export function createAntennaTexture(size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size * 2;
  const g = c.getContext('2d')!;
  g.fillStyle = '#101418';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#2b333a';
  g.lineWidth = size * 0.05;
  g.lineJoin = 'miter';
  g.beginPath();
  const x0 = size * 0.2;
  const x1 = size * 0.8;
  let y = size * 0.25;
  g.moveTo(x0, y);
  for (let i = 0; i < 6; i++) {
    g.lineTo(i % 2 ? x0 : x1, y);
    y += size * 0.25;
    g.lineTo(i % 2 ? x0 : x1, y);
  }
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
