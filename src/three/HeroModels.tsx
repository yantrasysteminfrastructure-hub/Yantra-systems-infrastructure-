import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useDispose, useMaterial } from './DomainModels';
import { createKeyboardTexture } from './screens';
import { createBrowserBar, createSiteHeader, createSitePage, type SitePage } from './sitePage';
import { createDrawingSheet, createScheduleChart } from './drawingSheet';
import { damp } from './pointer';
import { LIME } from './DevBoard';

export interface SlideModelProps {
  /** Run the animation (off for reduced motion and while the slide is hidden). */
  animate: boolean;
  /** Clock time when the slide was last shown; animations play from there. */
  since: { current: number };
  /** Texture resolution scale (lower on phones). */
  quality: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => {
  const x = clamp01(v);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** Piecewise scroll: hold at each stop, then glide to the next. */
function scrollAt(t: number, stops: { at: number; to: number; dur: number }[], start = 0) {
  let y = start;
  for (const s of stops) {
    if (t <= s.at) break;
    y += (s.to - y) * ease((t - s.at) / s.dur);
  }
  return y;
}

function roundedShape(w: number, h: number, rTop: number, rBottom = rTop) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + rBottom, y);
  s.lineTo(x + w - rBottom, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rBottom);
  s.lineTo(x + w, y + h - rTop);
  s.quadraticCurveTo(x + w, y + h, x + w - rTop, y + h);
  s.lineTo(x + rTop, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rTop);
  s.lineTo(x, y + rBottom);
  s.quadraticCurveTo(x, y, x + rBottom, y);
  return s;
}

/** Flat rounded rectangle with 0–1 UVs across its bounds (ShapeGeometry UVs are in shape units). */
function roundedPlane(w: number, h: number, rTop: number, rBottom = rTop) {
  const geo = new THREE.ShapeGeometry(roundedShape(w, h, rTop, rBottom), 10);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return geo;
}

function screenMaterial(map: THREE.Texture, transparent = false) {
  return new THREE.MeshStandardMaterial({
    map,
    emissiveMap: map,
    emissive: '#ffffff',
    emissiveIntensity: 0.92,
    roughness: 0.16,
    metalness: 0,
    transparent,
  });
}

