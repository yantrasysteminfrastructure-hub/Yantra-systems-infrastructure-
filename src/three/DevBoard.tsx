import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import {
  BOARD_D,
  BOARD_T,
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
  PASSIVES,
  REG,
  SIGNAL_TRACES,
  TOP,
  USB,
  type V2,
} from './pcbLayout';
import { createAntennaTexture, createPcbTextures, createShieldTexture } from './pcbTexture';

export const LIME = '#CDF22B';

const mat = {
  plastic: new THREE.MeshStandardMaterial({ color: '#121315', roughness: 0.55, metalness: 0 }),
  plasticMatte: new THREE.MeshStandardMaterial({ color: '#17181b', roughness: 0.8 }),
  ic: new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.45 }),
  steel: new THREE.MeshStandardMaterial({ color: '#c9ccd1', roughness: 0.28, metalness: 1 }),
  tin: new THREE.MeshStandardMaterial({ color: '#d7d9dc', roughness: 0.35, metalness: 1 }),
  gold: new THREE.MeshStandardMaterial({ color: '#e2c27a', roughness: 0.32, metalness: 1, envMapIntensity: 1.6 }),
  fr4: new THREE.MeshStandardMaterial({ color: '#35312a', roughness: 0.85 }),
  boardBottom: new THREE.MeshStandardMaterial({ color: '#0c0e10', roughness: 0.6 }),
  ceramic: new THREE.MeshStandardMaterial({ color: '#a98a62', roughness: 0.6 }),
  capSleeve: new THREE.MeshStandardMaterial({ color: '#1b1d21', roughness: 0.35, metalness: 0.2 }),
  alu: new THREE.MeshStandardMaterial({ color: '#b5b9bf', roughness: 0.3, metalness: 1 }),
  modulePcb: new THREE.MeshStandardMaterial({ color: '#0f1317', roughness: 0.5 }),
  sensorWhite: new THREE.MeshStandardMaterial({ color: '#e9e7e1', roughness: 0.65 }),
  wireGrey: new THREE.MeshStandardMaterial({ color: '#3a3d43', roughness: 0.5 }),
  wireLight: new THREE.MeshStandardMaterial({ color: '#d9d7d0', roughness: 0.5 }),
  wireLime: new THREE.MeshStandardMaterial({ color: LIME, roughness: 0.45 }),
  pulse: new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false }),
};

function Board({ textureSize }: { textureSize: number }) {
  const gl = useThree((s) => s.gl);
  const tex = useMemo(() => createPcbTextures(textureSize, Math.min(8, gl.capabilities.getMaxAnisotropy())), [textureSize, gl]);
  const top = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex.map,
        roughnessMap: tex.metalRough,
        metalnessMap: tex.metalRough,
        bumpMap: tex.bump,
        bumpScale: 0.6,
        roughness: 1,
        metalness: 1,
      }),
    [tex],
  );
  useEffect(
    () => () => {
      tex.map.dispose();
      tex.metalRough.dispose();
      tex.bump.dispose();
      top.dispose();
    },
    [tex, top],
  );
  const materials = useMemo(() => [mat.fr4, mat.fr4, top, mat.boardBottom, mat.fr4, mat.fr4], [top]);
  return (
    <mesh material={materials} castShadow receiveShadow>
      <boxGeometry args={[BOARD_W, BOARD_T, BOARD_D]} />
    </mesh>
  );
}

