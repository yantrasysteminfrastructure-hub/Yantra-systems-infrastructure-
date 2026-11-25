import { useEffect, useRef, useState } from 'react';
import { ALL_BRANCHES, CONTACT, SERVICE_OPTIONS, programmeForService, typesFor, type EnquiryPreset } from '../data/content';
import { EmailText } from './EmailText';
import { HAS_BACKEND, mailtoLink, submitEnquiry, validate, whatsappLink, type Enquiry, type Errors } from '../lib/enquiry';
import { SELECT_SERVICE_EVENT } from './Services';

const EMPTY: Enquiry = { name: '', phone: '', email: '', service: '', branch: '', projectType: '', message: '' };
const ORDER: (keyof Enquiry)[] = ['name', 'phone', 'email', 'service', 'branch', 'projectType', 'message'];

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'handoff'; channel: 'WhatsApp' | 'email' }
  | { kind: 'error'; message: string };

const ACADEMIC = /B\.Tech|Degree|Documentation|MBA|School/;

/** Branches relevant to the chosen service (all branches when it isn't a student programme). */
function branchesFor(service: string) {
  const p = programmeForService(service);
  return p ? p.branches.map((b) => b.title) : ALL_BRANCHES;
}

/** Project types offered for the chosen service's programme. */
function typeOptionsFor(service: string) {
  const p = programmeForService(service);
  return p ? typesFor(p).map((t) => t.label) : [];
}

