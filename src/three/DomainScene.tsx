import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, PresentationControls } from '@react-three/drei';
import type { Group } from 'three';
import type { DomainScene as SceneId } from '../data/content';
import { DevBoard } from './DevBoard';
import { BuildingModel, GearAssembly, MotorRig, Workstation } from './DomainModels';
import { ReportDesk, SmartParking } from './SceneExtras';
import { SceneCanvas, Studio } from './SceneCanvas';
import { damp } from './pointer';
import { useCoarsePointer, useIsMobile, useReducedMotion } from '../hooks';
import { DomainFallback } from '../components/visuals/DomainFallback';

type Tag = { p: [number, number, number]; t: string };

const VIEW: Record<SceneId, { scale: number; rotY: number; y: number; tags: Tag[] }> = {
  software: {
    scale: 0.7,
    rotY: 0.2,
    y: 0,
    tags: [
      { p: [-0.3, 2.3, -0.6], t: 'Live code' },
      { p: [2.5, 1.9, -0.3], t: 'Mobile app' },
      { p: [2.35, 0.4, 1.35], t: 'Target board' },
    ],
  },
  embedded: {
    scale: 0.6,
    rotY: -0.5,
    y: -0.25,
    tags: [
      { p: [1.4, 0.5, -0.2], t: 'ESP32 MCU' },
      { p: [-1.75, 0.85, 3.15], t: 'Sensor' },
      { p: [-0.6, 0.45, 0.35], t: 'USB-UART' },
    ],
  },
  electrical: {
    scale: 0.82,
    rotY: -0.45,
    y: 0,
    tags: [
      { p: [-1.75, 0.75, -0.75], t: 'Controller' },
      { p: [0.15, 1.2, -0.7], t: 'Relay' },
      { p: [1.7, 1.45, 0.45], t: 'DC motor' },
      { p: [-1.9, 0.9, 0.95], t: 'Battery' },
    ],
  },
  mechanical: {
    scale: 0.74,
    rotY: -0.4,
    y: 0,
    tags: [
      { p: [-1.6, 2.35, 0], t: 'Gear train 2:1' },
      { p: [0.65, 1.1, 0.7], t: 'Crank' },
      { p: [2.45, 1.05, 0.7], t: 'Piston' },
    ],
  },
  business: {
    scale: 0.72,
    rotY: 0.15,
    y: 0,
    tags: [
      { p: [-2.1, 0.7, -0.3], t: 'Project reports' },
      { p: [0.55, 0.4, 0.35], t: 'Analysis chapter' },
      { p: [2.55, 1.6, -0.55], t: 'Live dashboard' },
    ],
  },
  parking: {
    scale: 0.95,
    rotY: -0.35,
    y: 0,
    tags: [
      { p: [-0.55, 0.0, -1.86], t: 'Ultrasonic sensor' },
      { p: [-2.75, 0.6, -0.2], t: 'Free-slot display' },
      { p: [-2.85, -0.2, 1.6], t: 'Entry barrier' },
    ],
  },
  civil: {
    scale: 0.7,
    rotY: -0.6,
    y: 0,
    tags: [
      { p: [-0.9, 1.5, 0.5], t: 'RCC frame' },
      { p: [1.85, 2.4, -1.35], t: 'Tower crane' },
      { p: [0.4, 0.3, 1.6], t: 'Site plan' },
    ],
  },
};

function Model({ id, animate }: { id: SceneId; animate: boolean }) {
  switch (id) {
    case 'embedded':
      return <DevBoard textureSize={1024} animate={animate} />;
    case 'software':
      return <Workstation animate={animate} />;
    case 'electrical':
      return <MotorRig animate={animate} />;
    case 'mechanical':
      return <GearAssembly animate={animate} />;
    case 'civil':
      return <BuildingModel animate={animate} />;
    case 'business':
      return <ReportDesk animate={animate} />;
    case 'parking':
      return <SmartParking animate={animate} />;
  }
}

/** Shrinks the current model, swaps it, and brings the next one in with a rise and turn. */
function Switcher({ target, reduced, showTags }: { target: SceneId; reduced: boolean; showTags: boolean }) {
  const [shown, setShown] = useState<SceneId>(target);
  const [settled, setSettled] = useState(true);
  const group = useRef<Group>(null);
  const k = useRef(1);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (reduced) setShown(target);
    invalidate();
  }, [target, reduced, invalidate]);
  useEffect(() => invalidate(), [shown, invalidate]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const want = shown === target ? 1 : 0;
    k.current = reduced ? want : damp(k.current, want, want ? 5 : 10, d);
    if (shown !== target && k.current < 0.02) {
      setShown(target);
      k.current = 0;
    }
    const isSettled = shown === target && k.current > 0.97;
    if (isSettled !== settled) setSettled(isSettled);

    const v = VIEW[shown];
    const e = k.current;
    const t = state.clock.elapsedTime;
    g.scale.setScalar(v.scale * (0.7 + 0.3 * e));
    g.position.y = v.y - (1 - e) * 0.8;
    g.rotation.y = v.rotY + (reduced ? 0 : Math.sin(t * 0.22) * 0.32) + (1 - e) * 1.2;
    g.rotation.x = reduced ? 0 : Math.sin(t * 0.17) * 0.03;
    g.visible = e > 0.01;
  });

  return (
    <group ref={group}>
      <Model id={shown} animate={!reduced} />
      {showTags &&
        settled &&
        VIEW[shown].tags.map((tag) => (
          <Html key={`${shown}-${tag.t}`} position={tag.p} center zIndexRange={[5, 0]} className="callout callout--sm" wrapperClass="callout-wrap">
            <span className="callout__dot" />
            {tag.t}
          </Html>
        ))}
    </group>
  );
}

export default function DomainScene({ scene, label }: { scene: SceneId; label: string }) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const mobile = useIsMobile();
  return (
    <SceneCanvas
      className="domains__canvas"
      label={label}
      camera={{ position: [0, 3.6, 8.6], fov: mobile ? 36 : 31 }}
      fallback={<DomainFallback scene={scene} />}
    >
      <Studio />
      <PresentationControls
        enabled={!coarse && !reduced}
        global={false}
        cursor
        snap
        speed={1.4}
        polar={[-0.15, 0.25]}
        azimuth={[-0.9, 0.9]}
      >
        <Switcher target={scene} reduced={reduced} showTags={!mobile} />
      </PresentationControls>
      {/* static shadow re-baked per model: the models only sway, so continuous updates aren't needed */}
      <ContactShadows key={scene} position={[0, -1.25, 0]} opacity={0.45} scale={12} blur={2.6} far={3.5} resolution={256} frames={90} />
    </SceneCanvas>
  );
}
