import type { DomainScene } from '../../data/content';
import { ServiceVisual } from './ServiceVisual';

function Gears() {
  const gear = (cx: number, cy: number, r: number, n: number, cls: string) => (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} className={cls} />
      <circle r={r * 0.3} className="v-dim" />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={-4} y={-r - 9} width={8} height={10} rx={1} className={cls} transform={`rotate(${(360 / n) * i})`} />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 400 260" fill="none" aria-hidden="true">
      <rect x="40" y="206" width="320" height="18" rx="3" className="v-fill v-line" />
      {gear(160, 120, 66, 20, 'v-line')}
      {gear(266, 120, 32, 10, 'v-accentline')}
      <path d="M160 120h106" className="v-dim" />
      <text x="40" y="250" className="v-label">GEAR TRAIN · RATIO 2:1</text>
    </svg>
  );
}

/** Static visual shown when WebGL is unavailable for the domain viewer. */
export function DomainFallbackVisual({ scene }: { scene: DomainScene }) {
  if (scene === 'mechanical') return <Gears />;
  const kind = scene === 'software' ? 'webapp' : scene === 'civil' ? 'civil' : scene === 'business' ? 'docs' : 'embedded';
  return <ServiceVisual kind={kind} />;
}
