import { COMPANY, CONTACT, NAV_ITEMS, SERVICES, deliveryLabel, servicePath } from '../data/content';
import { Link } from '../lib/router';
import { EmailText } from './EmailText';
import { GlassTile } from './Glow';
import { Icon, WhatsAppIcon } from './Icons';
import { Logo } from './Logo';

/** Closing call to action + giant wordmark + site map. Shown on every page. */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__sky" aria-hidden="true" />
      <div id="start" className="container site-footer__cta">
        <div>
          <p className="eyebrow">Start a project</p>
          <h2 className="site-footer__ask">
            Have something <span className="grad">in mind?</span>
          </h2>
          <p className="site-footer__lead">
            Tell us what you want to build. We&rsquo;ll get back to you to understand the requirement and discuss the next steps.
          </p>
        </div>
        <div className="site-footer__actions">
          <Link to="/quote" className="btn btn--light">
            Request a Quote <Icon name="arrow" />
          </Link>
          <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
            <WhatsAppIcon /> WhatsApp us
          </a>
        </div>
      </div>

      <div className="site-footer__mark" aria-hidden="true">
        <span className="site-footer__word">YANTRA</span>
        <GlassTile icon="chip" size="md" className="site-footer__float site-footer__float--1" hue="#fc4728" hue2="#ffb36b" />
        <GlassTile icon="code" size="sm" className="site-footer__float site-footer__float--2" hue="#b15cff" hue2="#ffb8f0" />
        <GlassTile icon="phone" size="sm" className="site-footer__float site-footer__float--3" hue="#35c8ff" hue2="#b8f0ff" />
      </div>

      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo size="lg" />
          <p className="site-footer__tag">{COMPANY.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="label">Company</h2>
          <ul>
            {NAV_ITEMS.map((n) => (
              <li key={n.path}>
                <Link to={n.path}>{n.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/quote">Request a Quote</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="label">Services</h2>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link to={servicePath(s)}>
                  {s.title} <span className="site-footer__days">{deliveryLabel(s.deliveryDays)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="label">Contact</h2>
          <ul>
            <li>
              <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="break">
                <EmailText />
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <p>
          © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
        </p>
        <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
