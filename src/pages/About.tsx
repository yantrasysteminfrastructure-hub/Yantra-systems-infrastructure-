import { COMPANY, PRINCIPLES, SERVICES, deliveryLabel, servicePath } from '../data/content';
import { Link } from '../lib/router';
import { GlassTile, TileCluster } from '../components/Glow';
import { Icon, type IconName } from '../components/Icons';
import { PageHero } from '../components/PageHero';
import { StepsCount } from '../components/StepsCount';

const FOCUS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'chip', title: 'Engineering', text: 'Embedded hardware, circuits and microcontroller systems built to work in practice.' },
  { icon: 'flask', title: 'Academic projects', text: 'Engineering, degree and school projects that students can understand and present.' },
  { icon: 'doc', title: 'Documentation', text: 'Reports, technical documents and presentations that explain the work clearly.' },
  { icon: 'code', title: 'Software', text: 'Websites, web applications and mobile apps for businesses and ideas.' },
];

const PRINCIPLE_ICONS: IconName[] = ['gear', 'layers', 'target', 'chat', 'doc', 'chip'];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            Engineering with <span className="grad">purpose.</span>
          </>
        }
        lead={`${COMPANY.name} works across embedded systems, engineering and academic projects, documentation and software development. We help turn concepts into practical implementations through technical expertise and structured execution.`}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
        aside={<TileCluster icon="spark" orbit={['chip', 'doc', 'flask', 'browser', 'phone', 'gear']} hue="#7b5cff" hue2="#c8b8ff" className="page-hero__cluster" />}
      >
        <div className="page-hero__actions">
          <Link to="/services" className="btn btn--light">
            Our services <Icon name="arrow" />
          </Link>
          <Link to="/contact" className="btn btn--ghost">
            Contact us
          </Link>
        </div>
      </PageHero>

      <section id="about" className="section about" aria-labelledby="about-title">
        <div className="container about__grid">
          <div>
            <p className="eyebrow" data-reveal>
              Who we are
            </p>
            <h2 id="about-title" className="h2" data-reveal>
              From idea to <span className="grad">working outcome.</span>
            </h2>
          </div>
          <div className="about__copy" data-reveal>
            <p className="lead">
              Our tagline is our brief: <strong>{COMPANY.tagline}</strong> Whether it is an ESP32 prototype, a final-year engineering
              project, a project report, a science exhibition model, a business website or a mobile app, the goal is the same, something
              that works and that you can rely on.
            </p>
            <p>
              Every engagement follows a structured process, from understanding the requirement to delivering the agreed work with the
              documentation it needs, and every service comes with a clear delivery estimate.
            </p>
          </div>
        </div>

        <div className="container">
          <ul className="focus-grid">
            {FOCUS.map((f, i) => (
              <li key={f.title} className="focus" data-reveal style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
                <GlassTile icon={f.icon} size="sm" />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section about-services" aria-labelledby="about-svc-title">
        <div className="container">
          <header className="section-head section-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                What we do
              </p>
              <h2 id="about-svc-title" className="h2" data-reveal>
                Five services, <span className="grad">one team.</span>
              </h2>
            </div>
          </header>
          <ol className="svc-rows" data-reveal>
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link to={servicePath(s)} className="svc-row" style={{ '--hue': s.hue } as React.CSSProperties}>
                  <span className="svc-row__num">{s.num}</span>
                  <span className="svc-row__title">{s.title}</span>
                  <span className="svc-row__days">
                    <Icon name="clock" /> {deliveryLabel(s.deliveryDays)}
                  </span>
                  <Icon name="arrowUpRight" className="svc-row__go" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="why" className="section why" aria-labelledby="why-title">
        <div className="container">
          <header className="section-head section-head--split">
            <div>
              <p className="eyebrow" data-reveal>
                Why Yantra
              </p>
              <h2 id="why-title" className="h2" data-reveal>
                Built around practical <span className="grad">engineering.</span>
              </h2>
            </div>
          </header>
          <ul className="principles">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="principle" data-reveal style={{ '--d': `${(i % 3) * 70}ms` } as React.CSSProperties}>
                <span className="principle__icon">
                  <Icon name={PRINCIPLE_ICONS[i]} />
                </span>
                <h3 className="principle__title">{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepsCount />
    </>
  );
}
