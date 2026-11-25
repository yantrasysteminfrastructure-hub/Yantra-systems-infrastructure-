import type { CSSProperties } from 'react';
import { Icon, type IconName } from './Icons';

type Hue = { hue?: string; hue2?: string };
const hueVars = ({ hue, hue2 }: Hue) => ({ ...(hue ? { '--hue': hue } : {}), ...(hue2 ? { '--hue2': hue2 } : {}) }) as CSSProperties;

/** Rays of light fanning out from a point (the reference's stage lighting). Decorative. */
export function Beams({ className, ...hue }: Hue & { className?: string }) {
  return (
    <div className={`beams${className ? ` ${className}` : ''}`} style={hueVars(hue)} aria-hidden="true">
      <div className="beams__fan">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="beam" style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
      <div className="beams__core" />
    </div>
  );
}

/** Soft, out-of-focus coloured orbs drifting behind a section. Decorative. */
export function Bokeh({ className }: { className?: string }) {
  return (
    <div className={`bokeh${className ? ` ${className}` : ''}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  );
}

/** Frosted glass square holding an icon, with a light rim in the given hue. */
export function GlassTile({
  icon,
  size = 'md',
  className,
  style,
  label,
  ...hue
}: Hue & { icon: IconName; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; style?: CSSProperties; label?: string }) {
  return (
    <span className={`tile tile--${size}${className ? ` ${className}` : ''}`} style={{ ...hueVars(hue), ...style }} aria-hidden={label ? undefined : true}>
      <span className="tile__rim" />
      <Icon name={icon} className="tile__icon" />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

/** A big glowing tile with smaller tiles floating around it. */
export function TileCluster({ icon, orbit, className, ...hue }: Hue & { icon: IconName; orbit: IconName[]; className?: string }) {
  return (
    <div className={`cluster${className ? ` ${className}` : ''}`} style={hueVars(hue)} aria-hidden="true">
      <div className="cluster__halo" />
      <GlassTile icon={icon} size="xl" className="cluster__main" />
      {orbit.map((o, i) => (
        <GlassTile key={`${o}-${i}`} icon={o} size={i % 3 === 0 ? 'md' : 'sm'} className="cluster__sat" style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  );
}
