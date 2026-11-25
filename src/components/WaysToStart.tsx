import { CONTACT } from '../data/content';
import { ATTACHMENTS_ENABLED } from '../lib/enquiry';
import { Link } from '../lib/router';
import { GlassTile } from './Glow';
import { Icon, WhatsAppIcon } from './Icons';

/** "Three ways to start." The real contact routes, laid out like the reference's three tiers. */
export function WaysToStart() {
  return (
    <section id="ways" className="section ways" aria-labelledby="ways-title">
      <div className="ways__spot" aria-hidden="true" />
      <div className="container">
        <header className="section-head section-head--center">
          <p className="eyebrow" data-reveal>
            Get started
          </p>
          <h2 id="ways-title" className="h2" data-reveal>
            Three ways to <span className="grad">work with us.</span>
          </h2>
        </header>

        <div className="ways__grid">
          <article className="way" data-reveal style={{ '--d': '0ms' } as React.CSSProperties}>
            <span className="way__k">01 · Detailed</span>
            <h3>Request a quote</h3>
            <p>Choose your service and describe the requirement in detail. Best when you already know what you need.</p>
            <ul className="way__list">
              <li>All 5 services</li>
              <li>Delivery estimate shown</li>
              <li>{ATTACHMENTS_ENABLED ? 'Attach reference files' : 'Pre-fills from any service page'}</li>
            </ul>
            <Link to="/quote" className="btn btn--light btn--block">
              Request a Quote <Icon name="arrow" />
            </Link>
          </article>

          <article className="way way--feature" data-reveal style={{ '--d': '90ms' } as React.CSSProperties}>
            <div className="way__tile" aria-hidden="true">
              <GlassTile icon="chat" size="lg" hue="#2fe3a4" hue2="#b8ffe4" />
            </div>
            <span className="way__k">02 · Fastest</span>
            <h3>Chat on WhatsApp</h3>
            <p>Message the team directly with your idea, photos or questions and continue the conversation there.</p>
            <ul className="way__list">
              <li>Direct conversation</li>
              <li>Share photos & files</li>
              <li>{CONTACT.phoneDisplay}</li>
            </ul>
            <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn--accent btn--block">
              <WhatsAppIcon /> Open WhatsApp
            </a>
          </article>

          <article className="way" data-reveal style={{ '--d': '180ms' } as React.CSSProperties}>
            <span className="way__k">03 · Personal</span>
            <h3>Call or email</h3>
            <p>Prefer to talk it through? Call us, or send an email with your requirement and documents.</p>
            <ul className="way__list">
              <li>
                <a href={CONTACT.phoneHref}>Call {CONTACT.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="break">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
            <a href={CONTACT.phoneHref} className="btn btn--ghost btn--block">
              <Icon name="call" /> Call now
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
