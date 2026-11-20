import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { LIME } from './DevBoard';
import { createCodeScreen, createKeyboardTexture, createPhoneScreen, createSitePlanTexture } from './screens';

function useDispose(...items: { dispose(): void }[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => items.forEach((i) => i.dispose()), items);
}

/* ------------------------------------------------------------------ */
/* Software: laptop with code editor + phone with responsive app UI    */
/* ------------------------------------------------------------------ */
export function Workstation() {
  const code = useMemo(() => createCodeScreen(1024), []);
  const phone = useMemo(() => createPhoneScreen(360), []);
  const keys = useMemo(() => createKeyboardTexture(1024), []);
  useDispose(code, phone, keys);

  const shell = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b3e44', metalness: 0.85, roughness: 0.38 }), []);
  const bezel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0a0b0d', roughness: 0.25, metalness: 0.2 }), []);
  useDispose(shell, bezel);

  const W = 3.4;
  const D = 2.25;
  return (
    <group position={[-0.35, -0.55, 0]}>
      {/* base */}
      <RoundedBox args={[W, 0.12, D]} radius={0.05} smoothness={4} position={[0, 0.06, 0]} material={shell} castShadow />
      <mesh position={[0, 0.122, -0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.86, W * 0.86 * 0.38]} />
        <meshStandardMaterial map={keys} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.122, 0.72]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.25, 0.6]} />
        <meshStandardMaterial color="#45484e" metalness={0.6} roughness={0.25} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group position={[0, 0.12, -D / 2 + 0.02]} rotation={[-0.22, 0, 0]}>
        <RoundedBox args={[W, D * 0.98, 0.07]} radius={0.04} smoothness={4} position={[0, D * 0.49, -0.035]} material={shell} castShadow />
        <mesh position={[0, D * 0.49, 0.002]}>
          <planeGeometry args={[W - 0.08, D * 0.98 - 0.08]} />
          <primitive object={bezel} attach="material" />
        </mesh>
        <mesh position={[0, D * 0.5, 0.004]}>
          <planeGeometry args={[W - 0.24, (W - 0.24) * 0.64]} />
          <meshStandardMaterial map={code} emissiveMap={code} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.15} />
        </mesh>
      </group>
      {/* phone on a stand */}
      <group position={[2.35, 0, 0.35]} rotation={[0, -0.45, 0]}>
        <mesh position={[0, 0.03, 0]} material={shell} castShadow>
          <boxGeometry args={[0.7, 0.06, 0.5]} />
        </mesh>
        <group position={[0, 0.06, -0.05]} rotation={[-0.32, 0, 0]}>
          <RoundedBox args={[0.78, 1.6, 0.07]} radius={0.08} smoothness={4} position={[0, 0.8, 0]} material={bezel} castShadow />
          <mesh position={[0, 0.8, 0.036]}>
            <planeGeometry args={[0.7, 1.5]} />
            <meshStandardMaterial map={phone} emissiveMap={phone} emissive="#ffffff" emissiveIntensity={0.85} roughness={0.15} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mechanical: meshing spur gear train on bearing blocks               */
/* ------------------------------------------------------------------ */
function gearGeometry(teeth: number, module: number, width: number, bore: number, lightening = 0) {
  const rp = (module * teeth) / 2;
  const ra = rp + module;
  const rf = rp - 1.25 * module;
  const step = (Math.PI * 2) / teeth;
  const shape = new THREE.Shape();
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [rf, a],
      [rf, a + step * 0.12],
      [rp, a + step * 0.2],
      [ra, a + step * 0.3],
      [ra, a + step * 0.45],
      [rp, a + step * 0.55],
      [rf, a + step * 0.63],
    ];
    pts.forEach(([r, ang], j) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && j === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, bore, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  for (let i = 0; i < lightening; i++) {
    const a = (i / lightening) * Math.PI * 2 + Math.PI / lightening;
    const r = (rf + bore) / 2;
    const h = new THREE.Path();
    h.absarc(Math.cos(a) * r, Math.sin(a) * r, (rf - bore) * 0.26, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.translate(0, 0, -width / 2);
  return { geo, rp };
}

export function GearAssembly({ animate }: { animate: boolean }) {
  const m = 0.1;
  const big = useMemo(() => gearGeometry(28, m, 0.32, 0.16, 5), []);
  const small = useMemo(() => gearGeometry(14, m, 0.36, 0.11), []);
  useDispose(big.geo, small.geo);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c3c6cb', metalness: 1, roughness: 0.3 }), []);
  const oxide = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7a7e86', metalness: 0.95, roughness: 0.34 }), []);
  const plate = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a4d53', metalness: 0.8, roughness: 0.42 }), []);
  const accent = useMemo(() => new THREE.MeshStandardMaterial({ color: LIME, metalness: 0.4, roughness: 0.35 }), []);
  useDispose(steel, oxide, plate, accent);

  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const centre = big.rp + small.rp;
  const axisY = 1.6;
  useFrame((_, dt) => {
    if (!animate || !a.current || !b.current) return;
    a.current.rotation.z += dt * 0.35;
    b.current.rotation.z -= dt * 0.35 * (28 / 14);
  });
  const xA = -centre / 2;
  const xB = centre / 2;
  const block = (x: number, z: number) => (
    <group key={`${x}${z}`} position={[x, 0, z]}>
      <RoundedBox args={[0.6, axisY - 0.05, 0.3]} radius={0.04} position={[0, (axisY - 0.05) / 2 + 0.12, 0]} material={oxide} castShadow />
      <mesh position={[0, axisY, 0]} rotation={[Math.PI / 2, 0, 0]} material={steel} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.32, 32]} />
      </mesh>
    </group>
  );
  return (
    <group position={[0, -0.9, 0]}>
      <RoundedBox args={[4.6, 0.22, 2.4]} radius={0.05} position={[0, 0.0, 0]} material={plate} castShadow receiveShadow />
      {[
        [-2.05, -0.95],
        [2.05, -0.95],
        [-2.05, 0.95],
        [2.05, 0.95],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.15, z]} material={steel} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 6]} />
        </mesh>
      ))}
      {block(xA, -0.75)}
      {block(xA, 0.75)}
      {block(xB, -0.75)}
      {block(xB, 0.75)}
      {/* shafts */}
      {[xA, xB].map((x) => (
        <mesh key={x} position={[x, axisY, 0]} rotation={[Math.PI / 2, 0, 0]} material={steel} castShadow>
          <cylinderGeometry args={[x === xA ? 0.15 : 0.1, x === xA ? 0.15 : 0.1, 2.1, 32]} />
        </mesh>
      ))}
      {/* initial phases: a tooth gap of the large gear faces a tooth of the pinion at the contact point */}
      <mesh ref={a} position={[xA, axisY, 0]} rotation={[0, 0, (0.125 * Math.PI * 2) / 28]} geometry={big.geo} material={oxide} castShadow />
      <mesh ref={b} position={[xB, axisY, 0]} rotation={[0, 0, Math.PI - (0.375 * Math.PI * 2) / 14]} geometry={small.geo} material={steel} castShadow />
      {/* lime shaft collar */}
      <mesh position={[xA, axisY, 0.3]} rotation={[Math.PI / 2, 0, 0]} material={accent} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.12, 32]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Civil: architectural massing model on a site plan, with tower crane */