function EspModule() {
  const shieldTex = useMemo(() => createShieldTexture(512), []);
  const antTex = useMemo(() => createAntennaTexture(256), []);
  useEffect(() => () => (shieldTex.dispose(), antTex.dispose()), [shieldTex, antTex]);
  const shieldMats = useMemo(() => {
    const top = new THREE.MeshStandardMaterial({ map: shieldTex, roughness: 0.32, metalness: 1 });
    return [mat.steel, mat.steel, top, mat.steel, mat.steel, mat.steel];
  }, [shieldTex]);
  const antMats = useMemo(() => {
    const top = new THREE.MeshStandardMaterial({ map: antTex, roughness: 0.5 });
    return [mat.modulePcb, mat.modulePcb, top, mat.modulePcb, mat.modulePcb, mat.modulePcb];
  }, [antTex]);

  const pcbH = 0.05;
  const shieldW = MODULE.shieldX1 - MODULE.x0 - 0.06;
  const shieldD = MODULE.z1 - MODULE.z0 - 0.1;
  const antW = MODULE.x1 - MODULE.shieldX1;
  return (
    <group position={[0, TOP, 0]}>
      <mesh
        position={[(MODULE.x0 + MODULE.shieldX1) / 2, pcbH / 2, 0]}
        material={mat.modulePcb}
        castShadow
      >
        <boxGeometry args={[MODULE.shieldX1 - MODULE.x0, pcbH, MODULE.z1 - MODULE.z0]} />
      </mesh>
      <mesh position={[MODULE.shieldX1 + antW / 2, pcbH / 2, 0]} material={antMats} castShadow>
        <boxGeometry args={[antW, pcbH, MODULE.z1 - MODULE.z0]} />
      </mesh>
      <mesh position={[MODULE.x0 + 0.03 + shieldW / 2, pcbH + 0.09, 0]} material={shieldMats} castShadow>
        <boxGeometry args={[shieldW, 0.18, shieldD]} />
      </mesh>
    </group>
  );
}

function Headers() {
  const pinRef = useRef<THREE.InstancedMesh>(null);
  const count = HEADER_PINS.length * 2;
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    for (const side of [-1, 1])
      for (const x of HEADER_PINS) {
        m.makeTranslation(x, TOP + 0.34, side * HEADER_Z);
        pinRef.current!.setMatrixAt(i++, m);
      }
    pinRef.current!.instanceMatrix.needsUpdate = true;
  }, []);
  const len = HEADER_PINS.length * 0.35;
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, TOP + 0.12, side * HEADER_Z]} material={mat.plastic} castShadow>
          <boxGeometry args={[len, 0.24, 0.3]} />
        </mesh>
      ))}
      <instancedMesh ref={pinRef} args={[undefined, mat.gold, count]} castShadow>
        <boxGeometry args={[0.065, 0.46, 0.065]} />
      </instancedMesh>
    </group>
  );
}

function Passives() {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const capRef = useRef<THREE.InstancedMesh>(null);
  const endRef = useRef<THREE.InstancedMesh>(null);
  const resistors = PASSIVES.filter((p) => p[3] === 'r');
  const caps = PASSIVES.filter((p) => p[3] === 'c');
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const place = (ref: THREE.InstancedMesh, list: typeof PASSIVES) =>
      list.forEach(([x, z, rot], i) => {
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot ? Math.PI / 2 : 0);
        m.compose(new THREE.Vector3(x, TOP + 0.03, z), q, s);
        ref.setMatrixAt(i, m);
      });
    place(bodyRef.current!, resistors);
    place(capRef.current!, caps);
    let j = 0;
    PASSIVES.forEach(([x, z, rot]) => {
      [-1, 1].forEach((d) => {
        const off = d * 0.085;
        m.makeTranslation(rot ? x : x + off, TOP + 0.03, rot ? z + off : z);
        endRef.current!.setMatrixAt(j++, m);
      });
    });
    [bodyRef, capRef, endRef].forEach((r) => (r.current!.instanceMatrix.needsUpdate = true));
  }, [resistors, caps]);
  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined, mat.ic, resistors.length]} castShadow>
        <boxGeometry args={[0.14, 0.055, 0.08]} />
      </instancedMesh>
      <instancedMesh ref={capRef} args={[undefined, mat.ceramic, caps.length]} castShadow>
        <boxGeometry args={[0.14, 0.06, 0.08]} />
      </instancedMesh>
      <instancedMesh ref={endRef} args={[undefined, mat.tin, PASSIVES.length * 2]}>
        <boxGeometry args={[0.035, 0.062, 0.085]} />
      </instancedMesh>
    </group>
  );
}

