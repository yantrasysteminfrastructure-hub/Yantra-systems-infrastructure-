import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html } from '@react-three/drei';
import type { Group } from 'three';
import { DevBoard } from './DevBoard';
import { BuildingModel } from './DomainModels';
import { DraftingDesk, HeroLaptop, HeroPhones } from './HeroModels';
import { SceneCanvas, Studio } from './SceneCanvas';
import { attachPointer, damp, pointer } from './pointer';
import { useIsMobile, useMediaQuery, useReducedMotion } from '../hooks';
import { PcbFallback } from '../components/visuals/PcbFallback';
import { HERO_SLIDES, type HeroSlideId } from '../data/heroSlides';

type V3 = [number, number, number];
interface View {
  /** position, [rotX, rotY], scale — side-by-side layout */
  wide: [V3, [number, number], number];
  /** below 1024px the 3D gets its own full-width band */
  stacked: [V3, [number, number], number];
  /** optional override for phones (< 768px) */
  phone?: [V3, [number, number], number];
  tags: { p: V3; t: string }[];
}

const VIEWS: Record<HeroSlideId, View> = {
  embedded: {
    wide: [[0.35, 0, 0], [0, -0.55], 0.8],
    stacked: [[0, 0, 0], [0, -0.55], 1.02],
    tags: [
      { p: [1.55, 0.45, -0.75], t: 'ESP32 · MCU' },
      { p: [-1.55, 0.75, 2.65], t: 'Sensor I/O' },
      { p: [-2.6, 0.45, -0.55], t: 'USB-C · UART' },
    ],
  },
  mobile: {
    wide: [[0.55, 0.5, 0.2], [0, -0.15], 1.45],
    stacked: [[0, 0.3, 0.3], [0, -0.1], 1.45],
    phone: [[0, 0.3, 0.3], [0, -0.1], 1.9],
    tags: [
      { p: [-0.35, 1.5, 0.6], t: 'Our website · mobile' },
      { p: [1.0, -1.2, -0.3], t: 'Responsive UI' },
    ],
  },
  web: {
    wide: [[0.6, 0.45, 0], [0, -0.42], 0.86],
    stacked: [[0.1, 0.2, 0.2], [0, -0.32], 1.22],
    tags: [
      { p: [0.7, 1.55, -2.0], t: 'yantra-lyart.vercel.app' },
      { p: [-2.1, -0.45, 0.6], t: 'Web application' },
    ],
  },
  drawings: {
    wide: [[0.6, 0.3, -0.2], [0, -0.25], 0.68],
    stacked: [[-0.1, 0.25, 0], [0, -0.2], 0.98],
    tags: [
      { p: [-1.6, 0.35, -1.1], t: 'Floor plan · 1:100' },
      { p: [2.8, 1.75, -1.25], t: 'Schedule chart' },
    ],
  },
  building: {
    wide: [[0.3, 0.35, 0], [0, -0.6], 0.74],
    stacked: [[-0.15, 0.1, 0], [0, -0.55], 1.12],
    tags: [
      { p: [-0.9, 1.5, 0.5], t: 'RCC frame' },
      { p: [1.85, 2.4, -1.35], t: 'Tower crane' },
      { p: [0.4, -0.85, 1.6], t: 'Site plan' },
    ],
  },
};

function SlideModel({ id, animate, since, mobile }: { id: HeroSlideId; animate: boolean; since: { current: number }; mobile: boolean }) {
  const quality = mobile ? 0.72 : 1;
  switch (id) {
    case 'embedded':
      return (
        <group position={[0.2, 0, -0.55]}>
          <DevBoard textureSize={mobile ? 1024 : 2048} animate={animate} />
        </group>
      );
    case 'mobile':
      return <HeroPhones animate={animate} since={since} quality={quality} />;
    case 'web':
      return <HeroLaptop animate={animate} since={since} quality={quality} />;
    case 'drawings':
      return <DraftingDesk animate={animate} since={since} quality={quality} />;
    case 'building':
      return <BuildingModel animate={animate} since={since} build={0.62} />;
  }
}

