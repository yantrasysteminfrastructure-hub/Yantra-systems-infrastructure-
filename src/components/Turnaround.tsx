import { useEffect, useRef, useState } from 'react';
import { DELIVERY_NOTE, SERVICES, servicePath } from '../data/content';
import { Link } from '../lib/router';
import { useInView, useReducedMotion } from '../hooks';
import { Bokeh, GlassTile } from './Glow';
import { Icon } from './Icons';

/** Counts up to `to` whenever it changes (instantly for reduced motion). */
function useCount(to: number, run: boolean) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(to);
  const from = useRef(0);
  useEffect(() => {
    if (!run || reduced) {
      setN(to);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 700);
      const e = 1 - Math.pow(1 - k, 3);
      setN(Math.round(a + (to - a) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, reduced]);
  return n;
}

/** "Timelines you can plan around": the real delivery estimates, one service at a time. */
export function Turnaround() {
  const [index, setIndex] = useState(0);
  const [ref, inView] = useInView<HTMLDivElement>('-10% 0px', true);
  const s = SERVICES[index];
  const days = useCount(s.deliveryDays, inView);

  return (
    <section id="turnaround" className="section turn" aria-labelledby="turn-title">
      <Bokeh />
      <div className="container">
        <header className="section-head section-head--split">
          <div>
            <p className="eyebrow" data-reveal>
              Turnaround
            </p>
            <h2 id="turn-title" className="h2" data-reveal>
              Timelines you can <span className="grad">plan around.</span>
            </h2>
          </div>
          <p className="section-head__aside" data-reveal>
            Every service has an estimated delivery time, so you know what to expect before the work starts.
          </p>
        </header>

        <div ref={ref} className="turn__grid" data-reveal>
          <div className="turn__tabs" role="tablist" aria-label="Services">
            {SERVICES.map((x, i) => (
              <button
                key={x.id}
                id={`turn-tab-${x.id}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls="turn-panel"
                tabIndex={i === index ? 0 : -1}
                className={`turn__tab${i === index ? ' is-on' : ''}`}
                style={{ '--hue': x.hue } as React.CSSProperties}
                onClick={() => setIndex(i)}
                onKeyDown={(e) => {
                  const k = e.key;
                  if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(k)) return;
                  e.preventDefault();
                  const n = SERVICES.length;
                  const next = k === 'Home' ? 0 : k === 'End' ? n - 1 : (i + (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : -1) + n) % n;
                  setIndex(next);
                  document.getElementById(`turn-tab-${SERVICES[next].id}`)?.focus();
                }}
              >
                <span className="turn__tab-name">{x.title}</span>
                <span className="turn__tab-days">{x.deliveryDays}d</span>
              </button>
            ))}
          </div>

          <div
            id="turn-panel"
            role="tabpanel"
            aria-labelledby={`turn-tab-${s.id}`}
            className="turn__panel"
            style={{ '--hue': s.hue, '--hue2': s.hue2 } as React.CSSProperties}
          >
            <div className="turn__panel-glow" aria-hidden="true" />
            <GlassTile icon={s.icon} size="lg" hue={s.hue} hue2={s.hue2} className="turn__tile" />
            <div className="turn__figure">
              <span className="turn__n" aria-hidden="true">
                {days}
              </span>
              <span className="turn__unit" aria-hidden="true">
                {s.deliveryDays === 1 ? 'day' : 'days'}
              </span>
              <span className="sr-only">
                Estimated delivery: {s.deliveryDays} {s.deliveryDays === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="turn__text" key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <Link to={servicePath(s)} className="link-arrow">
                View service <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
        <p className="fineprint" data-reveal>
          {DELIVERY_NOTE}
        </p>
      </div>
    </section>
  );
}