export function Contact() {
  const [values, setValues] = useState<Enquiry>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Enquiry, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [botcheck, setBotcheck] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const p = (e as CustomEvent<EnquiryPreset>).detail;
      if (!p || !SERVICE_OPTIONS.includes(p.service)) return;
      setValues((v) => {
        const branch = p.branch !== undefined ? p.branch : v.branch;
        return {
          ...v,
          service: p.service,
          branch: branch && branchesFor(p.service).includes(branch) ? branch : '',
          projectType: p.projectType && typeOptionsFor(p.service).includes(p.projectType) ? p.projectType : '',
          // only pre-fill the description if the visitor hasn't written one yet
          message: p.message && !v.message.trim() ? p.message : v.message,
        };
      });
      setErrors((er) => ({ ...er, service: undefined }));
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, []);

  const set = (k: keyof Enquiry) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...values, [k]: e.target.value };
    if (k === 'service') {
      // keep dependent fields consistent with the chosen service
      if (next.branch && next.branch !== 'Other' && !branchesFor(next.service).includes(next.branch)) next.branch = '';
      if (!typeOptionsFor(next.service).includes(next.projectType)) next.projectType = '';
    }
    setValues(next);
    if (touched[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
    if (status.kind === 'error' || status.kind === 'handoff') setStatus({ kind: 'idle' });
  };
  const blur = (k: keyof Enquiry) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate(values)[k] }));
  };

  /** Validates everything; focuses the first invalid field. */
  const check = () => {
    const errs = validate(values);
    setErrors(errs);
    setTouched(Object.fromEntries(ORDER.map((k) => [k, true])));
    const first = ORDER.find((k) => errs[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === 'sending') return;
    if (!check()) return;
    if (!HAS_BACKEND) {
      handoff('WhatsApp');
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      await submitEnquiry(values, botcheck);
      setStatus({ kind: 'sent' });
      setValues(EMPTY);
      setTouched({});
    } catch (err) {
      const offline = typeof navigator !== 'undefined' && !navigator.onLine;
      setStatus({
        kind: 'error',
        message: offline
          ? 'You appear to be offline, so the enquiry was not sent.'
          : `Your enquiry could not be sent (${err instanceof Error ? err.message : 'unknown error'}).`,
      });
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const handoff = (channel: 'WhatsApp' | 'email') => {
    if (!check()) return;
    const url = channel === 'WhatsApp' ? whatsappLink(values) : mailtoLink(values);
    if (channel === 'WhatsApp') window.open(url, '_blank', 'noopener,noreferrer');
    else window.location.href = url;
    setStatus({ kind: 'handoff', channel });
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const field = (k: keyof Enquiry) => ({
    id: `f-${k}`,
    name: k,
    value: values[k],
    onChange: set(k),
    onBlur: blur(k),
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `f-${k}-err` : undefined,
  });
  const err = (k: keyof Enquiry) =>
    errors[k] ? (
      <p id={`f-${k}-err`} className="field__error">
        {errors[k]}
      </p>
    ) : null;

  const showBranch = !values.service || ACADEMIC.test(values.service);
  const projectTypes = typeOptionsFor(values.service);
  const showProjectType = projectTypes.length > 0;

  return (
    <section id="contact" className="section section--dark contact" aria-labelledby="contact-title">
      <div className="contact__glow" aria-hidden="true" />
      <div className="container contact__grid">
        <div className="contact__intro">
          <p className="eyebrow eyebrow--dark" data-reveal>
            <span className="eyebrow__num">06</span> Project Enquiry
          </p>
          <h2 id="contact-title" className="h2 contact__title" data-reveal>
            Have an idea? <span className="hl">Let&rsquo;s engineer it.</span>
          </h2>
          <p className="lead lead--dark" data-reveal>
            Tell us about your requirement. Our team will connect with you to understand your needs and discuss the next steps.
          </p>
          <ul className="contact-cards" data-reveal>
            <li>
              <a href={CONTACT.phoneHref} className="contact-card">
                <span className="label label--dark">Phone</span>
                <span className="contact-card__v">{CONTACT.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="contact-card">
                <span className="label label--dark">Email</span>
                <span className="contact-card__v break"><EmailText /></span>
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="contact-card">
                <span className="label label--dark">WhatsApp</span>
                <span className="contact-card__v">Chat with us</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.website} className="contact-card">
                <span className="label label--dark">Website</span>
                <span className="contact-card__v break">yantra-lyart.vercel.app</span>
              </a>
            </li>
          </ul>
        </div>

        <form ref={formRef} className="enquiry" noValidate onSubmit={onSubmit} aria-labelledby="enquiry-title" data-reveal>
          <div className="enquiry__head">
            <h3 id="enquiry-title">Project enquiry</h3>
            <span className="label">All fields required unless marked optional</span>
          </div>

          <div className="enquiry__grid">
            <div className="field">
              <label htmlFor="f-name">Full name</label>
              <input type="text" autoComplete="name" maxLength={80} {...field('name')} />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor="f-phone">Phone number</label>
              <input type="tel" autoComplete="tel" inputMode="tel" maxLength={18} placeholder="10-digit mobile number" {...field('phone')} />
              {err('phone')}
            </div>
            <div className="field field--full">
              <label htmlFor="f-email">Email</label>
              <input type="email" autoComplete="email" inputMode="email" maxLength={120} {...field('email')} />
              {err('email')}
            </div>
            <div className="field">
              <label htmlFor="f-service">Service required</label>
              <div className="select">
                <select {...field('service')}>
                  <option value="" disabled>
                    Select a service
                  </option>
                  {SERVICE_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              {err('service')}
            </div>
            <div className={`field${showBranch ? '' : ' field--muted'}`}>
              <label htmlFor="f-branch">
                Branch <span className="field__opt">(if applicable)</span>
              </label>
              <div className="select">
                <select {...field('branch')}>
                  <option value="">Not applicable</option>
                  {branchesFor(values.service).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                  <option>Other</option>
                </select>
              </div>
            </div>
            {showProjectType && (
              <fieldset className="field field--full field--reveal">
                <legend className="field__legend">
                  Type of project <span className="field__opt">(optional)</span>
                </legend>
                <div className="choice-row">
                  {projectTypes.map((o) => (
                    <label key={o} className={`choice${values.projectType === o ? ' is-on' : ''}`}>
                      <input type="radio" name="projectType" value={o} checked={values.projectType === o} onChange={set('projectType')} />
                      {o}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <div className="field field--full">
              <label htmlFor="f-message">Project or service description</label>
              <textarea rows={5} maxLength={2000} placeholder="What would you like to build or get help with?" {...field('message')} />
              <div className="field__meta">
                {err('message')}
                <span className="field__count" aria-hidden="true">
                  {values.message.length}/2000
                </span>
              </div>
            </div>
            {/* honeypot for bots */}
            <input
              type="checkbox"
              name="botcheck"
              className="hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              checked={botcheck === 'on'}
              onChange={(e) => setBotcheck(e.target.checked ? 'on' : '')}
            />
          </div>

          <div className="enquiry__actions">
            {HAS_BACKEND ? (
              <button type="submit" className="btn btn--lime" disabled={status.kind === 'sending'} aria-busy={status.kind === 'sending'}>
                {status.kind === 'sending' ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Sending…
                  </>
                ) : (
                  'Send Enquiry'
                )}
              </button>
            ) : (
              <>
                <button type="submit" className="btn btn--lime">
                  Send via WhatsApp
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => handoff('email')}>
                  Send via Email
                </button>
              </>
            )}
          </div>

          <div ref={statusRef} tabIndex={-1} className="enquiry__status" role="status" aria-live="polite">
            {status.kind === 'sent' && (
              <p className="notice notice--ok">
                <strong>Enquiry sent.</strong> Thank you — our team will contact you to discuss the next steps.
              </p>
            )}
            {status.kind === 'handoff' && (
              <p className="notice notice--info">
                {status.channel === 'WhatsApp' ? (
                  <>
                    <strong>WhatsApp opened with your enquiry.</strong> It is not delivered until you press <em>Send</em> in WhatsApp.
                    If nothing opened, <a href={whatsappLink(values)} target="_blank" rel="noopener noreferrer">open WhatsApp here</a> or{' '}
                    <a href={mailtoLink(values)}>send it by email</a>.
                  </>
                ) : (
                  <>
                    <strong>Your email app opened with the enquiry.</strong> It is not delivered until you send that email. If nothing
                    opened, write to <a href={`mailto:${CONTACT.email}`}><EmailText /></a>.
                  </>
                )}
              </p>
            )}
            {status.kind === 'error' && (
              <p className="notice notice--err">
                <strong>Not sent.</strong> {status.message} Please try again, or reach us directly on{' '}
                <a href={whatsappLink(values)} target="_blank" rel="noopener noreferrer">WhatsApp</a>,{' '}
                <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a> or <a href={mailtoLink(values)}>email</a>.
              </p>
            )}
          </div>
          {!HAS_BACKEND && (
            <p className="fineprint fineprint--dark">
              Your details are passed to WhatsApp or your email app to send — nothing is stored on this website.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
