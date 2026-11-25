import { deliveryLabel, servicePath, type Service } from '../data/content';
import { Link } from '../lib/router';
import { GlassTile } from './Glow';
import { Icon } from './Icons';

/** Delivery-time badge used on cards, pages and the form. */
export function DeliveryChip({ days, compact = false }: { days: number; compact?: boolean }) {
  return (
    <span className={`delivery-chip${compact ? ' delivery-chip--compact' : ''}`}>
      <Icon name="clock" />
      {!compact && <span className="delivery-chip__k">Est. delivery</span>}
      <strong>{deliveryLabel(days)}</strong>
    </span>
  );
}

/** Glass service card: links to the service page; light follows the pointer. */
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <article
      className="svc-card"
      data-reveal
      onPointerMove={onMove}
      style={{ '--hue': service.hue, '--hue2': service.hue2, '--d': `${(index % 3) * 90}ms` } as React.CSSProperties}
      aria-labelledby={`svc-${service.id}-title`}
    >
      <div className="svc-card__top">
        <GlassTile icon={service.icon} size="md" hue={service.hue} hue2={service.hue2} />
        <span className="svc-card__num">{service.num}</span>
      </div>
      <h3 id={`svc-${service.id}-title`} className="svc-card__title">
        <Link to={servicePath(service)} className="svc-card__link">
          {service.title}
        </Link>
      </h3>
      <p className="svc-card__desc">{service.description}</p>
      <ul className="svc-card__points">
        {service.points.slice(0, 4).map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="svc-card__foot">
        <DeliveryChip days={service.deliveryDays} />
        <span className="svc-card__go" aria-hidden="true">
          <Icon name="arrowUpRight" />
        </span>
      </div>
    </article>
  );
}
