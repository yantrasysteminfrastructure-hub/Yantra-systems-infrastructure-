// Shared physical layout of the ESP32-style development board.
// Board units: X ∈ [-3, 3] (length), Z ∈ [-2, 2] (width). Top copper at y = BOARD_T / 2.

export const BOARD_W = 6;
export const BOARD_D = 4;
export const BOARD_T = 0.12;
export const TOP = BOARD_T / 2;

export type V2 = [number, number];

export const HEADER_Z = 1.72;
export const HEADER_PINS: number[] = Array.from({ length: 15 }, (_, i) => -2.45 + i * 0.35);

export const MODULE = { x0: 0.6, x1: 2.92, z0: -0.85, z1: 0.85, shieldX1: 2.15 };
export const BRIDGE = { x: -0.6, z: 0.35, s: 0.5 }; // USB-UART bridge (QFN)
export const REG = { x: -1.55, z: -0.72 }; // SOT-223 regulator
export const CAP = { x: -1.55, z: 0.85, r: 0.2, h: 0.42 }; // electrolytic
export const USB = { x: -2.78, z: 0 };
export const BTN_EN = { x: -2.3, z: -1.12 };
export const BTN_BOOT = { x: -2.3, z: 1.12 };
export const LED_PWR = { x: -0.95, z: -1.18 };
export const LED_IO = { x: 0.15, z: -1.18 };

// Small passives: [x, z, rotated?, kind]
export type Passive = [number, number, boolean, 'r' | 'c'];
export const PASSIVES: Passive[] = [
  [-1.0, -0.6, false, 'c'],
  [-1.0, -0.4, false, 'r'],
  [-2.05, -0.62, true, 'c'],
  [-2.05, 0.62, true, 'c'],
  [-0.1, 0.05, true, 'r'],
  [-0.1, 0.65, true, 'r'],
  [-0.6, -0.12, false, 'c'],
  [-0.6, 0.82, false, 'c'],
  [-1.15, 1.2, false, 'r'],
  [-0.6, -1.18, false, 'r'],
  [0.45, -1.18, false, 'r'],
  [0.3, 0.95, true, 'c'],
  [0.3, -0.95, true, 'c'],
  [-2.55, -0.62, true, 'r'],
  [-2.55, 0.62, true, 'r'],
];

/** Route a→b with a straight run followed by a 45° segment, PCB-style. */
export function route45(a: V2, b: V2, straightFirst: 'x' | 'z' = 'z'): V2[] {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const adx = Math.abs(dx);
  const adz = Math.abs(dz);
  const pts: V2[] = [a];
  if (straightFirst === 'z' && adz > adx) {
    pts.push([a[0], a[1] + Math.sign(dz) * (adz - adx)]);
  } else if (straightFirst === 'x' && adx > adz) {
    pts.push([a[0] + Math.sign(dx) * (adx - adz), a[1]]);
  } else if (adz > adx) {
    pts.push([a[0], a[1] + Math.sign(dz) * (adz - adx)]);
  } else if (adx > adz) {
    pts.push([a[0] + Math.sign(dx) * (adx - adz), a[1]]);
  }
  pts.push(b);
  return pts;
}

function chain(...pts: V2[]): V2[] {
  return pts;
}

// Signal traces (also used as paths for the animated data pulses).
export const SIGNAL_TRACES: V2[][] = [
  // USB D+/D- differential pair → bridge
  chain([-2.45, -0.05], [-1.25, -0.05], [-0.95, 0.25], [-0.85, 0.25]),
  chain([-2.45, 0.05], [-1.3, 0.05], [-1.0, 0.35], [-0.85, 0.35]),
  // bridge TX/RX → module
  chain([-0.35, 0.25], [0.0, 0.25], [0.15, 0.1], [0.6, 0.1]),
  chain([-0.35, 0.35], [0.05, 0.35], [0.2, 0.2], [0.6, 0.2]),
];

export const POWER_TRACES: V2[][] = [
  // VBUS → regulator in
  chain([-2.45, -0.15], [-2.2, -0.15], [-1.85, -0.5], [-1.85, -0.62]),
  // regulator out → cap → module 3V3
  chain([-1.25, -0.72], [-0.9, -0.72], [-0.55, -0.37], [0.25, -0.37], [0.4, -0.52], [0.6, -0.52]),
  chain([-1.55, -0.4], [-1.55, 0.6]),
  // EN / BOOT buttons
  chain([-2.3, -0.92], [-2.3, -0.75], [-2.15, -0.6]),
  chain([-2.3, 0.92], [-2.3, 0.78], [-1.9, 0.38], [-1.0, 0.38]),
  // LEDs
  chain([LED_PWR.x, LED_PWR.z], [-0.6, LED_PWR.z]),
  chain([LED_IO.x, LED_IO.z], [0.45, LED_IO.z], [0.75, -0.88]),
];

/** Header-pin → module/peripheral traces, generated. */
export function headerTraces(): V2[][] {
  const out: V2[][] = [];
  for (const side of [-1, 1]) {
    const hz = side * HEADER_Z;
    for (const x of HEADER_PINS) {
      if (x > 0.6 && x < 2.2) {
        // straight run to module castellation
        out.push([[x, hz], [x, side * 0.85]]);
      } else if (x < 0.6 && x > -2.2) {
        // short stub down to a via (signal continues on an inner layer)
        out.push([[x, hz], [x, side * HEADER_VIA_Z]]);
      }
    }
  }
  return out;
}

export const HEADER_VIA_Z = 1.45;
export function headerVias(): V2[] {
  const v: V2[] = [];
  for (const side of [-1, 1]) for (const x of HEADER_PINS) if (x < 0.6 && x > -2.2) v.push([x, side * HEADER_VIA_Z]);
  return v;
}

export const MODULE_PADS: V2[] = (() => {
  const pads: V2[] = [];
  for (let x = 0.7; x <= 2.11; x += 0.117) {
    pads.push([x, MODULE.z0]);
    pads.push([x, MODULE.z1]);
  }
  for (let z = -0.6; z <= 0.61; z += 0.117) pads.push([MODULE.x0, z]);
  return pads;
})();
