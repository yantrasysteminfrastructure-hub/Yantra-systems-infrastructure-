import { DELIVERY_NOTE, SERVICES, servicePath } from '../data/content';
import { requestService } from '../lib/enquiryBus';
import { Link } from '../lib/router';
import { GlassTile } from '../components/Glow';
import { Icon, ORBIT_ICONS } from '../components/Icons';
import { PageHero } from '../components/PageHero';
import { DeliveryChip } from '../components/ServiceCard';

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={
          <>
            What we <span className="grad">build.</span>
          </>
        }
        lead="Embedded systems and engineering projects, documentation, school projects, websites and mobile apps. Each service has a clear scope and an estimated delivery time."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      >
        <ul className="hero-index">
          {SERVICES.map((s) => (
            <li key={s.id}>
              <a href={`#svc-${s.id}`} style={{ '--hue': s.hue } as React.CSSProperties}>
                <span>{s.num}</span> {s.short}
              </a>
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="section svc-list" aria-label="All services">
        <div className="container">
          {SERVICES.map((s, i) => (
            <article
              key={s.id}
              id={`svc-${s.id}`}
              className={`svc-block${i % 2 ? ' svc-block--flip' : ''}`}
              style={{ '--hue': s.hue, '--hue2': s.hue2 } as React.CSSProperties}
              aria-labelledby={`svc-${s.id}-h`}
              data-reveal
            >
              <div className="svc-block__visual" aria-hidden="true">
                <div className="svc-block__glow" />
                <GlassTile icon={s.icon} size="xl" hue={s.hue} hue2={s.hue2} className="svc-block__main" />
                {ORBIT_ICONS[s.icon].slice(0, 4).map((o, k) => (
                  <GlassTile key={o} icon={o} size="sm" className="svc-block__sat" style={{ '--i': k } as React.CSSProperties} />
                ))}
                <span className="svc-block__days">
                  <strong>{s.deliveryDays}</strong> {s.deliveryDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="svc-block__body">
                <span className="svc-block__num">{s.num}</span>
                <h2 id={`svc-${s.id}-h`} className="svc-block__title">
                  {s.title}
                </h2>
                <p className="svc-block__desc">{s.description}</p>
                <ul className="tick-list tick-list--2">
                  {s.points.map((p) => (
                    <li key={p}>
                      <Icon name="check" /> {p}
                    </li>
                  ))}
                </ul>
                <div className="svc-block__foot">
                  <DeliveryChip days={s.deliveryDays} />
                  <div className="svc-block__btns">
                    <Link to={servicePath(s)} className="btn btn--light btn--sm">
                      View details <Icon name="arrow" />
                    </Link>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => requestService(s.formValue)}>
                      Enquire
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          <p className="fineprint" data-reveal>
            {DELIVERY_NOTE}
          </p>
        </div>
      </section>
    </>
  );
}
