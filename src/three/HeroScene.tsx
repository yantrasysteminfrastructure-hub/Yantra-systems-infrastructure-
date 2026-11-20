import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html } from '@react-three/drei';
import type { Group } from 'three';
import { DevBoard } from './DevBoard';
import { SceneCanvas, Studio } from './SceneCanvas';
import { attachPointer, damp, pointer } from './pointer';
import { useIsMobile, useMediaQuery, useReducedMotion } from '../hooks';
import { PcbFallback } from '../components/visuals/PcbFallback';

function Callout({ position, children }: { position: [number, number, number]; children: React.ReactNode }) {
  return (
    <Html position={position} center zIndexRange={[5, 0]} className="callout" wrapperClass="callout-wrap">
      <span className="callout__dot" />
      {children}
    </Html>
  );
}

function Rig({ reduced, mobile, stacked }: { reduced: boolean; mobile: boolean; stacked: boolean }) {
  const group = useRef<Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    attachPointer();
    if (!reduced) return;
    // In reduced-motion mode we render on demand: still respond to scroll, without idle motion.
    const onScroll = () => invalidate();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced, invalidate]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const scroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    const t = state.clock.elapsedTime;
    const idle = reduced ? 0 : Math.sin(t * 0.35) * 0.05;
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;
    const ty = -0.55 + px * 0.22 + idle + scroll * 0.7;
    const tx = 0.05 - py * 0.08 + scroll * 0.22;
    if (reduced) {
      g.rotation.y = ty;
      g.rotation.x = tx;
      g.position.y = -scroll * 1.2;
    } else {
      g.rotation.y = damp(g.rotation.y, ty, 3, d);
      g.rotation.x = damp(g.rotation.x, tx, 3, d);
      g.position.y = damp(g.position.y, -scroll * 1.2 + Math.sin(t * 0.6) * 0.04, 4, d);
    }
  });

  return (
    <group ref={group} scale={stacked ? 1.02 : 0.8} position={[stacked ? 0 : 0.35, 0, 0]}>
      <group position={[0.2, 0, -0.55]}>
        <DevBoard textureSize={mobile ? 1024 : 2048} animate={!reduced} />
        {!mobile && (
          <>
            <Callout position={[1.35, 0.45, -0.2]}>ESP32 · MCU</Callout>
            <Callout position={[-1.75, 0.75, 3.2]}>Sensor I/O</Callout>
            <Callout position={[-2.8, 0.45, 0]}>USB-C · UART</Callout>
          </>
        )}
      </group>
    </group>
  );
}

export default function HeroScene() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  // below 1024px the hero stacks: the board gets its own full-width band
  const stacked = useMediaQuery('(max-width: 1023px)');
  return (
    <SceneCanvas
      className="hero__canvas"
      label="3D model of an ESP32-style microcontroller development board with a sensor module connected by jumper wires"
      camera={{ position: mobile ? [0, 7.6, 8.2] : stacked ? [0, 7, 8.6] : [0, 7, 9.4], fov: mobile ? 34 : 31 }}
      fallback={<PcbFallback />}
    >
      <Studio />
      <Rig reduced={reduced} mobile={mobile} stacked={stacked} />
      <ContactShadows position={[0, -0.9, 0]} opacity={0.55} scale={16} blur={2.6} far={3} resolution={mobile ? 256 : 512} frames={reduced ? 1 : Infinity} />
    </SceneCanvas>
  );
}
