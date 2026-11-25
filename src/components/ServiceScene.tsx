import { lazy, Suspense, useEffect, useState } from 'react';
import type { DomainScene as SceneId } from '../data/content';
import { hasWebGL } from '../hooks';
import { DomainFallback } from './visuals/DomainFallback';

const DomainScene = lazy(() => import('../three/DomainScene'));

const LABELS: Record<SceneId, { label: string; caption: string }> = {
  software: { label: 'Desk with a laptop showing code, a phone running a dashboard app, and a microcontroller board', caption: 'Software · web & mobile' },
  embedded: { label: 'Microcontroller development board with a sensor module and data pulses on its circuit traces', caption: 'Embedded · MCU & sensor I/O' },
  electrical: { label: 'Microcontroller switching a relay that drives a DC motor and fan from a battery pack', caption: 'Electrical · relay motor control' },
  mechanical: { label: 'Gear train driving a crank and piston mechanism on bearing blocks', caption: 'Mechanical · gear & crank–slider' },
  civil: { label: 'Building frame rising floor by floor on a site plan while a tower crane lifts loads', caption: 'Civil · structure & site plan' },
  business: { label: 'Desk with bound project reports, an open report with charts, and a tablet showing a dashboard', caption: 'Reports · documentation & diagrams' },
  parking: { label: 'Smart parking model: cars drive in and out while slot sensors switch each slot light', caption: 'Smart parking · built by Yantra' },
};

/** Interactive 3D model for a service page, with a static fallback when WebGL is unavailable. */
export function ServiceScene({ scene, caption }: { scene: SceneId; caption?: string }) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => setWebgl(hasWebGL()), []);
  const info = LABELS[scene];
  return (
    <figure className="scene-frame">
      <div className="domains__viewer scene-frame__view">
        {webgl === false ? (
          <DomainFallback scene={scene} />
        ) : webgl ? (
          <Suspense fallback={<div className="domains__canvas" />}>
            <DomainScene scene={scene} label={info.label} />
          </Suspense>
        ) : null}
        <div className="domains__hud" aria-hidden="true">
          <span>3D model</span>
          <span className="domains__hint">Drag to rotate</span>
        </div>
      </div>
      <figcaption className="scene-frame__cap">
        <span className="domains__live" aria-hidden="true" />
        {caption ?? info.caption}
      </figcaption>
    </figure>
  );
}
