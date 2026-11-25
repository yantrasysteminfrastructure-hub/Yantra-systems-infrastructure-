import { SERVICES } from '../data/content';
import { Link } from '../lib/router';
import { HomeHero } from '../components/HomeHero';
import { Icon } from '../components/Icons';
import { ServiceCard } from '../components/ServiceCard';
import { StepsCount } from '../components/StepsCount';
import { Turnaround } from '../components/Turnaround';
import { WaysToStart } from '../components/WaysToStart';

const STACK = ['ESP32', 'Arduino', 'IoT', 'Sensors & automation', 'Embedded C / C++', 'Circuit design', 'Project reports', 'Robotics', 'STEM models', 'React', 'Node.js', 'Databases', 'Android', 'API integration'];

export default function Home() {
  return (
    <>
      <HomeHero />

      <div className="marquee" aria-label="Technologies we work with">
        <div className="marquee__track">
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1 ? true : undefined}>
              {STACK.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section id="services" className="section services" aria-labelledby="services-title">
        <div className="container">
          <header className="section-head section-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                Our services
              </p>
              <h2 id="services-title" className="h2" data-reveal>
                What we <span className="grad">build.</span>
              </h2>
            </div>
            <p className="section-head__aside" data-reveal>
              Five focused services across embedded electronics, academic projects, documentation, websites and mobile apps, each with a
              clear delivery estimate.
            </p>
          </header>
          <div className="svc-grid">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
            <Link to="/quote" className="svc-card svc-card--cta" data-reveal style={{ '--d': '180ms' } as React.CSSProperties}>
              <span className="eyebrow">Not sure where it fits?</span>
              <span className="svc-card__title">Tell us the idea. We&rsquo;ll scope it with you.</span>
              <span className="btn btn--light btn--sm">
                Request a Quote <Icon name="arrow" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Turnaround />
      <StepsCount />
      <WaysToStart />
    </>
  );
}
