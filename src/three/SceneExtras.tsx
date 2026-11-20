import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { LIME } from './DevBoard';
import { createWoodTexture } from './screens';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = 'Inter, system-ui, sans-serif';

function useDisposable<T extends { dispose(): void }>(factory: () => T): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const v = useMemo(factory, []);
  useEffect(() => () => v.dispose(), [v]);
  return v;
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/* ================================================================== */
/* School: Smart Parking System (Yantra-built project)                 */
/* ================================================================== */

const SLOT_X = [-1.65, -0.55, 0.55, 1.65];
const SLOT_Z = -0.85;
const LANE_Z = 0.95;
/** Slots that stay occupied; slot 1 is used by the animated car. */
const PARKED = [true, false, true, false];

function Car({ color, refObj, position, rotationY = 0 }: { color: THREE.Material; refObj?: React.Ref<THREE.Group>; position?: [number, number, number]; rotationY?: number }) {
  const tyre = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.8 }));
  const glass = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#1c2630', roughness: 0.1, metalness: 0.4 }));
  const light = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#f5f3ea', emissive: '#f5f3ea', emissiveIntensity: 0.6 }));
  return (
    <group ref={refObj} position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[0.92, 0.2, 0.5]} radius={0.07} smoothness={3} position={[0, 0.17, 0]} material={color} castShadow />
      <RoundedBox args={[0.5, 0.16, 0.44]} radius={0.06} smoothness={3} position={[-0.04, 0.32, 0]} material={glass} castShadow />
      {[
        [0.3, 0.25],
        [-0.3, 0.25],
        [0.3, -0.25],
        [-0.3, -0.25],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.09, z]} rotation={[Math.PI / 2, 0, 0]} material={tyre}>
          <cylinderGeometry args={[0.09, 0.09, 0.07, 20]} />
        </mesh>
      ))}
      {[0.14, -0.14].map((z) => (
        <mesh key={z} position={[0.465, 0.19, z]} material={light}>
          <boxGeometry args={[0.01, 0.04, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

export function SmartParking({ animate }: { animate: boolean }) {
  const lot = useDisposable(() =>
    canvasTexture(1200, 800, (g) => {
      g.fillStyle = '#26282c';
      g.fillRect(0, 0, 1200, 800);
      // subtle asphalt grain
      for (let i = 0; i < 4000; i++) {
        g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`;
        g.fillRect(Math.random() * 1200, Math.random() * 800, 2, 2);
      }
      const px = (x: number) => ((x + 3) / 6) * 1200;
      const pz = (z: number) => ((z + 2) / 4) * 800;
      g.strokeStyle = '#e9e7e0';
      g.lineWidth = 6;
      [-2.2, -1.1, 0, 1.1, 2.2].forEach((x) => {
        g.beginPath();
        g.moveTo(px(x), pz(-1.85));
        g.lineTo(px(x), pz(0.05));
        g.stroke();
      });
      g.beginPath();
      g.moveTo(px(-2.2), pz(-1.85));
      g.lineTo(px(2.2), pz(-1.85));
      g.stroke();
      g.font = `700 46px ${MONO}`;
      g.fillStyle = 'rgba(233,231,224,0.8)';
      g.textAlign = 'center';
      SLOT_X.forEach((x, i) => g.fillText(`P${i + 1}`, px(x), pz(-0.2)));
      // lane arrows
      g.fillStyle = 'rgba(205,242,43,0.75)';
      [-1.6, 0, 1.6].forEach((x) => {
        const cx = px(x);
        const cy = pz(LANE_Z);
        g.beginPath();
        g.moveTo(cx + 36, cy);
        g.lineTo(cx - 10, cy - 22);
        g.lineTo(cx - 10, cy - 8);
        g.lineTo(cx - 40, cy - 8);
        g.lineTo(cx - 40, cy + 8);
        g.lineTo(cx - 10, cy + 8);
        g.lineTo(cx - 10, cy + 22);
        g.closePath();
        g.fill();
      });
      g.setLineDash([30, 22]);
      g.strokeStyle = 'rgba(233,231,224,0.45)';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(px(-3), pz(1.6));
      g.lineTo(px(3), pz(1.6));
      g.stroke();
    }),
  );
  const lotMat = useDisposable(() => new THREE.MeshStandardMaterial({ map: lot, roughness: 0.85 }));
  const base = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#1a1b1e', roughness: 0.7 }));
  const sensorPcb = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#1f3a5a', roughness: 0.45 }));
  const steel = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#cfd2d6', metalness: 1, roughness: 0.25 }));
  const post = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#3a3d43', roughness: 0.5, metalness: 0.4 }));
  const pcb = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#10161c', roughness: 0.5 }));
  const boom = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#efede6', roughness: 0.5 }));
  const boomStripe = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#c2412d', roughness: 0.5 }));
  const wire = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#2c2f35', roughness: 0.5 }));
  const carWhite = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#e7e5df', metalness: 0.4, roughness: 0.3 }));
  const carGraphite = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#3d4148', metalness: 0.6, roughness: 0.3 }));
  const carLime = useDisposable(() => new THREE.MeshStandardMaterial({ color: LIME, metalness: 0.3, roughness: 0.35 }));
  const ledMats = useMemo(
    () => SLOT_X.map(() => new THREE.MeshStandardMaterial({ color: '#222', emissive: LIME, emissiveIntensity: 2, toneMapped: false })),
    [],
  );
  useEffect(() => () => ledMats.forEach((m) => m.dispose()), [ledMats]);

  // display: free-slot counter
  const display = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const g = c.getContext('2d')!;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    let last = -1;
    return {
      tex,
      draw(free: number) {
        if (free === last) return;
        last = free;
        g.fillStyle = '#0b0d10';
        g.fillRect(0, 0, 256, 128);
        g.fillStyle = '#7d8189';
        g.font = `600 22px ${MONO}`;
        g.textAlign = 'center';
        g.fillText('FREE SLOTS', 128, 40);
        g.fillStyle = free > 0 ? LIME : '#ff8a7a';
        g.font = `700 58px ${SANS}`;
        g.fillText(`${free} / 4`, 128, 104);
        tex.needsUpdate = true;
      },
    };
  }, []);
  useEffect(() => () => display.tex.dispose(), [display]);

  const car = useRef<THREE.Group>(null);
  const boomArm = useRef<THREE.Group>(null);
  const wires = useMemo(
    () =>
      SLOT_X.map((x) => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, 0.32, -1.86),
          new THREE.Vector3(x, 0.25, -2.05),
          new THREE.Vector3((x + 2.7) / 2, 0.2, -2.15),
          new THREE.Vector3(2.65, 0.22, -1.95),
        ]);
        return new THREE.TubeGeometry(curve, 40, 0.018, 8, false);
      }),
    [],
  );
  useEffect(() => () => wires.forEach((w) => w.dispose()), [wires]);

  useFrame(({ clock }) => {
    const T = 16;
    const t = animate ? clock.elapsedTime % T : 8;
    const sx = SLOT_X[1];
    let x = -4;
    let z = LANE_Z;
    let ry = 0;
    if (t < 3) {
      x = -4 + (sx + 4) * smooth(t / 3);
    } else if (t < 4.6) {
      const p = smooth((t - 3) / 1.6);
      x = sx;
      z = LANE_Z - 0.4 * p;
      ry = (Math.PI / 2) * p;
    } else if (t < 6) {
      x = sx;
      z = LANE_Z - 0.4 - (LANE_Z - 0.4 - SLOT_Z) * smooth((t - 4.6) / 1.4);
      ry = Math.PI / 2;
    } else if (t < 10) {
      x = sx;
      z = SLOT_Z;
      ry = Math.PI / 2;
    } else if (t < 11.4) {
      x = sx;
      z = SLOT_Z + (LANE_Z - 0.4 - SLOT_Z) * smooth((t - 10) / 1.4);
      ry = Math.PI / 2;
    } else if (t < 12.8) {
      const p = smooth((t - 11.4) / 1.4);
      x = sx;
      z = LANE_Z - 0.4 + 0.4 * p;
      ry = (Math.PI / 2) * (1 - p);
    } else {
      x = sx + (4.2 - sx) * smooth((t - 12.8) / 3.2);
    }
    if (car.current) {
      car.current.position.set(x, 0.12, z);
      car.current.rotation.y = ry;
      car.current.visible = x > -3.4 && x < 3.4;
    }
    // entry barrier lifts while the car approaches
    if (boomArm.current) {
      const open = x > -3.9 && x < -2.1 ? 1 : 0;
      boomArm.current.rotation.z = THREE.MathUtils.lerp(boomArm.current.rotation.z, open * 1.35, 0.12);
    }
    // sensors: slot occupied when a car is within range
    let free = 0;
    SLOT_X.forEach((_, i) => {
      const occupied = PARKED[i] || (i === 1 && z < -0.3);
      ledMats[i].color.set(occupied ? '#3a0f0b' : '#2a3010');
      ledMats[i].emissive.set(occupied ? '#ff5a3c' : LIME);
      if (!occupied) free++;
    });
    display.draw(free);
  });

  return (
    <group position={[0, -0.95, 0]}>
      <RoundedBox args={[6.3, 0.14, 4.4]} radius={0.05} position={[0, 0, 0]} material={base} castShadow receiveShadow />
      <mesh position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]} material={lotMat} receiveShadow>
        <planeGeometry args={[6, 4]} />
      </mesh>

      {/* ultrasonic sensor + status light at each slot */}
      {SLOT_X.map((x, i) => (
        <group key={x} position={[x, 0.07, -1.86]}>
          <mesh position={[0, 0.18, 0]} material={post}>
            <boxGeometry args={[0.06, 0.36, 0.06]} />
          </mesh>
          <mesh position={[0, 0.3, 0.05]} material={sensorPcb} castShadow>
            <boxGeometry args={[0.46, 0.2, 0.03]} />
          </mesh>
          {[-0.12, 0.12].map((dx) => (
            <mesh key={dx} position={[dx, 0.3, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={steel}>
              <cylinderGeometry args={[0.075, 0.075, 0.08, 24]} />
            </mesh>
          ))}
          <mesh position={[0.3, 0.42, 0.02]} material={post}>
            <cylinderGeometry args={[0.025, 0.025, 0.7, 10]} />
          </mesh>
          <mesh position={[0.3, 0.8, 0.02]} material={ledMats[i]}>
            <sphereGeometry args={[0.1, 20, 14]} />
          </mesh>
        </group>
      ))}

      {/* controller + wiring */}
      <group position={[2.7, 0.07, -1.75]}>
        <mesh position={[0, 0.05, 0]} material={pcb} castShadow>
          <boxGeometry args={[0.6, 0.06, 0.45]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} material={post}>
          <boxGeometry args={[0.3, 0.05, 0.12]} />
        </mesh>
      </group>
      {wires.map((g, i) => (
        <mesh key={i} geometry={g} material={wire} />
      ))}

      {/* free-slot display */}
      <group position={[-2.75, 0.07, -0.2]} rotation={[0, Math.PI / 2.4, 0]}>
        <mesh position={[0, 0.45, 0]} material={post}>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
        </mesh>
        <RoundedBox args={[0.8, 0.44, 0.08]} radius={0.03} position={[0, 1.05, 0]} material={post} castShadow />
        <mesh position={[0, 1.05, 0.045]}>
          <planeGeometry args={[0.7, 0.35]} />
          <meshBasicMaterial map={display.tex} toneMapped={false} />
        </mesh>
      </group>

      {/* entry barrier */}
      <group position={[-2.85, 0.07, 1.6]}>
        <mesh position={[0, 0.2, 0]} material={post} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
        </mesh>
        <group ref={boomArm} position={[0, 0.34, 0]}>
          <mesh position={[0, 0, -0.65]} rotation={[Math.PI / 2, 0, 0]} material={boom} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.3, 10]} />
          </mesh>
          {[-0.35, -0.85].map((z) => (
            <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} material={boomStripe}>
              <cylinderGeometry args={[0.032, 0.032, 0.18, 10]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* parked cars + the animated car */}
      <Car color={carWhite} position={[SLOT_X[0], 0.07, SLOT_Z]} rotationY={Math.PI / 2} />
      <Car color={carGraphite} position={[SLOT_X[2], 0.07, SLOT_Z]} rotationY={Math.PI / 2} />
      <Car color={carLime} refObj={car} />
    </group>
  );
}

/* ================================================================== */
/* MBA / Business: reports, analysis and a live dashboard              */
/* ================================================================== */

function reportCover(title: string, sub: string, accent: string) {
  return canvasTexture(512, 680, (g) => {
    g.fillStyle = '#15171b';
    g.fillRect(0, 0, 512, 680);
    g.fillStyle = accent;
    g.fillRect(0, 0, 26, 680);
    g.fillStyle = '#7d8189';
    g.font = `500 22px ${MONO}`;
    g.fillText('YANTRA · PROJECT', 70, 90);
    g.fillStyle = '#e8e6de';
    g.font = `700 52px ${SANS}`;
    title.split('\n').forEach((l, i) => g.fillText(l, 70, 210 + i * 60));
    g.fillStyle = '#9a9da4';
    g.font = `500 24px ${SANS}`;
    g.fillText(sub, 70, 360);
    g.strokeStyle = accent;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(70, 400);
    g.lineTo(200, 400);
    g.stroke();
  });
}

function reportPage(withChart: boolean) {
  return canvasTexture(512, 680, (g) => {
    g.fillStyle = '#f6f4ee';
    g.fillRect(0, 0, 512, 680);
    g.fillStyle = '#1a1b1e';
    g.font = `700 26px ${SANS}`;
    g.fillText(withChart ? '4. Data Analysis' : '3. Research Methodology', 44, 70);
    g.fillStyle = '#c9c6bd';
    for (let i = 0; i < (withChart ? 5 : 15); i++) g.fillRect(44, 104 + i * 26, i % 4 === 3 ? 260 : 420, 9);
    if (withChart) {
      const bars = [0.45, 0.7, 0.55, 0.9, 0.65];
      bars.forEach((b, i) => {
        g.fillStyle = i === 3 ? '#9dbb12' : '#3a3d43';
        g.fillRect(70 + i * 76, 560 - b * 280, 48, b * 280);
      });
      g.strokeStyle = '#1a1b1e';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(56, 270);
      g.lineTo(56, 562);
      g.lineTo(470, 562);
      g.stroke();
      g.fillStyle = '#7d8189';
      g.font = `500 18px ${SANS}`;
      g.fillText('Fig 4.2  Response by category', 120, 610);
    } else {
      g.fillStyle = '#1a1b1e';
      g.font = `600 20px ${SANS}`;
      g.fillText('3.2  Sample design', 44, 530);
      g.fillStyle = '#c9c6bd';
      for (let i = 0; i < 3; i++) g.fillRect(44, 556 + i * 26, 400, 9);
    }
  });
}

export function ReportDesk({ animate }: { animate: boolean }) {
  const wood = useDisposable(() => createWoodTexture(1024));
  const desk = useDisposable(() => new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 }));
  const coverA = useDisposable(() => reportCover('Project\nReport', 'MBA · Finance', LIME));
  const coverB = useDisposable(() => reportCover('Market\nStudy', 'Survey analysis', '#c9a35a'));
  const coverC = useDisposable(() => reportCover('Internship\nReport', 'Documentation', '#8fa3ad'));
  const pageL = useDisposable(() => reportPage(false));
  const pageR = useDisposable(() => reportPage(true));
  const bookSide = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#efede6', roughness: 0.8 }));
  const cover = (map: THREE.Texture) => [bookSide, bookSide, new THREE.MeshStandardMaterial({ map, roughness: 0.45 }), bookSide, bookSide, bookSide];
  const matsA = useMemo(() => cover(coverA), [coverA]); // eslint-disable-line react-hooks/exhaustive-deps
  const matsB = useMemo(() => cover(coverB), [coverB]); // eslint-disable-line react-hooks/exhaustive-deps
  const matsC = useMemo(() => cover(coverC), [coverC]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => [matsA, matsB, matsC].forEach((m) => (m[2] as THREE.Material).dispose()), [matsA, matsB, matsC]);
  const pageLMat = useDisposable(() => new THREE.MeshStandardMaterial({ map: pageL, roughness: 0.9, side: THREE.DoubleSide }));
  const pageRMat = useDisposable(() => new THREE.MeshStandardMaterial({ map: pageR, roughness: 0.9, side: THREE.DoubleSide }));
  const blank = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#f6f4ee', roughness: 0.9, side: THREE.DoubleSide }));
  const shell = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#2c2f35', metalness: 0.7, roughness: 0.35 }));
  const pen = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#15171b', metalness: 0.5, roughness: 0.3 }));
  const penTip = useDisposable(() => new THREE.MeshStandardMaterial({ color: LIME, roughness: 0.4 }));

  // live dashboard on the tablet
  const dash = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 440;
    const g = c.getContext('2d')!;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    let last = -1;
    return {
      tex,
      draw(step: number, p: number) {
        const key = step * 100 + Math.round(p * 30);
        if (key === last) return;
        last = key;
        g.fillStyle = '#0b0d10';
        g.fillRect(0, 0, 640, 440);
        g.fillStyle = '#e8e6de';
        g.font = `700 28px ${SANS}`;
        g.fillText('Analysis dashboard', 32, 52);
        g.fillStyle = '#7d8189';
        g.font = `500 16px ${MONO}`;
        g.fillText('SURVEY RESPONSES · BY SEGMENT', 32, 82);
        const vals = [0.5, 0.72, 0.6, 0.85, 0.68, 0.78].map((v, i) => Math.max(0.15, Math.min(0.95, v + Math.sin(step + i) * 0.08)));
        vals.forEach((v, i) => {
          const h = v * 210 * p;
          g.fillStyle = i === 3 ? LIME : '#3a3d43';
          g.fillRect(40 + i * 62, 330 - h, 40, h);
        });
        g.strokeStyle = '#2a2d32';
        g.beginPath();
        g.moveTo(32, 331);
        g.lineTo(420, 331);
        g.stroke();
        // KPI tiles
        [
          ['Responses', '120'],
          ['Positive', '68%'],
        ].forEach(([k, v], i) => {
          g.fillStyle = '#15181c';
          g.fillRect(448, 110 + i * 110, 160, 92);
          g.fillStyle = '#7d8189';
          g.font = `500 15px ${MONO}`;
          g.fillText(k.toUpperCase(), 464, 140 + i * 110);
          g.fillStyle = i ? LIME : '#e8e6de';
          g.font = `700 34px ${SANS}`;
          g.fillText(v, 464, 182 + i * 110);
        });
        g.fillStyle = '#7d8189';
        g.font = `500 14px ${SANS}`;
        g.fillText('Illustrative sample data', 32, 400);
        tex.needsUpdate = true;
      },
    };
  }, []);
  useEffect(() => () => dash.tex.dispose(), [dash]);

  const flip = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : 3;
    const cycle = t % 6;
    dash.draw(Math.floor(t / 6), smooth(cycle / 1.2));
    if (flip.current) flip.current.rotation.z = animate ? Math.PI * smooth((cycle - 3.5) / 1.4) : 0;
  });

  const PW = 1.25;
  const PD = 1.7;
  return (
    <group position={[0, -0.85, 0]}>
      <RoundedBox args={[7.4, 0.16, 4.2]} radius={0.06} smoothness={3} position={[0, -0.08, 0]} material={desk} receiveShadow castShadow />

      {/* stack of bound reports */}
      <group position={[-2.1, 0, -0.3]} rotation={[0, 0.25, 0]}>
        <mesh position={[0, 0.06, 0]} material={matsC} castShadow>
          <boxGeometry args={[1.5, 0.12, 2.0]} />
        </mesh>
        <mesh position={[0.06, 0.18, 0.04]} rotation={[0, -0.08, 0]} material={matsB} castShadow>
          <boxGeometry args={[1.5, 0.12, 2.0]} />
        </mesh>
        <mesh position={[0.02, 0.3, -0.02]} rotation={[0, 0.05, 0]} material={matsA} castShadow>
          <boxGeometry args={[1.5, 0.12, 2.0]} />
        </mesh>
      </group>

      {/* open report with a page that turns */}
      <group position={[0.55, 0.02, 0.35]} rotation={[0, -0.12, 0]}>
        <mesh position={[0, 0.01, 0]} material={shell}>
          <boxGeometry args={[PW * 2 + 0.1, 0.02, PD + 0.1]} />
        </mesh>
        <mesh position={[-PW / 2, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pageLMat} receiveShadow>
          <planeGeometry args={[PW, PD]} />
        </mesh>
        <mesh position={[PW / 2, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pageRMat} receiveShadow>
          <planeGeometry args={[PW, PD]} />
        </mesh>
        <group ref={flip} position={[0, 0.04, 0]}>
          <mesh position={[PW / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={blank} castShadow>
            <planeGeometry args={[PW, PD]} />
          </mesh>
        </group>
      </group>

      {/* tablet with live dashboard */}
      <group position={[2.55, 0.02, -0.55]} rotation={[0, -0.45, 0]}>
        <mesh position={[0, 0.04, 0.25]} material={shell} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.5]} />
        </mesh>
        <group position={[0, 0.08, 0]} rotation={[-0.35, 0, 0]}>
          <RoundedBox args={[1.7, 1.2, 0.06]} radius={0.06} smoothness={3} position={[0, 0.6, 0]} material={shell} castShadow />
          <mesh position={[0, 0.6, 0.031]}>
            <planeGeometry args={[1.58, 1.08]} />
            <meshBasicMaterial map={dash.tex} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* pen */}
      <group position={[1.9, 0.05, 1.45]} rotation={[0, 0.5, Math.PI / 2]}>
        <mesh material={pen} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.9, 14]} />
        </mesh>
        <mesh position={[0, 0.47, 0]} material={penTip}>
          <coneGeometry args={[0.035, 0.08, 14]} />
        </mesh>
      </group>
    </group>
  );
}
