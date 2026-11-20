import { CONTACT, NAV_ITEMS, SERVICES } from '../data/content';
import { EmailText } from './EmailText';
import { scrollToId } from '../hooks';
import { Logo } from './Logo';

export function Footer() {
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo size="lg" />
          <p className="site-footer__tag">Turning Ideas Into Innovation.</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="label label--dark">Navigate</h2>
          <ul>
            {NAV_ITEMS.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={go(n.id)}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="label label--dark">Services</h2>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.id}>
                <a href="#services" onClick={go('services')}>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="label label--dark">Contact</h2>
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
        <p>© {new Date().getFullYear()} Yantra Systems &amp; Infrastructure. All rights reserved.</p>
        <a href="#home" onClick={go('home')} className="to-top">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
