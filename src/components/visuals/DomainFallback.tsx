import type { DomainScene } from '../../data/content';
import { DomainFallbackVisual } from './Fallbacks';

export function DomainFallback({ scene }: { scene: DomainScene }) {
  return (
    <div className="fallback">
      <div className="visual fallback__flat">
        <DomainFallbackVisual scene={scene} />
      </div>
    </div>
  );
}
