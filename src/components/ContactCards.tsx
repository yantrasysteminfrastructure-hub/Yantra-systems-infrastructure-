import { CONTACT } from '../data/content';
import { EmailText } from './EmailText';
import { Icon, WhatsAppIcon } from './Icons';

/** Phone, email and WhatsApp as large glass cards. */
export function ContactCards({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`contact-cards${compact ? ' contact-cards--compact' : ''}`}>
      <li>
        <a href={CONTACT.phoneHref} className="contact-card">
          <span className="contact-card__icon">
            <Icon name="call" />
          </span>
          <span className="label">Phone</span>
          <span className="contact-card__v">{CONTACT.phoneDisplay}</span>
        </a>
      </li>
      <li>
        <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="contact-card">
          <span className="contact-card__icon">
            <WhatsAppIcon />
          </span>
          <span className="label">WhatsApp</span>
          <span className="contact-card__v">Chat with us</span>
        </a>
      </li>
      <li>
        <a href={`mailto:${CONTACT.email}`} className="contact-card">
          <span className="contact-card__icon">
            <Icon name="mail" />
          </span>
          <span className="label">Email</span>
          <span className="contact-card__v break">
            <EmailText />
          </span>
        </a>
      </li>
    </ul>
  );
}