/**
 * Shows one slide at a time: the current model sinks and turns away, the next rises in.
 * Models mount on first use (others are warmed up in the background) and stay mounted, hidden.
 */
function Carousel({ index, reduced, mobile, stacked }: { index: number; reduced: boolean; mobile: boolean; stacked: boolean }) {
  const target = HERO_SLIDES[index].id;
  const [shown, setShown] = useState<HeroSlideId>(target);
  const [mounted, setMounted] = useState<HeroSlideId[]>([target]);
  const [settled, setSettled] = useState(true);
  const outer = useRef<Group>(null);
  const k = useRef(1);
  const since = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    setMounted((m) => (m.includes(target) ? m : [...m, target]));
    if (reduced) setShown(target);
    invalidate();
  }, [target, reduced, invalidate]);
  useEffect(() => invalidate(), [shown, invalidate]);

  // Prepare the remaining slides one by one after the first has settled.
  useEffect(() => {
    let timer = 0;
    const next = () => {
      setMounted((m) => {
        const id = HERO_SLIDES.map((s) => s.id).find((x) => !m.includes(x));
        if (id) timer = window.setTimeout(next, 600);
        return id ? [...m, id] : m;
      });
    };
    timer = window.setTimeout(next, 1800);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state, dt) => {
    const g = outer.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const entering = shown === target;
    k.current = reduced ? (entering ? 1 : 0) : damp(k.current, entering ? 1 : 0, entering ? 4.2 : 9, d);
    if (!entering && k.current < 0.03) {
      setShown(target);
      k.current = 0;
      since.current = state.clock.elapsedTime;
    }
    const isSettled = entering && k.current > 0.95;
    if (isSettled !== settled) setSettled(isSettled);
    const e = k.current;
    const dir = entering ? -1 : 1;
    g.scale.setScalar(0.72 + 0.28 * e);
    g.position.y = -(1 - e) * 0.9;
    g.rotation.y = dir * (1 - e) * 0.9;
    g.visible = e > 0.01;
  });

  return (
    <group ref={outer}>
      {mounted.map((id) => {
        const v = VIEWS[id];
        const [p, [rx, ry], s] = (mobile && v.phone) || v[stacked ? 'stacked' : 'wide'];
        const on = id === shown;
        return (
          <group key={id} visible={on} position={p} rotation={[rx, ry, 0]} scale={s}>
            <SlideModel id={id} animate={on && !reduced} since={since} mobile={mobile} />
            {on &&
              settled &&
              !mobile &&
              VIEWS[id].tags.map((tag) => (
                <Html key={tag.t} position={tag.p} center zIndexRange={[5, 0]} className="callout" wrapperClass="callout-wrap">
                  <span className="callout__dot" />
                  {tag.t}
                </Html>
              ))}
          </group>
        );
      })}
    </group>
  );
}

/** Pointer parallax, idle sway and scroll response for the whole showcase. */
function Rig({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
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
    const ty = px * 0.22 + idle + scroll * 0.7;
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

  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ slide }: { slide: number }) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  // below 1024px the hero stacks: the showcase gets its own full-width band
  const stacked = useMediaQuery('(max-width: 1023px)');
  return (
    <SceneCanvas
      className="hero__canvas"
      label={HERO_SLIDES[slide].aria}
      camera={{ position: mobile ? [0, 7.6, 8.2] : stacked ? [0, 7, 8.6] : [0, 7, 9.4], fov: mobile ? 34 : 31 }}
      fallback={<PcbFallback />}
    >
      <Studio />
      <Rig reduced={reduced}>
        <Carousel index={slide} reduced={reduced} mobile={mobile} stacked={stacked} />
      </Rig>
      <ContactShadows key={reduced ? slide : 0} position={[0, -0.9, 0]} opacity={0.55} scale={16} blur={2.6} far={3} resolution={mobile ? 256 : 512} frames={reduced ? 1 : Infinity} />
    </SceneCanvas>
  );
}
