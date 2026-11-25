import { useElementProgress, useReducedMotion } from '../hooks';

const FOCUS = ['Engineering', 'Technology', 'Academic project development', 'Software solutions', 'Infrastructure-related services'];

/** Exploded technical view of a development board, layered in CSS 3D. Separation follows scroll. */
function ExplodedBoard() {
  const [ref, progress] = useElementProgress<HTMLDivElement>();
  const reduced = useReducedMotion();
  const spread = reduced ? 0.6 : Math.min(1, progress * 1.6);
  const pins = Array.from({ length: 12 }, (_, i) => 70 + i * 20);
  return (
    <div ref={ref} className="exploded" style={{ '--spread': spread } as React.CSSProperties} aria-hidden="true">
      <div className="exploded__stage">
        <svg className="exploded__layer exploded__layer--0" viewBox="0 0 360 240">
          <rect x="20" y="20" width="320" height="200" rx="10" className="ex-board" />
          {[40, 320].map((x) => [40, 200].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="7" className="ex-hole" />))}
          <path d="M58 120h60l14 -14h40M58 130h64l14 14h36M190 106h40l10 10h20M190 146h34l12 -12h24M120 70v-24M150 70v-24M180 70v-24M120 170v24M150 170v24" className="ex-trace" />
        </svg>
        <svg className="exploded__layer exploded__layer--1" viewBox="0 0 360 240">
          {pins.map((x) => (
            <g key={x}>
              <rect x={x - 5} y="34" width="10" height="10" className="ex-pin" />
              <rect x={x - 5} y="196" width="10" height="10" className="ex-pin" />
            </g>
          ))}
          <rect x="36" y="106" width="30" height="38" rx="5" className="ex-part" />
          <rect x="132" y="98" width="44" height="44" rx="3" className="ex-part" />
          <circle cx="96" cy="160" r="14" className="ex-part" />
          <rect x="88" y="76" width="22" height="16" rx="2" className="ex-part" />
          <rect x="200" y="150" width="14" height="8" rx="1" className="ex-led" />
        </svg>
        <svg className="exploded__layer exploded__layer--2" viewBox="0 0 360 240">
          <rect x="226" y="72" width="100" height="96" rx="4" className="ex-shield" />
          <text x="276" y="118" textAnchor="middle" className="ex-label">ESP32</text>
          <text x="276" y="134" textAnchor="middle" className="ex-sub">MCU · WI-FI · BT</text>
        </svg>
      </div>
      <ul className="exploded__notes">
        <li><span>L3</span>MCU module</li>
        <li><span>L2</span>Components &amp; I/O</li>
        <li><span>L1</span>Circuit board</li>
      </ul>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="section section--light about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__copy">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__num">01</span> About Yantra
          </p>
          <h2 id="about-title" className="h2" data-reveal>
            Engineering with <span className="mark">purpose.</span>
          </h2>
          <p className="lead" data-reveal>
            Yantra Systems &amp; Infrastructure works across engineering, technology, academic project development, software
            solutions, and infrastructure-related services. We help turn concepts into practical implementations through technical
            expertise and structured execution.
          </p>
          <ul className="spec-list" data-reveal aria-label="Areas of work">
            {FOCUS.map((f, i) => (
              <li key={f}>
                <span className="spec-list__k">{String(i + 1).padStart(2, '0')}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="about__visual" data-reveal>
          <ExplodedBoard />
        </div>
      </div>
    </section>
  );
}
