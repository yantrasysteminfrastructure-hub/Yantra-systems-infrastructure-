import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { DOMAINS } from '../data/content';
import { hasWebGL } from '../hooks';
import { DomainFallback } from './visuals/DomainFallback';
import { requestService } from './Services';

const DomainScene = lazy(() => import('../three/DomainScene'));

const SCENE_LABEL = {
  embedded: 'Microcontroller development board with sensor module',
  software: 'Laptop showing firmware code beside a phone running an app interface',
  mechanical: 'Spur gear train on bearing blocks',
  civil: 'Architectural model of a multi-storey frame on a site plan, with a tower crane',
} as const;

export function Domains() {
  const [index, setIndex] = useState(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => setWebgl(hasWebGL()), []);
  const domain = DOMAINS[index];

  const onKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next = index;
    if (e.key in keys) next = (index + keys[e.key] + DOMAINS.length) % DOMAINS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = DOMAINS.length - 1;
    else return;
    e.preventDefault();
    setIndex(next);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  return (
    <section id="domains" className="section section--light domains" aria-labelledby="domains-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__num">03</span> Industries / Domains
          </p>
          <div className="section-head__row">
            <h2 id="domains-title" className="h2" data-reveal>
              Across engineering <span className="mark">disciplines.</span>
            </h2>
            <p className="section-head__aside" data-reveal>
              Select a discipline to see the services and technical areas Yantra works with.
            </p>
          </div>
        </header>

        <div className="domains__layout" data-reveal>
          <div className="domains__tabs" role="tablist" aria-label="Engineering disciplines" aria-orientation="vertical" onKeyDown={onKey}>
            {DOMAINS.map((d, i) => (
              <button
                key={d.id}
                ref={(el) => (tabs.current[i] = el)}
                id={`tab-${d.id}`}
                role="tab"
                type="button"
                aria-selected={i === index}
                aria-controls="domain-panel"
                tabIndex={i === index ? 0 : -1}
                className="domain-tab"
                onClick={() => setIndex(i)}
              >
                <span className="domain-tab__code">{d.short}</span>
                <span className="domain-tab__name">{d.title}</span>
              </button>
            ))}
          </div>

          <div className="domains__stage">
            <div className="domains__viewer">
              {webgl === false ? (
                <DomainFallback scene={domain.scene} />
              ) : webgl ? (
                <Suspense fallback={<div className="domains__canvas" />}>
                  <DomainScene scene={domain.scene} label={SCENE_LABEL[domain.scene]} />
                </Suspense>
              ) : null}
              <div className="domains__hud" aria-hidden="true">
                <span>{domain.short}</span>
                <span className="domains__hint">Drag to rotate</span>
              </div>
            </div>

            <div id="domain-panel" role="tabpanel" aria-labelledby={`tab-${domain.id}`} className="domains__panel" key={domain.id}>
              <h3 className="domains__title">{domain.title}</h3>
              <p className="domains__summary">{domain.summary}</p>
              <div className="domains__cols">
                <div>
                  <h4 className="label">Technical areas</h4>
                  <ul className="chips">
                    {domain.areas.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="label">Relevant services</h4>
                  <ul className="ticks">
                    {domain.services.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="domains__foot">
                <button type="button" className="btn btn--dark btn--sm" onClick={() => requestService(domain.formService)}>
                  Discuss a {domain.short === 'DEGREE' ? 'degree' : domain.short} requirement
                </button>
                <p className="fineprint">Specific technologies and scope are confirmed with you during the initial discussion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
