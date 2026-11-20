import { ServiceVisual } from './ServiceVisual';

/** Static, CSS-3D-tilted illustration shown when WebGL is unavailable. */
export function PcbFallback() {
  return (
    <div className="fallback fallback--hero">
      <div className="fallback__tilt visual">
        <ServiceVisual kind="embedded" />
      </div>
    </div>
  );
}
