import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, PresentationControls } from '@react-three/drei';
import type { Group } from 'three';
import type { DomainScene as SceneId } from '../data/content';
import { DevBoard } from './DevBoard';
import { BuildingModel, GearAssembly, Workstation } from './DomainModels';
import { SceneCanvas, Studio } from './SceneCanvas';
import { damp } from './pointer';
import { useCoarsePointer, useIsMobile, useReducedMotion } from '../hooks';
import { DomainFallback } from '../components/visuals/DomainFallback';

const VIEW: Record<SceneId, { scale: number; rotY: number; y: number }> = {
  embedded: { scale: 0.62, rotY: -0.5, y: -0.25 },
  software: { scale: 0.78, rotY: 0.25, y: 0 },
  mechanical: { scale: 0.85, rotY: -0.55, y: 0 },
  civil: { scale: 0.72, rotY: -0.6, y: 0 },
};

function Model({ id, animate }: { id: SceneId; animate: boolean }) {
  switch (id) {
    case 'embedded':
      return <DevBoard textureSize={1024} animate={animate} />;
    case 'software':
      return <Workstation />;
    case 'mechanical':
      return <GearAssembly animate={animate} />;
    case 'civil':
      return <BuildingModel />;
  }
}

/** Shrinks the current model, swaps it, and grows the next one in. */
function Switcher({ target, reduced }: { target: SceneId; reduced: boolean }) {
  const [shown, setShown] = useState<SceneId>(target);
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
    k.current = reduced ? want : damp(k.current, want, 9, d);
    if (shown !== target && k.current < 0.02) {
      setShown(target);
      k.current = 0;
    }
    const v = VIEW[shown];
    const s = v.scale * (0.6 + 0.4 * k.current);
    g.scale.setScalar(s);
    g.position.y = v.y - (1 - k.current) * 0.4;
    g.rotation.y = v.rotY + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.3) * 0.12) + (1 - k.current) * 0.6;
    g.visible = k.current > 0.01;
  });

  return (
    <group ref={group}>
      <Model id={shown} animate={!reduced} />
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
      camera={{ position: [0, 3.4, 8.6], fov: mobile ? 34 : 30 }}
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
        azimuth={[-0.8, 0.8]}
      >
        <Switcher target={scene} reduced={reduced} />
      </PresentationControls>
      {/* static shadow: the models only sway slightly, so a single baked pass is enough */}
      <ContactShadows key={scene} position={[0, -1.2, 0]} opacity={0.45} scale={12} blur={2.6} far={3} resolution={256} frames={90} />
    </SceneCanvas>
  );
}
