import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { hasWebGL, useInView, useReducedMotion } from '../hooks';

class GLErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    // WebGL context creation can fail on some devices; the static fallback is shown instead.
    if (import.meta.env.DEV) console.warn('3D scene disabled:', err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Neutral studio lighting built from light-formers (no external HDR download). */
export function Studio({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.25 * intensity} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.6 * intensity}
        castShadow={false}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.5 * intensity} color="#dfe8ff" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#141518']} />
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 2, -2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#CDF22B" position={[0, 1.5, -7]} scale={[10, 0.4, 1]} />
        <Lightformer form="ring" intensity={1.4} position={[3, 4, 6]} scale={2.5} />
      </Environment>
    </>
  );
}

interface SceneCanvasProps {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
  camera?: CanvasProps['camera'];
  /** Max device pixel ratio; lowered automatically on small screens. */
  maxDpr?: number;
  label: string;
}

/**
 * Mounts a WebGL canvas only when it nears the viewport, pauses rendering while offscreen,
 * renders on demand for reduced-motion users, and falls back to a static visual without WebGL.
 */
export function SceneCanvas({ children, fallback, className, camera, maxDpr = 1.75, label }: SceneCanvasProps) {
  const [ref, near] = useInView<HTMLDivElement>('300px 0px');
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => setSupported(hasWebGL()), []);
  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);

  const small = typeof window !== 'undefined' && window.innerWidth < 768;
  const maxRatio = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, small ? Math.min(1.5, maxDpr) : maxDpr);
  // Adaptive resolution: drop towards 1x when the device can't hold a steady frame rate.
  const [dpr, setDpr] = useState(maxRatio);

  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      {!supported ? (
        fallback
      ) : mounted ? (
        <GLErrorBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <Canvas
              dpr={dpr}
              camera={camera}
              frameloop={near ? (reduced ? 'demand' : 'always') : 'never'}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.05;
              }}
              aria-hidden="true"
            >
              <PerformanceMonitor
                flipflops={3}
                onDecline={() => setDpr((d) => Math.max(1, d - 0.5))}
                onIncline={() => setDpr((d) => Math.min(maxRatio, d + 0.25))}
                onFallback={() => setDpr(1)}
              />
              {children}
            </Canvas>
          </Suspense>
        </GLErrorBoundary>
      ) : null}
    </div>
  );
}
