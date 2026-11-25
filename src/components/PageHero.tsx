import type { ReactNode } from 'react';
import { Link } from '../lib/router';
import { Beams } from './Glow';

interface Crumb {
  label: string;
  to?: string;
}

/** Hero for inner pages: breadcrumb, title, lead and an optional visual, under coloured light. */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  hue = '#7b5cff',
  hue2 = '#c8b8ff',
  children,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs: Crumb[];
  hue?: string;
  hue2?: string;
  /** Extra content under the lead (buttons, facts). */
  children?: ReactNode;
  /** Visual on the right. */
  aside?: ReactNode;
}) {
  return (
    <section className={`page-hero${aside ? ' page-hero--split' : ''}`} style={{ '--hue': hue, '--hue2': hue2 } as React.CSSProperties} aria-labelledby="page-title">
      <div className="hero__sky" aria-hidden="true" />
      <Beams className="page-hero__beams" />
      <div className="container page-hero__inner">
        <div className="page-hero__copy">
          <nav aria-label="Breadcrumb" className="crumbs">
            <ol>
              {crumbs.map((c, i) => (
                <li key={c.label}>
                  {c.to && i < crumbs.length - 1 ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="page-title" className="page-hero__title">
            {title}
          </h1>
          {lead && <p className="page-hero__lead">{lead}</p>}
          {children}
        </div>
        {aside && <div className="page-hero__aside">{aside}</div>}
      </div>
    </section>
  );
}
