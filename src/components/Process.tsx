import { PROCESS } from '../data/content';
import { useElementProgress } from '../hooks';

export function Process() {
  const [ref, progress] = useElementProgress<HTMLOListElement>();
  const reached = Math.floor(progress * PROCESS.length + 0.35);
  return (
    <section id="process" className="section section--dark process" aria-labelledby="process-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow eyebrow--dark" data-reveal>
            <span className="eyebrow__num">04</span> Our Working Approach
          </p>
          <div className="section-head__row">
            <h2 id="process-title" className="h2" data-reveal>
              From concept to <span className="hl">implementation.</span>
            </h2>
            <p className="section-head__aside" data-reveal>
              A structured sequence that keeps every requirement traceable from the first conversation to final delivery.
            </p>
          </div>
        </header>

        <ol ref={ref} className="timeline" style={{ '--p': progress } as React.CSSProperties}>
          <span className="timeline__rail" aria-hidden="true">
            <span className="timeline__fill" />
          </span>
          {PROCESS.map((step, i) => (
            <li key={step.num} className={`timeline__step${i < reached ? ' is-reached' : ''}`}>
              <span className="timeline__node" aria-hidden="true" />
              <span className="timeline__stage">
                Stage {step.num}/{String(PROCESS.length).padStart(2, '0')}
              </span>
              <h3 className="timeline__title">
                <span className="timeline__num">{step.num}</span> {step.title}
              </h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
