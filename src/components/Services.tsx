import { useState } from 'react';
import { SERVICES, type EnquiryPreset, type Service } from '../data/content';
import { scrollToId } from '../hooks';
import { ServiceVisual } from './visuals/ServiceVisual';

export const SELECT_SERVICE_EVENT = 'yantra:select-service';

/** Pre-fills the enquiry form (service, and optionally branch / project type) and scrolls to it. */
export function requestEnquiry(preset: EnquiryPreset) {
  window.dispatchEvent(new CustomEvent<EnquiryPreset>(SELECT_SERVICE_EVENT, { detail: preset }));
  scrollToId('contact');
}

export function requestService(service: string) {
  requestEnquiry({ service });
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `svc-${service.id}-details`;
  return (
    <article
      className={`svc-card${open ? ' is-open' : ''}`}
      data-reveal
      style={{ '--d': `${(index % 3) * 80}ms` } as React.CSSProperties}
      aria-labelledby={`svc-${service.id}-title`}
    >
      <div className="svc-card__visual visual">
        <ServiceVisual kind={service.visual} />
      </div>
      <div className="svc-card__body">
        <div className="svc-card__meta">
          <span className="svc-card__num">{service.num}</span>
          <span className="svc-card__rule" aria-hidden="true" />
        </div>
        <h3 id={`svc-${service.id}-title`} className="svc-card__title">
          {service.title}
        </h3>
        <p className="svc-card__desc">{service.description}</p>

        <div id={panelId} className="svc-card__details" hidden={!open}>
          <ul>
            {service.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <button type="button" className="link-btn" onClick={() => requestService(service.formValue)}>
            Enquire about {service.title}
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>
          </button>
        </div>

        <button type="button" className="svc-card__toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
          <span>{open ? 'Close' : 'Explore service'}</span>
          <span className="svc-card__plus" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function Services() {
  return (
    <section id="services" className="section section--dark services" aria-labelledby="services-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow eyebrow--dark" data-reveal>
            <span className="eyebrow__num">02</span> Our Services
          </p>
          <div className="section-head__row">
            <h2 id="services-title" className="h2" data-reveal>
              What we <span className="hl">engineer.</span>
            </h2>
            <p className="section-head__aside" data-reveal>
              Six focused areas across electronics, academic engineering projects, software and infrastructure.
            </p>
          </div>
        </header>
        <div className="svc-grid">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
        <p className="fineprint fineprint--dark" data-reveal>
          Academic project services are guidance and development support for students&rsquo; own projects; they are separate from
          Yantra&rsquo;s commercial engineering, software and civil work.
        </p>
      </div>
    </section>
  );
}
