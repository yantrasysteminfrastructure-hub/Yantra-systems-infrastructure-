import { useEffect, useRef, useState } from 'react';
import { PROCESS } from '../data/content';
import { useMediaQuery, useReducedMotion } from '../hooks';

const WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];

/** Active step from how far a tall section has scrolled through its sticky viewport. */
function useStickyStep(count: number, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(0.999, Math.max(0, -r.top / travel));
      setStep(Math.floor(p * count));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count, enabled]);
  return [ref, step] as const;
}

/**
 * "Five steps. Count them." The working process with oversized numerals and a light pillar
 * per step. Sticky and scroll-driven on large screens; a plain list on small screens and for reduced motion.
 */
export function StepsCount({ id = 'process' }: { id?: string }) {
  const reduced = useReducedMotion();
  const wide = useMediaQuery('(min-width: 960px)');
  const sticky = wide && !reduced;
  const [ref, active] = useStickyStep(PROCESS.length, sticky);
  const n = PROCESS.length;
  const current = PROCESS[active];

  const head = (
    <header className="steps__head">
      <p className="eyebrow">How we work</p>
      <h2 id={`${id}-title`} className="h2">
        {WORDS[n - 1]} steps. <span className="grad">Count them.</span>
      </h2>
    </header>
  );

  if (!sticky)
    return (
      <section id={id} className="section steps steps--list" aria-labelledby={`${id}-title`}>
        <div className="container">
          {head}
          <ol className="steps__list">
            {PROCESS.map((p, i) => (
              <li key={p.num} data-reveal style={{ '--d': `${i * 60}ms` } as React.CSSProperties}>
                <span className="steps__big">{i + 1}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );

  return (
    <section id={id} className="steps steps--sticky" aria-labelledby={`${id}-title`}>
      <div ref={ref} className="steps__track" style={{ height: `${n * 70 + 40}vh` }}>
        <div className="steps__stage">
          <div className="steps__glow" aria-hidden="true" />
          <div className="container steps__layout">
            <div className="steps__copy">
              {head}
              <div className="steps__now" key={active} aria-live="polite">
                <p className="steps__label">
                  Step {active + 1} of {n}
                </p>
                <h3 className="steps__title">{current.title}</h3>
                <p className="steps__text">{current.text}</p>
              </div>
              <ol className="steps__nums" aria-label="Steps">
                {PROCESS.map((p, i) => (
                  <li key={p.num} className={i < active ? 'is-past' : i === active ? 'is-on' : undefined} aria-current={i === active ? 'step' : undefined}>
                    <span aria-hidden="true">{i + 1}</span>
                    <span className="sr-only">{p.title}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="steps__pillars" aria-hidden="true">
              <div className="steps__ring" />
              {PROCESS.map((p, i) => (
                <span key={p.num} className={`pillar${i <= active ? ' is-lit' : ''}${i === active ? ' is-top' : ''}`} style={{ '--i': i } as React.CSSProperties}>
                  <span className="pillar__cap">{p.title}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