function Leds({ animate }: { animate: boolean }) {
  const ioMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a3010', emissive: LIME, emissiveIntensity: 0.4, toneMapped: false }), []);
  const pwrMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a3010', emissive: LIME, emissiveIntensity: 2.2, toneMapped: false }), []);
  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime % 1.6;
    ioMat.emissiveIntensity = t < 0.12 || (t > 0.3 && t < 0.42) ? 2.4 : 0.15;
  });
  return (
    <group>
      {[
        [LED_PWR, pwrMat],
        [LED_IO, ioMat],
      ].map(([p, m], i) => (
        <mesh key={i} position={[(p as typeof LED_PWR).x, TOP + 0.03, (p as typeof LED_PWR).z]} material={m as THREE.Material}>
          <boxGeometry args={[0.16, 0.06, 0.09]} />
        </mesh>
      ))}
      <pointLight position={[LED_PWR.x, TOP + 0.25, LED_PWR.z]} color={LIME} intensity={0.35} distance={1.2} decay={2} />
    </group>
  );
}

function Components() {
  return (
    <group>
      {/* USB-UART bridge (QFN) */}
      <mesh position={[BRIDGE.x, TOP + 0.045, BRIDGE.z]} material={mat.ic} castShadow>
        <boxGeometry args={[BRIDGE.s, 0.09, BRIDGE.s]} />
      </mesh>
      <mesh position={[BRIDGE.x - 0.17, TOP + 0.091, BRIDGE.z - 0.17]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.03, 16]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.3} />
      </mesh>

      {/* Regulator (SOT-223) */}
      <group position={[REG.x, TOP, REG.z]}>
        <mesh position={[-0.02, 0.07, 0]} material={mat.ic} castShadow>
          <boxGeometry args={[0.4, 0.14, 0.36]} />
        </mesh>
        <mesh position={[0.29, 0.012, 0]} material={mat.tin}>
          <boxGeometry args={[0.16, 0.024, 0.32]} />
        </mesh>
        {[-0.15, 0, 0.15].map((dz) => (
          <mesh key={dz} position={[-0.27, 0.025, dz]} material={mat.tin}>
            <boxGeometry args={[0.14, 0.02, 0.05]} />
          </mesh>
        ))}
      </group>

      {/* Electrolytic capacitor */}
      <group position={[CAP.x, TOP, CAP.z]}>
        <mesh position={[0, 0.03, 0]} material={mat.plasticMatte} castShadow>
          <boxGeometry args={[CAP.r * 2.3, 0.06, CAP.r * 2.3]} />
        </mesh>
        <mesh position={[0, 0.06 + CAP.h / 2, 0]} material={mat.capSleeve} castShadow>
          <cylinderGeometry args={[CAP.r, CAP.r, CAP.h, 40]} />
        </mesh>
        <mesh position={[0, 0.06 + CAP.h + 0.004, 0]} material={mat.alu}>
          <cylinderGeometry args={[CAP.r * 0.92, CAP.r * 0.92, 0.01, 40]} />
        </mesh>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} position={[0, 0.06 + CAP.h + 0.011, 0]} rotation={[0, r, 0]} material={mat.capSleeve}>
            <boxGeometry args={[CAP.r * 1.3, 0.004, 0.012]} />
          </mesh>
        ))}
      </group>

      {/* USB-C receptacle */}
      <group position={[USB.x, TOP + 0.13, USB.z]}>
        <RoundedBox args={[0.62, 0.24, 0.74]} radius={0.1} smoothness={4} material={mat.steel} castShadow />
        <RoundedBox args={[0.06, 0.12, 0.56]} radius={0.05} smoothness={3} position={[-0.29, 0, 0]} material={mat.plastic} />
      </group>

      {/* Tactile buttons */}
      {[BTN_EN, BTN_BOOT].map((b, i) => (
        <group key={i} position={[b.x, TOP, b.z]}>
          <mesh position={[0, 0.06, 0]} material={mat.plasticMatte} castShadow>
            <boxGeometry args={[0.42, 0.12, 0.34]} />
          </mesh>
          <mesh position={[0, 0.125, 0]} material={mat.steel}>
            <boxGeometry args={[0.4, 0.01, 0.32]} />
          </mesh>
          <mesh position={[0, 0.17, 0]} material={mat.plastic} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.09, 28]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Small temperature/humidity-style sensor breakout wired to the header. */
function SensorModule() {
  const pins: number[] = [-2.1, -1.75, -1.4];
  const origin = new THREE.Vector3(-1.75, 0, 3.15);
  const sensorPins = [-0.18, 0, 0.18].map((dx) => new THREE.Vector3(origin.x + dx, 0.32, origin.z - 0.45));
  const wires = useMemo(
    () =>
      pins.map((x, i) => {
        const start = new THREE.Vector3(x, TOP + 0.66, HEADER_Z);
        const end = sensorPins[i];
        const curve = new THREE.CatmullRomCurve3([
          start,
          new THREE.Vector3(x, TOP + 1.05, HEADER_Z + 0.25),
          new THREE.Vector3((x + end.x) / 2 + (i - 1) * 0.05, 0.95, (HEADER_Z + end.z) / 2 + 0.1),
          new THREE.Vector3(end.x, 0.72, end.z - 0.1),
          new THREE.Vector3(end.x, 0.5, end.z),
        ]);
        return new THREE.TubeGeometry(curve, 48, 0.028, 10, false);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => () => wires.forEach((w) => w.dispose()), [wires]);
  const wireMats = [mat.wireLime, mat.wireLight, mat.wireGrey];
  const slots = Array.from({ length: 5 }, (_, i) => i);
  return (
    <group>
      {wires.map((g, i) => (
        <mesh key={i} geometry={g} material={wireMats[i]} castShadow />
      ))}
      {/* jumper housings at header end */}
      {pins.map((x) => (
        <mesh key={x} position={[x, TOP + 0.5, HEADER_Z]} material={mat.plastic} castShadow>
          <boxGeometry args={[0.1, 0.32, 0.1]} />
        </mesh>
      ))}
      <group position={[origin.x, 0, origin.z]}>
        <mesh position={[0, 0.03, 0]} material={mat.modulePcb} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.05, 1.1]} />
        </mesh>
        <mesh position={[0, 0.25, 0.08]} material={mat.sensorWhite} castShadow>
          <boxGeometry args={[0.62, 0.4, 0.7]} />
        </mesh>
        {slots.map((i) => (
          <mesh key={i} position={[0, 0.452, -0.14 + i * 0.11]} material={mat.plasticMatte}>
            <boxGeometry args={[0.44, 0.006, 0.04]} />
          </mesh>
        ))}
        {sensorPins.map((p, i) => (
          <group key={i} position={[p.x - origin.x, 0, p.z - origin.z]}>
            <mesh position={[0, 0.11, 0]} material={mat.plastic}>
              <boxGeometry args={[0.15, 0.12, 0.12]} />
            </mesh>
            <mesh position={[0, 0.34, 0]} material={mat.plastic} castShadow>
              <boxGeometry args={[0.1, 0.32, 0.1]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function polyline(points: V2[]) {
  const pts = points.map(([x, z]) => new THREE.Vector3(x, TOP + 0.004, z));
  const segs = pts.slice(1).map((p, i) => p.distanceTo(pts[i]));
  const total = segs.reduce((a, b) => a + b, 0);
  return {
    total,
    at(d: number, out: THREE.Vector3) {
      let r = ((d % total) + total) % total;
      for (let i = 0; i < segs.length; i++) {
        if (r <= segs[i]) return out.lerpVectors(pts[i], pts[i + 1], r / segs[i]);
        r -= segs[i];
      }
      return out.copy(pts[pts.length - 1]);
    },
  };
}

/** Lime data pulses travelling along the real signal traces. */
function DataPulses({ animate }: { animate: boolean }) {
  const lines = useMemo(() => SIGNAL_TRACES.map(polyline), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : 0.6;
    lines.forEach((l, i) => {
      const m = refs.current[i];
      if (!m) return;
      const speed = 0.9;
      const phase = (t * speed + i * 0.37) % (l.total + 1.2);
      m.visible = phase < l.total;
      l.at(phase, tmp);
      m.position.copy(tmp);
    });
  });
  return (
    <group>
      {lines.map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} material={mat.pulse}>
          <sphereGeometry args={[0.028, 12, 8]} />
        </mesh>
      ))}
    </group>
  );
}

export function DevBoard({
  textureSize = 2048,
  animate = true,
  withSensor = true,
}: {
  textureSize?: number;
  animate?: boolean;
  withSensor?: boolean;
}) {
  return (
    <group>
      <Board textureSize={textureSize} />
      <EspModule />
      <Headers />
      <Passives />
      <Components />
      <Leds animate={animate} />
      <DataPulses animate={animate} />
      {withSensor && <SensorModule />}
    </group>
  );
}
