import { useLocation } from '../lib/router';
import { serviceBySlug } from '../data/content';
import { ContactCards } from '../components/ContactCards';
import { EnquiryForm } from '../components/EnquiryForm';
import { PageHero } from '../components/PageHero';

export default function Contact() {
  const { search } = useLocation();
  const initial = serviceBySlug(search.get('service') ?? '')?.formValue;
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={
          <>
            Have an idea? <span className="grad">Let&rsquo;s talk.</span>
          </>
        }
        lead="Call, WhatsApp or email the team, or send an enquiry below. We'll get back to you to understand your needs and discuss the next steps."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]}
        hue="#35c8ff"
        hue2="#b8f0ff"
      >
        <ContactCards compact />
      </PageHero>

      <section className="section contact" aria-label="Enquiry form">
        <div className="container contact__grid">
          <div className="contact__intro">
            <p className="eyebrow" data-reveal>
              Send an enquiry
            </p>
            <h2 className="h2 h2--sm" data-reveal>
              Tell us about your <span className="grad">project.</span>
            </h2>
            <p className="lead" data-reveal>
              Choose the service, describe what you need and how to reach you. The more detail you share, the faster we can scope it.
            </p>
            <ul className="tick-list" data-reveal>
              <li>Pick from all five services</li>
              <li>Estimated delivery shown for each</li>
              <li>We reply by phone or email</li>
            </ul>
          </div>
          <EnquiryForm initialService={initial} />
        </div>
      </section>
    </>
  );
}
