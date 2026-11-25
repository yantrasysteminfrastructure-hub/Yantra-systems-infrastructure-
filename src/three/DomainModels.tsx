import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { LIME } from './DevBoard';
import { createCodeScreen, createKeyboardTexture, createPhoneScreen, createSitePlanTexture, createWoodTexture } from './screens';

export function useDispose(...items: { dispose(): void }[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => items.forEach((i) => i.dispose()), items);
}

export function useMaterial(params: THREE.MeshStandardMaterialParameters) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const m = useMemo(() => new THREE.MeshStandardMaterial(params), []);
  useDispose(m);
  return m;
}

/** Wire between points, drawn as a smooth tube. */
function Wire({ points, material, radius = 0.028 }: { points: [number, number, number][]; material: THREE.Material; radius?: number }) {
  const geo = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 64, radius, 10, false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useDispose(geo);
  return <mesh geometry={geo} material={material} castShadow />;
}

/* ------------------------------------------------------------------ */
/* Software: desk with laptop (live coding), phone (live dashboard)    */
/* and the microcontroller board the code is written for               */
/* ------------------------------------------------------------------ */
export function Workstation({ animate }: { animate: boolean }) {
  const code = useMemo(() => createCodeScreen(1024), []);
  const phone = useMemo(() => createPhoneScreen(360), []);
  const keys = useMemo(() => createKeyboardTexture(1024), []);
  const wood = useMemo(() => createWoodTexture(1024), []);
  useDispose(code.texture, phone.texture, keys, wood);

  const shell = useMaterial({ color: '#4a4d53', metalness: 0.9, roughness: 0.32 });
  const bezel = useMaterial({ color: '#0a0b0d', roughness: 0.2, metalness: 0.3 });
  const mat = useMaterial({ color: '#17181b', roughness: 0.9 });
  const pcb = useMaterial({ color: '#111418', roughness: 0.5 });
  const steel = useMaterial({ color: '#c9ccd1', metalness: 1, roughness: 0.3 });
  const led = useMaterial({ color: '#2a3010', emissive: LIME, emissiveIntensity: 2, toneMapped: false });
  const desk = useMemo(() => new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55, metalness: 0 }), [wood]);
  useDispose(desk);
  const screenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: code.texture, emissiveMap: code.texture, emissive: '#ffffff', emissiveIntensity: 0.95, roughness: 0.12 }),
    [code],
  );
  const phoneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: phone.texture, emissiveMap: phone.texture, emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.12 }),
    [phone],
  );
  useDispose(screenMat, phoneMat);

  const lid = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : 30;
    code.update(t);
    phone.update(t);
    led.emissiveIntensity = animate && Math.floor(t * 2) % 2 ? 0.2 : 2.2;
  });

  const W = 3.4;
  const D = 2.25;
  return (
    <group position={[-0.2, -0.75, 0]}>
      {/* desk + mat */}
      <RoundedBox args={[7.6, 0.16, 4.2]} radius={0.06} smoothness={3} position={[0.3, -0.08, 0.1]} material={desk} receiveShadow castShadow />
      <RoundedBox args={[4.6, 0.02, 3.0]} radius={0.01} position={[-0.1, 0.01, 0.2]} material={mat} receiveShadow />

      {/* laptop base */}
      <RoundedBox args={[W, 0.12, D]} radius={0.05} smoothness={4} position={[-0.1, 0.08, 0.15]} material={shell} castShadow />
      <mesh position={[-0.1, 0.142, -0.07]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.86, W * 0.86 * 0.38]} />
        <meshStandardMaterial map={keys} roughness={0.7} />
      </mesh>
      <mesh position={[-0.1, 0.142, 0.87]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.25, 0.6]} />
        <meshStandardMaterial color="#55585e" metalness={0.6} roughness={0.22} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group ref={lid} position={[-0.1, 0.14, 0.15 - D / 2 + 0.02]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[W, D * 0.98, 0.07]} radius={0.04} smoothness={4} position={[0, D * 0.49, -0.035]} material={shell} castShadow />
        <mesh position={[0, D * 0.49, 0.002]} material={bezel}>
          <planeGeometry args={[W - 0.08, D * 0.98 - 0.08]} />
        </mesh>
        <mesh position={[0, D * 0.5, 0.004]} material={screenMat}>
          <planeGeometry args={[W - 0.24, (W - 0.24) * 0.64]} />
        </mesh>
      </group>

      {/* phone on a stand */}
      <group position={[2.6, 0.02, -0.1]} rotation={[0, -0.5, 0]}>
        <RoundedBox args={[0.72, 0.08, 0.55]} radius={0.03} position={[0, 0.04, 0]} material={shell} castShadow />
        <group position={[0, 0.08, -0.05]} rotation={[-0.3, 0, 0]}>
          <RoundedBox args={[0.8, 1.62, 0.08]} radius={0.09} smoothness={4} position={[0, 0.81, 0]} material={bezel} castShadow />
          <mesh position={[0, 0.81, 0.041]} material={phoneMat}>
            <planeGeometry args={[0.71, 1.52]} />
          </mesh>
        </group>
      </group>

      {/* the ESP32 board the firmware runs on, with USB cable */}
      <group position={[2.35, 0.03, 1.35]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.03, 0]} material={pcb} castShadow>
          <boxGeometry args={[1.1, 0.05, 0.5]} />
        </mesh>
        <mesh position={[0.18, 0.1, 0]} material={steel} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.38]} />
        </mesh>
        <mesh position={[-0.3, 0.075, 0.12]} material={led}>
          <boxGeometry args={[0.06, 0.03, 0.04]} />
        </mesh>
        <mesh position={[-0.52, 0.08, 0]} material={steel}>
          <boxGeometry args={[0.12, 0.07, 0.2]} />
        </mesh>
      </group>
      <Wire
        material={bezel}
        radius={0.03}
        points={[
          [1.77, 0.08, 1.12],
          [1.4, 0.05, 1.3],
          [1.6, 0.03, 1.7],
          [2.2, 0.03, 1.9],
          [3.4, 0.03, 1.8],
        ]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Electrical: microcontroller switches a relay that drives a DC motor */
/* ------------------------------------------------------------------ */
export function MotorRig({ animate }: { animate: boolean }) {
  const base = useMaterial({ color: '#1d1f23', roughness: 0.35, metalness: 0.1 });
  const brass = useMaterial({ color: '#c9a35a', metalness: 1, roughness: 0.3 });
  const pcb = useMaterial({ color: '#10161c', roughness: 0.5 });
  const plastic = useMaterial({ color: '#131416', roughness: 0.55 });
  const relayBody = useMaterial({ color: '#1f3550', roughness: 0.4 });
  const terminal = useMaterial({ color: '#2e3237', roughness: 0.5 });
  const steel = useMaterial({ color: '#cfd2d6', metalness: 1, roughness: 0.26 });
  const can = useMaterial({ color: '#b9bdc3', metalness: 1, roughness: 0.22 });
  const cell = useMaterial({ color: '#24364a', roughness: 0.35, metalness: 0.2 });
  const blade = useMaterial({ color: '#e6e4dd', roughness: 0.45 });
  const lime = useMaterial({ color: LIME, roughness: 0.4 });
  const wireRed = useMaterial({ color: '#8c2b22', roughness: 0.5 });
  const wireBlk = useMaterial({ color: '#1a1b1e', roughness: 0.5 });
  const wireLime = useMaterial({ color: LIME, roughness: 0.45 });
  const relayLed = useMaterial({ color: '#2a3010', emissive: LIME, emissiveIntensity: 0, toneMapped: false });
  const pwrLed = useMaterial({ color: '#2a3010', emissive: LIME, emissiveIntensity: 2.2, toneMapped: false });

  const fan = useRef<THREE.Group>(null);
  const armature = useRef<THREE.Mesh>(null);
  const speed = useRef(0);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const on = animate ? t % 5 < 3 : true;
    relayLed.emissiveIntensity = on ? 2.6 : 0.05;
    if (armature.current) armature.current.position.y = on ? 0.5 : 0.53;
    const target = on ? 22 : 0;
    speed.current += (target - speed.current) * Math.min(1, dt * (on ? 1.4 : 0.8));
    if (fan.current) fan.current.rotation.x += speed.current * Math.min(dt, 0.05) * (animate ? 1 : 0);
  });

  return (
    <group position={[0, -0.7, 0]}>
      {/* mounting plate on brass standoffs */}
      <RoundedBox args={[6, 0.1, 3.6]} radius={0.05} position={[0, 0.2, 0]} material={base} castShadow receiveShadow />
      {[
        [-2.8, -1.6],
        [2.8, -1.6],
        [-2.8, 1.6],
        [2.8, 1.6],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.08, z]} material={brass}>
          <cylinderGeometry args={[0.07, 0.07, 0.16, 6]} />
        </mesh>
      ))}

      <group position={[0, 0.25, 0]}>
        {/* battery pack: 2 cells in a holder */}
        <group position={[-1.9, 0, 0.95]}>
          <mesh position={[0, 0.12, 0]} material={plastic} castShadow>
            <boxGeometry args={[1.25, 0.24, 0.9]} />
          </mesh>
          {[-0.2, 0.2].map((z) => (
            <group key={z} position={[0, 0.3, z]} rotation={[0, 0, Math.PI / 2]}>
              <mesh material={cell} castShadow>
                <cylinderGeometry args={[0.17, 0.17, 1.0, 32]} />
              </mesh>
              <mesh position={[0, 0.51, 0]} material={steel}>
                <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
              </mesh>
            </group>
          ))}
        </group>

        {/* microcontroller board */}
        <group position={[-1.75, 0, -0.75]}>
          <mesh position={[0, 0.04, 0]} material={pcb} castShadow>
            <boxGeometry args={[1.5, 0.06, 1.0]} />
          </mesh>
          <mesh position={[0.15, 0.11, 0.05]} material={plastic} castShadow>
            <boxGeometry args={[0.6, 0.08, 0.22]} />
          </mesh>
          <mesh position={[-0.66, 0.13, -0.18]} material={steel} castShadow>
            <boxGeometry args={[0.3, 0.16, 0.32]} />
          </mesh>
          <mesh position={[0, 0.12, -0.42]} material={plastic}>
            <boxGeometry args={[1.2, 0.12, 0.1]} />
          </mesh>
          <mesh position={[0.5, 0.085, 0.36]} material={pwrLed}>
            <boxGeometry args={[0.06, 0.03, 0.04]} />
          </mesh>
        </group>

        {/* relay module */}
        <group position={[0.15, 0, -0.6]}>
          <mesh position={[0, 0.04, 0]} material={pcb} castShadow>
            <boxGeometry args={[1.0, 0.06, 1.3]} />
          </mesh>
          <mesh position={[0, 0.3, -0.12]} material={relayBody} castShadow>
            <boxGeometry args={[0.62, 0.48, 0.78]} />
          </mesh>
          <mesh ref={armature} position={[0, 0.53, -0.12]} material={steel}>
            <boxGeometry args={[0.2, 0.02, 0.3]} />
          </mesh>
          <mesh position={[0, 0.14, 0.48]} material={terminal} castShadow>
            <boxGeometry args={[0.8, 0.22, 0.26]} />
          </mesh>
          {[-0.26, 0, 0.26].map((x) => (
            <mesh key={x} position={[x, 0.255, 0.48]} material={steel}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            </mesh>
          ))}
          <mesh position={[0.36, 0.085, -0.5]} material={relayLed}>
            <boxGeometry args={[0.07, 0.03, 0.05]} />
          </mesh>
        </group>

        {/* DC motor on an L-bracket with a fan */}
        <group position={[1.75, 0, 0.45]}>
          <mesh position={[-0.1, 0.03, 0]} material={steel} castShadow>
            <boxGeometry args={[1.0, 0.04, 0.7]} />
          </mesh>
          <mesh position={[0.38, 0.4, 0]} material={steel} castShadow>
            <boxGeometry args={[0.04, 0.8, 0.7]} />
          </mesh>
          <group position={[-0.15, 0.46, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh material={can} castShadow>
              <cylinderGeometry args={[0.36, 0.36, 1.0, 40]} />
            </mesh>
            <mesh position={[0, -0.53, 0]} material={plastic}>
              <cylinderGeometry args={[0.3, 0.3, 0.08, 32]} />
            </mesh>
            <mesh position={[0, 0.75, 0]} material={steel}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
            </mesh>
          </group>
          <group ref={fan} position={[0.78, 0.46, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={lime} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.12, 24]} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <group key={i} rotation={[(i * Math.PI * 2) / 3, 0, 0]}>
                <mesh position={[0, 0.42, 0]} rotation={[0, 0.35, 0]} material={blade} castShadow>
                  <boxGeometry args={[0.03, 0.7, 0.2]} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>

      {/* wiring */}
      <Wire material={wireRed} points={[[-1.25, 0.6, 0.75], [-0.8, 0.95, 0.6], [-0.1, 0.9, 0.3], [-0.1, 0.62, -0.12]]} />
      <Wire material={wireRed} points={[[0.25, 0.62, -0.12], [0.6, 0.95, 0.1], [1.2, 0.95, 0.35], [1.35, 0.9, 0.45]]} />
      <Wire material={wireBlk} points={[[-1.25, 0.6, 1.15], [-0.5, 0.9, 1.5], [0.8, 0.9, 1.2], [1.3, 0.9, 0.62]]} />
      <Wire material={wireLime} points={[[-1.4, 0.45, -1.17], [-0.9, 0.85, -1.4], [-0.3, 0.75, -1.3], [-0.2, 0.45, -1.15]]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mechanical: gear train driving a crank–slider (piston) mechanism    */
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
  const steel = useMaterial({ color: '#c8cbd0', metalness: 1, roughness: 0.26 });
  const oxide = useMaterial({ color: '#7a7e86', metalness: 0.95, roughness: 0.32 });
  const plate = useMaterial({ color: '#45484e', metalness: 0.85, roughness: 0.4 });
  const accent = useMaterial({ color: LIME, metalness: 0.3, roughness: 0.35 });
  const dark = useMaterial({ color: '#3b3e44', metalness: 0.75, roughness: 0.4 });

  const centre = big.rp + small.rp; // 2.1
  const axisY = 1.6;
  const xA = -1.45;
  const xB = xA + centre;
  const crankR = 0.36;
  const rodL = 1.5;
  const zFront = 0.62;

  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Group>(null);
  const rod = useRef<THREE.Mesh>(null);
  const piston = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const crankPin = useRef<THREE.Mesh>(null);
  const tmpA = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    if (animate) angle.current += Math.min(dt, 0.05) * 0.5;
    const thA = angle.current;
    const thB = -thA * (28 / 14);
    if (a.current) a.current.rotation.z = (0.125 * Math.PI * 2) / 28 + thA;
    if (b.current) b.current.rotation.z = Math.PI - (0.375 * Math.PI * 2) / 14 + thB;
    // crank–slider kinematics (crank pin on the pinion shaft disc)
    const th = thB;
    const pinX = xB + crankR * Math.cos(th);
    const pinY = axisY + crankR * Math.sin(th);
    const dy = pinY - axisY;
    const slideX = pinX + Math.sqrt(rodL * rodL - dy * dy);
    if (piston.current) piston.current.position.x = slideX;
    if (rod.current) {
      tmpA.set((pinX + slideX) / 2, (pinY + axisY) / 2, zFront);
      rod.current.position.copy(tmpA);
      rod.current.rotation.z = Math.atan2(axisY - pinY, slideX - pinX);
    }
    // crank disc pin follows the pinion
    if (crankPin.current) crankPin.current.position.set(pinX, pinY, zFront - 0.06);
  });

  const block = (x: number, z: number) => (
    <group key={`${x}${z}`} position={[x, 0, z]}>
      <RoundedBox args={[0.6, axisY - 0.05, 0.3]} radius={0.04} position={[0, (axisY - 0.05) / 2 + 0.12, 0]} material={dark} castShadow />
      <mesh position={[0, axisY, 0]} rotation={[Math.PI / 2, 0, 0]} material={steel} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.32, 32]} />
      </mesh>
    </group>
  );

  return (
    <group position={[-0.2, -1.0, 0]}>
      <RoundedBox args={[6.2, 0.22, 2.6]} radius={0.05} position={[0.5, 0, 0]} material={plate} castShadow receiveShadow />
      {[
        [-2.4, -1.05],
        [3.4, -1.05],
        [-2.4, 1.05],
        [3.4, 1.05],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.15, z]} material={steel} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 6]} />
        </mesh>
      ))}
      {block(xA, -0.75)}
      {block(xA, 0.45)}
      {block(xB, -0.75)}
      {block(xB, 0.2)}
      <mesh position={[xA, axisY, 0]} rotation={[Math.PI / 2, 0, 0]} material={steel} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.7, 32]} />
      </mesh>
      {/* pinion shaft stops at the crank disc so the rod can sweep past */}
      <mesh position={[xB, axisY, -0.18]} rotation={[Math.PI / 2, 0, 0]} material={steel} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.35, 32]} />
      </mesh>
      <mesh ref={a} position={[xA, axisY, -0.15]} geometry={big.geo} material={oxide} castShadow />
      <group ref={b} position={[xB, axisY, -0.15]}>
        <mesh geometry={small.geo} material={steel} castShadow />
      </group>
      <mesh position={[xA, axisY, 0.25]} rotation={[Math.PI / 2, 0, 0]} material={accent} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.12, 32]} />
      </mesh>

      {/* crank disc on the pinion shaft */}
      <mesh position={[xB, axisY, zFront - 0.12]} rotation={[Math.PI / 2, 0, 0]} material={oxide} castShadow>
        <cylinderGeometry args={[crankR + 0.14, crankR + 0.14, 0.08, 40]} />
      </mesh>
      <mesh ref={crankPin} rotation={[Math.PI / 2, 0, 0]} material={steel}>
        <cylinderGeometry args={[0.06, 0.06, 0.16, 16]} />
      </mesh>
      {/* connecting rod */}
      <mesh ref={rod} material={accent} castShadow>
        <boxGeometry args={[rodL, 0.12, 0.06]} />
      </mesh>
      {/* cylinder guide + piston */}
      <group position={[0, axisY, zFront]}>
        <mesh position={[xB + rodL + 0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steel} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 1.2, 40, 1, true]} />
        </mesh>
        <mesh position={[xB + rodL + 1.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={dark}>
          <cylinderGeometry args={[0.26, 0.26, 0.06, 40]} />
        </mesh>
      </group>
      <RoundedBox args={[1.0, axisY - 0.3, 0.32]} radius={0.04} position={[xB + rodL + 0.4, (axisY - 0.3) / 2 + 0.12, zFront]} material={dark} castShadow />
      <group ref={piston} position={[0, axisY, zFront]}>
        <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={oxide} castShadow>
          <cylinderGeometry args={[0.21, 0.21, 0.42, 32]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Civil: building rises floor by floor while the tower crane works    */
/* ------------------------------------------------------------------ */
/** `since` restarts the construction from the ground each time the model is shown; `build` is seconds per floor. */
export function BuildingModel({ animate, since, build = 1.6 }: { animate: boolean; since?: { current: number }; build?: number }) {
  const plan = useMemo(() => createSitePlanTexture(1024), []);
  useDispose(plan);
  const planMat = useMemo(() => new THREE.MeshStandardMaterial({ map: plan, roughness: 0.9 }), [plan]);
  useDispose(planMat);
  const concrete = useMaterial({ color: '#dcd9d2', roughness: 0.85 });
  const column = useMaterial({ color: '#bdb9b1', roughness: 0.8 });
  const glass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#8fa3ad', roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.42, clearcoat: 1 }),
    [],
  );
  useDispose(glass);
  const crane = useMaterial({ color: LIME, roughness: 0.5, metalness: 0.3 });
  const dark = useMaterial({ color: '#2a2c30', roughness: 0.6 });
  const trunk = useMaterial({ color: '#4b3b2e', roughness: 0.9 });
  const leaf = useMaterial({ color: '#5f6b52', roughness: 0.9 });
  const load = useMaterial({ color: '#9b978f', roughness: 0.8 });

  const floors = 5;
  const fh = 0.5;
  const bw = 2.4;
  const bd = 1.5;
  const cols: [number, number][] = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) cols.push([-bw / 2 + 0.08 + (i * (bw - 0.16)) / 3, -bd / 2 + 0.08 + (j * (bd - 0.16)) / 2]);

  const floorRefs = useRef<(THREE.Group | null)[]>([]);
  const glassRefs = useRef<(THREE.Mesh | null)[]>([]);
  const jib = useRef<THREE.Group>(null);
  const hook = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Mesh>(null);

  const BUILD = build;
  const SWING = 1.6; // crane slew period
  const CYCLE = floors * BUILD + 5;
  useFrame(({ clock }) => {
    const t = !animate ? CYCLE - 1 : since ? Math.min(CYCLE - 1, clock.elapsedTime - since.current) : clock.elapsedTime % CYCLE;
    const resetting = t > CYCLE - 0.8;
    const fade = resetting ? (CYCLE - t) / 0.8 : 1;
    floorRefs.current.forEach((g, f) => {
      if (!g) return;
      const p = Math.min(1, Math.max(0, (t - f * BUILD) / (BUILD * 0.7)));
      const e = 1 - Math.pow(1 - p, 3);
      g.scale.y = Math.max(0.0001, e * fade);
      g.visible = e > 0.001 && fade > 0.001;
    });
    glassRefs.current.forEach((m, f) => {
      if (!m) return;
      const p = Math.min(1, Math.max(0, (t - (f + 1) * BUILD) / 0.6));
      m.visible = p > 0.01 && fade > 0.01 && f < 3;
      m.scale.y = Math.max(0.0001, p * fade);
    });
    // crane slews towards the building while lifting, and back to pick up the next load
    const phase = (t % SWING) / SWING;
    if (jib.current) jib.current.rotation.y = 0.35 + Math.sin(phase * Math.PI * 2) * 0.55;
    const drop = 0.6 + Math.abs(Math.cos(phase * Math.PI)) * 1.6;
    if (hook.current) hook.current.position.y = -drop;
    if (cable.current) {
      cable.current.scale.y = drop;
      cable.current.position.y = -drop / 2;
    }
  });

  const trees: [number, number, number][] = [
    [-2.1, 1.5, 1],
    [-1.6, 1.65, 0.8],
    [-2.2, -1.5, 0.9],
    [2.1, 1.55, 0.85],
    [-0.6, 1.65, 0.7],
  ];

  return (
    <group position={[0, -1.15, 0]}>
      <mesh position={[0, 0.06, 0]} material={dark} receiveShadow castShadow>
        <boxGeometry args={[5, 0.12, 4]} />
      </mesh>
      <mesh position={[0, 0.121, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={planMat}>
        <planeGeometry args={[4.9, 3.9]} />
      </mesh>
      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, 0.12, z]} scale={s * 0.8}>
          <mesh position={[0, 0.2, 0]} material={trunk} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
          </mesh>
          <mesh position={[0, 0.55, 0]} material={leaf} castShadow>
            <icosahedronGeometry args={[0.28, 1]} />
          </mesh>
        </group>
      ))}
      <group position={[-0.3, 0.12, -0.2]}>
        {/* ground slab */}
        <mesh position={[0, 0.03, 0]} material={concrete} castShadow receiveShadow>
          <boxGeometry args={[bw + 0.1, 0.06, bd + 0.1]} />
        </mesh>
        {Array.from({ length: floors }, (_, f) => (
          <group key={f} position={[0, f * fh + 0.06, 0]} ref={(el) => (floorRefs.current[f] = el)}>
            {cols.map(([x, z], k) => (
              <mesh key={k} position={[x, (fh - 0.06) / 2, z]} material={column} castShadow>
                <boxGeometry args={[0.07, fh - 0.06, 0.07]} />
              </mesh>
            ))}
            <mesh position={[0, fh - 0.03, 0]} material={concrete} castShadow receiveShadow>
              <boxGeometry args={[bw + 0.1, 0.06, bd + 0.1]} />
            </mesh>
            <mesh position={[0.65, fh / 2, 0]} material={concrete} castShadow>
              <boxGeometry args={[0.5, fh, 0.5]} />
            </mesh>
          </group>
        ))}
        {Array.from({ length: floors }, (_, f) => (
          <mesh key={`g${f}`} ref={(el) => (glassRefs.current[f] = el)} position={[0, f * fh + 0.06, 0]} material={glass}>
            <boxGeometry args={[bw - 0.02, fh - 0.07, bd - 0.02]} />
          </mesh>
        ))}
      </group>
      {/* tower crane */}
      <group position={[1.85, 0.12, -1.35]} scale={0.8}>
        <mesh position={[0, 0.05, 0]} material={dark}>
          <boxGeometry args={[0.4, 0.1, 0.4]} />
        </mesh>
        <mesh position={[0, 2.05, 0]} material={crane} castShadow>
          <boxGeometry args={[0.14, 4.1, 0.14]} />
        </mesh>
        <group ref={jib} position={[0, 4.05, 0]}>
          <mesh position={[-1.25, 0, 0]} material={crane} castShadow>
            <boxGeometry args={[3.1, 0.1, 0.12]} />
          </mesh>
          <mesh position={[0.6, 0, 0]} material={crane}>
            <boxGeometry args={[1.0, 0.09, 0.12]} />
          </mesh>
          <mesh position={[0.95, -0.14, 0]} material={dark} castShadow>
            <boxGeometry args={[0.32, 0.24, 0.24]} />
          </mesh>
          <mesh position={[0, 0.32, 0]} material={crane}>
            <boxGeometry args={[0.09, 0.55, 0.09]} />
          </mesh>
          <group position={[-2.05, 0, 0]}>
            <mesh ref={cable} material={dark}>
              <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
            </mesh>
            <group ref={hook}>
              <mesh position={[0, -0.08, 0]} material={load} castShadow>
                <boxGeometry args={[0.36, 0.12, 0.2]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
