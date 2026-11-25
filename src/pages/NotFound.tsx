import { SERVICES, servicePath } from '../data/content';
import { Link } from '../lib/router';
import { Beams } from '../components/Glow';
import { Icon } from '../components/Icons';

export default function NotFound() {
  return (
    <section className="status-page" aria-labelledby="nf-title">
      <div className="hero__sky" aria-hidden="true" />
      <Beams className="status-page__beams" hue="#7b5cff" hue2="#c8b8ff" />
      <div className="container status-page__inner">
        <p className="status-page__code" aria-hidden="true">
          404
        </p>
        <h1 id="nf-title" className="page-hero__title">
          This page isn&rsquo;t <span className="grad">here.</span>
        </h1>
        <p className="page-hero__lead">The link may be old or mistyped. Here are some places to go instead.</p>
        <div className="page-hero__actions">
          <Link to="/" className="btn btn--light">
            Back to home <Icon name="arrow" />
          </Link>
          <Link to="/contact" className="btn btn--ghost">
            Contact us
          </Link>
        </div>
        <ul className="status-page__links">
          {SERVICES.map((s) => (
            <li key={s.id}>
              <Link to={servicePath(s)}>{s.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