/* ------------------------------------------------------------------ */
export function BuildingModel() {
  const plan = useMemo(() => createSitePlanTexture(1024), []);
  useDispose(plan);
  const concrete = useMemo(() => new THREE.MeshStandardMaterial({ color: '#dcd9d2', roughness: 0.85 }), []);
  const column = useMemo(() => new THREE.MeshStandardMaterial({ color: '#bdb9b1', roughness: 0.8 }), []);
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#8fa3ad', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.42, clearcoat: 1 }),
    [],
  );
  const crane = useMemo(() => new THREE.MeshStandardMaterial({ color: LIME, roughness: 0.5, metalness: 0.3 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a2c30', roughness: 0.6 }), []);
  useDispose(concrete, column, glass, crane, dark);

  const floors = 5;
  const fh = 0.5;
  const bw = 2.4;
  const bd = 1.5;
  const cols: [number, number][] = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) cols.push([-bw / 2 + 0.08 + (i * (bw - 0.16)) / 3, -bd / 2 + 0.08 + (j * (bd - 0.16)) / 2]);
  const glazed = 3; // upper floors left as exposed frame (under construction)

  return (
    <group position={[0, -1.1, 0]}>
      <mesh position={[0, 0.06, 0]} material={dark} receiveShadow castShadow>
        <boxGeometry args={[5, 0.12, 4]} />
      </mesh>
      <mesh position={[0, 0.121, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.9, 3.9]} />
        <meshStandardMaterial map={plan} roughness={0.9} />
      </mesh>
      <group position={[-0.3, 0.12, -0.2]}>
        {Array.from({ length: floors + 1 }, (_, f) => (
          <mesh key={f} position={[0, f * fh + 0.03, 0]} material={concrete} castShadow receiveShadow>
            <boxGeometry args={[bw + 0.1, 0.06, bd + 0.1]} />
          </mesh>
        ))}
        {Array.from({ length: floors }, (_, f) =>
          cols.map(([x, z], k) => (
            <mesh key={`${f}-${k}`} position={[x, f * fh + fh / 2 + 0.03, z]} material={column} castShadow>
              <boxGeometry args={[0.07, fh - 0.06, 0.07]} />
            </mesh>
          )),
        )}
        {Array.from({ length: glazed }, (_, f) => (
          <mesh key={`g${f}`} position={[0, f * fh + fh / 2 + 0.03, 0]} material={glass}>
            <boxGeometry args={[bw - 0.02, fh - 0.07, bd - 0.02]} />
          </mesh>
        ))}
        {/* core */}
        <mesh position={[0.65, (floors * fh) / 2 + 0.2, 0]} material={concrete} castShadow>
          <boxGeometry args={[0.5, floors * fh + 0.4, 0.5]} />
        </mesh>
      </group>
      {/* tower crane */}
      <group position={[1.85, 0.12, -1.35]} scale={0.78}>
        <mesh position={[0, 0.05, 0]} material={dark}>
          <boxGeometry args={[0.36, 0.1, 0.36]} />
        </mesh>
        <mesh position={[0, 1.9, 0]} material={crane} castShadow>
          <boxGeometry args={[0.12, 3.8, 0.12]} />
        </mesh>
        <group position={[0, 3.75, 0]} rotation={[0, 0.65, 0]}>
          <mesh position={[-1.1, 0, 0]} material={crane} castShadow>
            <boxGeometry args={[2.8, 0.09, 0.1]} />
          </mesh>
          <mesh position={[0.55, 0, 0]} material={crane}>
            <boxGeometry args={[0.9, 0.08, 0.1]} />
          </mesh>
          <mesh position={[0.85, -0.12, 0]} material={dark} castShadow>
            <boxGeometry args={[0.3, 0.22, 0.22]} />
          </mesh>
          <mesh position={[0, 0.3, 0]} material={crane}>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
          </mesh>
          <mesh position={[-1.9, -0.6, 0]} material={dark}>
            <cylinderGeometry args={[0.008, 0.008, 1.2, 6]} />
          </mesh>
          <mesh position={[-1.9, -1.24, 0]} material={dark} castShadow>
            <boxGeometry args={[0.1, 0.08, 0.1]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