/** Uploads textures to the GPU ahead of time so the slide doesn't stall when it first appears. */
function useWarm(page: { ready: Promise<void> } | null, textures: THREE.Texture[]) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let alive = true;
    (page?.ready ?? Promise.resolve()).then(() => {
      if (!alive) return;
      textures.forEach((t) => {
        t.needsUpdate = true;
        gl.initTexture(t);
      });
      invalidate();
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ------------------------------------------------------------------ */
/* Web application: a laptop opens on the Yantra website and scrolls   */
/* ------------------------------------------------------------------ */
export function HeroLaptop({ animate, since, quality }: SlideModelProps) {
  const page = useMemo(() => createSitePage('desktop', quality), [quality]);
  const header = useMemo(() => createSiteHeader('desktop', quality), [quality]);
  const bar = useMemo(() => createBrowserBar(quality), [quality]);
  const keys = useMemo(() => createKeyboardTexture(1024), []);
  useDispose(page.texture, header.texture, bar.texture, keys);
  useWarm(page, [page.texture, header.texture, bar.texture]);

  const pageMat = useMemo(() => screenMaterial(page.texture), [page]);
  const headerMat = useMemo(() => screenMaterial(header.texture, true), [header]);
  const barMat = useMemo(() => screenMaterial(bar.texture), [bar]);
  useDispose(pageMat, headerMat, barMat);
  const shell = useMaterial({ color: '#45484e', metalness: 0.88, roughness: 0.3 });
  const bezel = useMaterial({ color: '#060708', roughness: 0.12, metalness: 0.2 });
  const pad = useMaterial({ color: '#50535a', metalness: 0.7, roughness: 0.2 });
  const keyMat = useMemo(() => new THREE.MeshStandardMaterial({ map: keys, roughness: 0.7 }), [keys]);
  useDispose(keyMat);

  const W = 3.6;
  const D = 2.4;
  const SW = 3.42; // screen
  const SH = 2.14;
  const barH = (SW * bar.height) / bar.width;
  const viewH3 = SH - barH;
  const viewH = (viewH3 / SW) * page.width; // logical px visible
  const headH3 = (SW * header.height) / header.width;
  const yc = 1.2;
  const top = yc + SH / 2;

  const lid = useRef<THREE.Group>(null);
  const screens = [pageMat, headerMat, barMat];
  const S1 = page.sections[2] - header.height + 10; // services
  const S2 = page.sections[4] - header.height - 40; // contact

  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime - since.current : 99;
    const open = animate ? ease((t - 0.1) / 1.0) : 1;
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2 - 0.03, -0.5, open);
    const on = clamp01((open - 0.35) / 0.4);
    screens.forEach((m) => {
      m.color.setScalar(on);
      m.emissiveIntensity = 0.92 * on;
    });
    const y = animate
      ? scrollAt(t, [
          { at: 1.7, to: S1, dur: 0.9 },
          { at: 3.3, to: S2, dur: 1.0 },
        ])
      : 0;
    page.scroll(page.texture, y, viewH);
    const spy = page.sections.reduce((a, s, i) => (y + header.height + 120 >= s ? i : a), 0);
    header.setActive(spy);
  });

  return (
    <group position={[0, -0.75, 0.2]}>
      <RoundedBox args={[W, 0.11, D]} radius={0.05} smoothness={4} position={[0, 0.055, 0]} material={shell} castShadow receiveShadow />
      <mesh position={[0, 0.111, -0.3]} rotation={[-Math.PI / 2, 0, 0]} material={keyMat}>
        <planeGeometry args={[W * 0.84, W * 0.84 * 0.38]} />
      </mesh>
      <mesh position={[0, 0.111, 0.72]} rotation={[-Math.PI / 2, 0, 0]} material={pad}>
        <planeGeometry args={[1.35, 0.78]} />
      </mesh>
      <mesh position={[0, 0.08, -D / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} material={bezel}>
        <cylinderGeometry args={[0.04, 0.04, W * 0.82, 16]} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group ref={lid} position={[0, 0.1, -D / 2 + 0.03]} rotation={[-0.5, 0, 0]}>
        <RoundedBox args={[W, 2.4, 0.06]} radius={0.04} smoothness={4} position={[0, 1.2, -0.03]} material={shell} castShadow />
        <mesh position={[0, 1.2, 0.002]} material={bezel}>
          <planeGeometry args={[W - 0.05, 2.35]} />
        </mesh>
        <mesh position={[0, top + 0.06, 0.003]}>
          <circleGeometry args={[0.018, 16]} />
          <meshStandardMaterial color="#1d2026" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0, top - barH / 2, 0.004]} material={barMat}>
          <planeGeometry args={[SW, barH]} />
        </mesh>
        <mesh position={[0, top - barH - viewH3 / 2, 0.004]} material={pageMat}>
          <planeGeometry args={[SW, viewH3]} />
        </mesh>
        <mesh position={[0, top - barH - headH3 / 2, 0.005]} material={headerMat}>
          <planeGeometry args={[SW, headH3]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile app: two phones showing the Yantra site on mobile            */
/* ------------------------------------------------------------------ */
function Phone({
  page,
  pageTex,
  headerTex,
  headerH,
  scroll,
  frame,
  pos,
  rot,
}: {
  page: SitePage;
  pageTex: THREE.Texture;
  headerTex: THREE.Texture;
  headerH: number;
  scroll: { current: number };
  frame: THREE.Material;
  pos: [number, number, number];
  rot: [number, number, number];
}) {
  const W = 1.0;
  const H = 2.12;
  const R = 0.15;
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedShape(W, H, R), {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.017,
      bevelSize: 0.016,
      bevelSegments: 5,
      curveSegments: 18,
    });
    g.center();
    return g;
  }, []);
  const SW = W - 0.06;
  const SH = H - 0.06;
  const glassGeo = useMemo(() => roundedPlane(W + 0.01, H + 0.01, R + 0.005), []);
  const screenGeo = useMemo(() => roundedPlane(SW, SH, R - 0.03), [SW, SH]);
  const headH3 = (SW * headerH) / 390;
  const headGeo = useMemo(() => roundedPlane(SW, headH3, R - 0.03, 0), [SW, headH3]);
  const islandGeo = useMemo(() => roundedPlane(0.27, 0.075, 0.0375), []);
  const camGeo = useMemo(() => roundedPlane(0.42, 0.42, 0.1), []);
  useDispose(geo, glassGeo, screenGeo, headGeo, islandGeo, camGeo);
  const pageMat = useMemo(() => screenMaterial(pageTex), [pageTex]);
  const headMat = useMemo(() => screenMaterial(headerTex, true), [headerTex]);
  useDispose(pageMat, headMat);
  const glass = useMaterial({ color: '#030304', roughness: 0.06, metalness: 0.1 });
  const lens = useMaterial({ color: '#0b0d10', roughness: 0.05, metalness: 0.6 });
  const viewH = (SH / SW) * 390;
  const z = 0.0425;

  useFrame(() => page.scroll(pageTex, scroll.current, viewH));

  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo} material={frame} castShadow />
      <mesh geometry={glassGeo} material={glass} position={[0, 0, z + 0.0006]} />
      <mesh geometry={screenGeo} material={pageMat} position={[0, 0, z + 0.0012]} />
      <mesh geometry={headGeo} material={headMat} position={[0, SH / 2 - headH3 / 2, z + 0.0018]} />
      <mesh geometry={islandGeo} material={glass} position={[0, SH / 2 - 0.058, z + 0.0024]} />
      {/* side buttons */}
      <mesh position={[W / 2 + 0.018, 0.45, 0]} material={frame}>
        <boxGeometry args={[0.012, 0.28, 0.03]} />
      </mesh>
      <mesh position={[-W / 2 - 0.018, 0.55, 0]} material={frame}>
        <boxGeometry args={[0.012, 0.16, 0.03]} />
      </mesh>
      {/* rear camera module */}
      <group position={[-0.22, 0.72, -z - 0.001]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={camGeo} material={glass} />
        {[
          [0.09, 0.09],
          [-0.09, -0.09],
        ].map(([x, y]) => (
          <mesh key={x} position={[x, y, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={lens}>
            <cylinderGeometry args={[0.07, 0.075, 0.04, 24]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function HeroPhones({ animate, since, quality }: SlideModelProps) {
  const page = useMemo(() => createSitePage('mobile', quality), [quality]);
  const header = useMemo(() => createSiteHeader('mobile', quality), [quality]);
  const tex2 = useMemo(() => page.texture.clone(), [page]);
  useDispose(page.texture, header.texture, tex2);
  useWarm(page, [page.texture, tex2, header.texture]);
  const frame = useMaterial({ color: '#6d7077', metalness: 1, roughness: 0.28 });
  const frame2 = useMaterial({ color: '#2b2d31', metalness: 0.9, roughness: 0.3 });

  const a = useRef(0);
  const b = useRef(0);
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  const svc = page.sections[2] - header.height + 20;

  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime - since.current : 0;
    a.current = animate
      ? scrollAt(t, [
          { at: 1.5, to: svc, dur: 0.9 },
          { at: 3.0, to: svc + 500, dur: 0.9 },
        ])
      : 0;
    b.current = animate ? scrollAt(t, [{ at: 0.8, to: page.height, dur: 3.4 }], page.sections[1] - header.height) : page.sections[4];
    const k = animate ? clock.elapsedTime : 0;
    if (g1.current) g1.current.position.y = Math.sin(k * 1.1) * 0.05;
    if (g2.current) g2.current.position.y = Math.sin(k * 1.1 + 1.6) * 0.05;
  });

  return (
    <group>
      <group ref={g2}>
        <Phone page={page} pageTex={tex2} headerTex={header.texture} headerH={header.height} scroll={b} frame={frame2} pos={[0.78, 0.2, -0.55]} rot={[-0.42, -0.32, 0.04]} />
      </group>
      <group ref={g1}>
        <Phone page={page} pageTex={page.texture} headerTex={header.texture} headerH={header.height} scroll={a} frame={frame} pos={[-0.55, 0, 0.35]} rot={[-0.42, 0.28, -0.03]} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Civil drawings & chart: a pencil drafts a floor plan on the board   */
/* while a tablet shows the construction schedule                      */
/* ------------------------------------------------------------------ */
export function DraftingDesk({ animate, since, quality }: SlideModelProps) {
  const sheet = useMemo(() => createDrawingSheet(quality), [quality]);
  const chart = useMemo(() => createScheduleChart(quality), [quality]);
  useDispose(sheet.texture, chart.texture);
  useWarm(null, [sheet.texture, chart.texture]);
  const sheetMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: sheet.texture, emissiveMap: sheet.texture, emissive: '#ffffff', emissiveIntensity: 0.22, roughness: 0.9 }),
    [sheet],
  );
  const chartMat = useMemo(() => screenMaterial(chart.texture), [chart]);
  useDispose(sheetMat, chartMat);
  const board = useMaterial({ color: '#1f2125', roughness: 0.55, metalness: 0.2 });
  const alu = useMaterial({ color: '#c9ccd1', metalness: 1, roughness: 0.25 });
  const dark = useMaterial({ color: '#0b0c0e', roughness: 0.25, metalness: 0.4 });
  const body = useMaterial({ color: LIME, roughness: 0.45 });
  const wood = useMaterial({ color: '#d8b98a', roughness: 0.8 });
  const graphite = useMaterial({ color: '#2a2b2e', roughness: 0.4, metalness: 0.5 });
  const paper = useMaterial({ color: '#ece8dc', roughness: 0.9 });
  const acrylic = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#d9f06a', roughness: 0.08, transparent: true, opacity: 0.38, clearcoat: 1 }),
    [],
  );
  useDispose(acrylic);
  const squareGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.2, 0);
    s.lineTo(0, 0.85);
    s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(0.18, 0.12);
    hole.lineTo(0.72, 0.12);
    hole.lineTo(0.18, 0.5);
    hole.closePath();
    s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: false });
  }, []);
  useDispose(squareGeo);

  const SWd = 4.6;
  const SHd = SWd / sheet.aspect;
  const pencil = useRef<THREE.Group>(null);
  const rule = useRef<THREE.Group>(null);
  const pen = useRef(new THREE.Vector3(1.5, 0.4, 1));

  useFrame(({ clock }, dt) => {
    const t = animate ? clock.elapsedTime - since.current : 99;
    const [u, v] = sheet.update(animate ? clamp01((t - 0.25) / 3.2) : 1);
    chart.update(animate ? clamp01((t - 0.2) / 4.4) : 1);
    const tx = (u - 0.5) * SWd;
    const tz = (v - 0.5) * SHd;
    const p = pen.current;
    const d = Math.min(dt, 0.05);
    const dist = Math.hypot(tx - p.x, tz - p.z);
    const done = t > 3.5;
    const lift = done ? 0.35 : 0.004 + Math.min(0.3, dist * 0.9);
    const k = animate ? 22 : 1000;
    p.x = damp(p.x, tx, k, d);
    p.z = damp(p.z, tz, k, d);
    p.y = damp(p.y, lift, animate ? 14 : 1000, d);
    pencil.current?.position.set(p.x, 0.075 + p.y, p.z);
    if (rule.current) rule.current.position.z = damp(rule.current.position.z, Math.min(SHd / 2 - 0.1, tz + 0.16), animate ? 6 : 1000, d);
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* drafting board, raised at the back */}
      <group position={[-0.45, 0, 0.2]} rotation={[0.3, 0, 0]}>
        <RoundedBox args={[5.2, 0.14, 3.8]} radius={0.05} smoothness={3} position={[0, 0, 0]} material={board} castShadow receiveShadow />
        <mesh position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]} material={sheetMat} receiveShadow>
          <planeGeometry args={[SWd, SHd]} />
        </mesh>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} position={[(sx * SWd) / 2 - sx * 0.05, 0.074, (sz * SHd) / 2 - sz * 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.05, 20]} />
              <meshStandardMaterial color="#c9ccd1" metalness={1} roughness={0.3} />
            </mesh>
          )),
        )}
        {/* parallel rule follows the line being drawn */}
        <group ref={rule} position={[0, 0.1, 0.5]}>
          <mesh material={alu} castShadow>
            <boxGeometry args={[5.3, 0.04, 0.16]} />
          </mesh>
          <mesh position={[0, 0.021, -0.03]} rotation={[-Math.PI / 2, 0, 0]} material={dark}>
            <planeGeometry args={[5.2, 0.03]} />
          </mesh>
        </group>
        <mesh geometry={squareGeo} material={acrylic} position={[1.25, 0.08, -0.25]} rotation={[-Math.PI / 2, 0, 0]} castShadow />
        {/* pencil: the tip sits on the drawing point */}
        <group ref={pencil}>
          <group rotation={[0.55, 0, -0.95]}>
            <mesh position={[0, 0.015, 0]} material={graphite}>
              <coneGeometry args={[0.012, 0.03, 12]} />
            </mesh>
            <mesh position={[0, 0.075, 0]} rotation={[Math.PI, 0, 0]} material={wood}>
              <cylinderGeometry args={[0.012, 0.04, 0.09, 6]} />
            </mesh>
            <mesh position={[0, 0.72, 0]} material={body} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
            </mesh>
            <mesh position={[0, 1.36, 0]} material={alu}>
              <cylinderGeometry args={[0.042, 0.042, 0.09, 16]} />
            </mesh>
            <mesh position={[0, 1.44, 0]} material={dark}>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
            </mesh>
          </group>
        </group>
      </group>
      {/* rolled drawings */}
      <group position={[-2.2, 0.05, -2.05]} rotation={[0, 0.25, 0]}>
        {[0, 1].map((i) => (
          <group key={i} position={[0, 0.1 + i * 0.17, i * 0.08]} rotation={[0, 0, Math.PI / 2]}>
            <mesh material={paper} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 2.2, 20]} />
            </mesh>
            <mesh position={[0, 0.5, 0]} material={body}>
              <cylinderGeometry args={[0.104, 0.104, 0.06, 20]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* tablet with the schedule chart */}
      <group position={[2.45, 0.35, -1.25]} rotation={[0, -0.45, 0]}>
        <mesh position={[0, -0.32, 0.25]} rotation={[0.35, 0, 0]} material={dark} castShadow>
          <boxGeometry args={[0.9, 0.06, 0.7]} />
        </mesh>
        <group rotation={[-0.32, 0, 0]} position={[0, 0.55, 0]}>
          <RoundedBox args={[2.36, 1.66, 0.07]} radius={0.06} smoothness={4} material={dark} castShadow />
          <mesh position={[0, 0, 0.036]} material={chartMat}>
            <planeGeometry args={[2.22, 1.51]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
