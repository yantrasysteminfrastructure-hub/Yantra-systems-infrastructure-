import { CONTACT, DELIVERY_NOTE, PROCESS, SERVICES, deliveryLabel, servicePath, type Service } from '../data/content';
import { requestService } from '../lib/enquiryBus';
import { Link } from '../lib/router';
import { ContactCards } from '../components/ContactCards';
import { GlassTile, TileCluster } from '../components/Glow';
import { Icon, ORBIT_ICONS, WhatsAppIcon } from '../components/Icons';
import { PageHero } from '../components/PageHero';
import { DeliveryChip } from '../components/ServiceCard';
import { ServiceScene } from '../components/ServiceScene';

export default function ServiceDetail({ service: s }: { service: Service }) {
  const i = SERVICES.indexOf(s);
  const prev = SERVICES[(i - 1 + SERVICES.length) % SERVICES.length];
  const next = SERVICES[(i + 1) % SERVICES.length];
  const wa = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(`Hi Yantra, I'd like to know more about ${s.title}.`)}`;

  return (
    <div style={{ '--hue': s.hue, '--hue2': s.hue2 } as React.CSSProperties}>
      <PageHero
        eyebrow={`Service ${s.num}`}
        title={s.title}
        lead={s.description}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: s.short }]}
        hue={s.hue}
        hue2={s.hue2}
        aside={<TileCluster icon={s.icon} orbit={ORBIT_ICONS[s.icon]} hue={s.hue} hue2={s.hue2} className="page-hero__cluster" />}
      >
        <div className="page-hero__facts">
          <DeliveryChip days={s.deliveryDays} />
        </div>
        <div className="page-hero__actions">
          <button type="button" className="btn btn--light" onClick={() => requestService(s.formValue)}>
            Enquire about this service <Icon name="arrow" />
          </button>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            <WhatsAppIcon /> WhatsApp
          </a>
        </div>
      </PageHero>

      <section className="section detail-overview" aria-labelledby="ov-title">
        <div className="container detail-overview__grid">
          <div>
            <p className="eyebrow" data-reveal>
              Overview
            </p>
            <h2 id="ov-title" className="h2 h2--sm" data-reveal>
              Service overview
            </h2>
            {s.overview.map((p) => (
              <p key={p} className="lead" data-reveal>
                {p}
              </p>
            ))}
          </div>
          <div data-reveal>
            <ServiceScene scene={s.scene} />
          </div>
        </div>
      </section>

      <section className="section detail-offer" aria-labelledby="offer-title">
        <div className="container">
          <header className="section-head section-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                What we offer
              </p>
              <h2 id="offer-title" className="h2 h2--sm" data-reveal>
                Everything under <span className="grad">{s.short}.</span>
              </h2>
            </div>
          </header>
          <ul className="offer-grid">
            {s.points.map((p, k) => (
              <li key={p} className="offer" data-reveal style={{ '--d': `${(k % 4) * 60}ms` } as React.CSSProperties}>
                <span className="offer__n">{String(k + 1).padStart(2, '0')}</span>
                <span className="offer__t">{p}</span>
                <Icon name="check" className="offer__check" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section detail-tech" aria-labelledby="tech-title">
        <div className="container detail-tech__grid">
          <div>
            <p className="eyebrow" data-reveal>
              Technologies &amp; solutions
            </p>
            <h2 id="tech-title" className="h2 h2--sm" data-reveal>
              The tools behind the work.
            </h2>
          </div>
          <ul className="chip-cloud" data-reveal>
            {s.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section detail-examples" aria-labelledby="ex-title">
        <div className="container">
          <header className="section-head section-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                Project examples
              </p>
              <h2 id="ex-title" className="h2 h2--sm" data-reveal>
                What this can look like.
              </h2>
            </div>
            <p className="section-head__aside" data-reveal>
              Examples of the kind of projects this service covers. Your project is scoped to your own requirement.
            </p>
          </header>
          <ul className="example-grid">
            {s.examples.map((e, k) => (
              <li key={e.title} className="example" data-reveal style={{ '--d': `${k * 70}ms` } as React.CSSProperties}>
                <GlassTile icon={ORBIT_ICONS[s.icon][k % 6]} size="sm" hue={s.hue} hue2={s.hue2} />
                <h3>{e.title}</h3>
                <p>{e.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section detail-delivery" aria-labelledby="del-title">
        <div className="container">
          <div className="delivery-panel" data-reveal>
            <div className="delivery-panel__glow" aria-hidden="true" />
            <div className="delivery-panel__figure">
              <p className="eyebrow">Estimated delivery</p>
              <p id="del-title" className="delivery-panel__n">
                {s.deliveryDays}
                <span>{s.deliveryDays === 1 ? 'day' : 'days'}</span>
              </p>
            </div>
            <div className="delivery-panel__body">
              <p>{DELIVERY_NOTE}</p>
              <ol className="mini-steps" aria-label="How the work runs">
                {PROCESS.map((p) => (
                  <li key={p.num}>
                    <span>{p.num}</span> {p.title}
                  </li>
                ))}
              </ol>
              <button type="button" className="btn btn--light" onClick={() => requestService(s.formValue)}>
                Request a quote for {s.short} <Icon name="arrow" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section detail-contact" aria-labelledby="dc-title">
        <div className="container detail-contact__grid">
          <div>
            <p className="eyebrow" data-reveal>
              Contact
            </p>
            <h2 id="dc-title" className="h2 h2--sm" data-reveal>
              Talk to us about <span className="grad">{s.short.toLowerCase()}.</span>
            </h2>
            <p className="lead" data-reveal>
              Call, WhatsApp or email the team, or send a detailed enquiry and we&rsquo;ll get back to you.
            </p>
          </div>
          <div data-reveal>
            <ContactCards />
          </div>
        </div>
      </section>

      <nav className="container pager" aria-label="Other services">
        <Link to={servicePath(prev)} className="pager__link">
          <span className="label">Previous</span>
          <span className="pager__t">
            <Icon name="arrow" className="flip" /> {prev.title}
          </span>
          <span className="pager__d">{deliveryLabel(prev.deliveryDays)}</span>
        </Link>
        <Link to={servicePath(next)} className="pager__link pager__link--next">
          <span className="label">Next</span>
          <span className="pager__t">
            {next.title} <Icon name="arrow" />
          </span>
          <span className="pager__d">{deliveryLabel(next.deliveryDays)}</span>
        </Link>
      </nav>
    </div>
  );
}
