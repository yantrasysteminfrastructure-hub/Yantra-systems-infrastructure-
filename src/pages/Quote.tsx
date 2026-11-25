import { DELIVERY_NOTE, SERVICES, serviceBySlug } from '../data/content';
import { requestService } from '../lib/enquiryBus';
import { useLocation } from '../lib/router';
import { EnquiryForm } from '../components/EnquiryForm';
import { GlassTile } from '../components/Glow';
import { PageHero } from '../components/PageHero';
import { DeliveryChip } from '../components/ServiceCard';

export default function Quote() {
  const { search } = useLocation();
  const initial = serviceBySlug(search.get('service') ?? '')?.formValue;
  return (
    <>
      <PageHero
        eyebrow="Request a quote"
        title={
          <>
            Let&rsquo;s scope your <span className="grad">project.</span>
          </>
        }
        lead="Pick a service, tell us what you need, and the team will come back to you with the scope, timeline and next steps."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Request a Quote' }]}
        hue="#fc4728"
        hue2="#ffb36b"
      />

      <section className="section quote" aria-labelledby="pick-title">
        <div className="container">
          <h2 id="pick-title" className="label quote__label" data-reveal>
            1 · Choose a service
          </h2>
          <ul className="pick-grid" data-reveal>
            {SERVICES.map((s) => (
              <li key={s.id}>
                <button type="button" className="pick" onClick={() => requestService(s.formValue)} style={{ '--hue': s.hue, '--hue2': s.hue2 } as React.CSSProperties}>
                  <GlassTile icon={s.icon} size="sm" hue={s.hue} hue2={s.hue2} />
                  <span className="pick__t">{s.title}</span>
                  <DeliveryChip days={s.deliveryDays} compact />
                </button>
              </li>
            ))}
          </ul>
          <p className="fineprint">{DELIVERY_NOTE}</p>

          <h2 className="label quote__label" data-reveal>
            2 · Tell us about it
          </h2>
          <div className="quote__form" data-reveal>
            <EnquiryForm initialService={initial} title="Quote request" />
          </div>
        </div>
      </section>
    </>
  );
}
