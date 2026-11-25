import { useEffect, useState } from 'react';
import { COMPANY, SERVICES, deliveryLabel, servicePath } from '../data/content';
import { Link } from '../lib/router';
import { useInView, useReducedMotion } from '../hooks';
import { Beams, TileCluster } from './Glow';
import { Icon, ORBIT_ICONS } from './Icons';

const SLIDE_MS = 5600;

/**
 * Home hero: cycles through the five services. Each one re-colours the light beams and the
 * glowing tile cluster, the way the reference cycles its disciplines.
 */
export function HomeHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLElement>('0px');
  const s = SERVICES[index];
  const auto = inView && !paused && !reduced;

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % SERVICES.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [auto, index]);

  return (
    <section
      ref={ref}
      id="home"
      className={`hero${auto ? ' is-auto' : ''}`}
      aria-labelledby="hero-title"
      style={{ '--hue': s.hue, '--hue2': s.hue2, '--slide-ms': `${SLIDE_MS}ms` } as React.CSSProperties}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setPaused(false)}
    >
      <div className="hero__sky" aria-hidden="true" />
      <Beams className="hero__beams" />
      <div className="hero__floor" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__kicker">
            <span className="hero__kicker-dot" aria-hidden="true" />
            {COMPANY.name}
            <span className="sr-only"> — embedded systems, engineering projects, documentation, school projects, websites and mobile apps</span>
          </h1>

          <div className="hero__slide" key={s.id} aria-live={auto ? 'off' : 'polite'}>
            <p className="hero__num">
              <span>{s.num}</span> / 0{SERVICES.length}
            </p>
            <p className="hero__title">{s.title}</p>
            <p className="hero__lead">{s.description}</p>
            <dl className="hero__facts">
              <div>
                <dt>Est. delivery</dt>
                <dd>
                  <Icon name="clock" /> {deliveryLabel(s.deliveryDays)}
                </dd>
              </div>
              <div>
                <dt>Includes</dt>
                <dd>{s.points.slice(0, 2).join(' · ')}</dd>
              </div>
            </dl>
          </div>

          <div className="hero__actions">
            <Link to={servicePath(s)} className="btn btn--light">
              Explore {s.short} <Icon name="arrow" />
            </Link>
            <Link to="/quote" className="btn btn--ghost">
              Request a Quote
            </Link>
          </div>
        </div>

        <div className="hero__visual">
          <TileCluster key={s.id} icon={s.icon} orbit={ORBIT_ICONS[s.icon]} className="hero__cluster" />
        </div>
      </div>

      <div className="container hero__pager">
        <div className="hero__tabs" role="group" aria-label="Choose a service to preview">
          {SERVICES.map((x, i) => (
            <button
              key={x.id}
              type="button"
              className={`hero__tab${i === index ? ' is-on' : ''}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              style={{ '--hue': x.hue } as React.CSSProperties}
            >
              <span className="hero__tab-bar">
                <span key={i === index ? `${index}-on` : 'off'} />
              </span>
              <span className="hero__tab-label">{x.short}</span>
            </button>
          ))}
        </div>
        <span className="hero__scroll" aria-hidden="true">
          Scroll <span />
        </span>
      </div>
    </section>
  );
}
