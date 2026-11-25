import { useEffect, useRef, useState } from 'react';
import {
  CONTACT,
  SERVICES,
  SERVICE_OPTIONS,
  branchesForService,
  programmesForService,
  projectTypesForService,
  type EnquiryPreset,
} from '../data/content';
import {
  ACCEPTED_FILES,
  ATTACHMENTS_ENABLED,
  HAS_BACKEND,
  checkFile,
  mailtoLink,
  submitEnquiry,
  validate,
  whatsappLink,
  type Enquiry,
  type Errors,
} from '../lib/enquiry';
import { SELECT_SERVICE_EVENT, peekPendingPreset, takePendingPreset } from '../lib/enquiryBus';
import { EmailText } from './EmailText';
import { Icon, WhatsAppIcon } from './Icons';
import { DeliveryChip } from './ServiceCard';

const EMPTY: Enquiry = { name: '', phone: '', email: '', service: '', branch: '', projectType: '', message: '' };
const ORDER: (keyof Enquiry)[] = ['name', 'phone', 'email', 'service', 'branch', 'projectType', 'message'];

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; name: string; service: string; phone: string; file?: string }
  | { kind: 'handoff'; channel: 'WhatsApp' | 'email' }
  | { kind: 'error'; message: string };

/** Applies a preset to the current values, keeping dependent fields consistent. */
function applyPreset(v: Enquiry, p: EnquiryPreset): Enquiry {
  if (!SERVICE_OPTIONS.includes(p.service)) return v;
  const branch = p.branch !== undefined ? p.branch : v.branch;
  return {
    ...v,
    service: p.service,
    branch: branch && branchesForService(p.service).includes(branch) ? branch : '',
    projectType: p.projectType && projectTypesForService(p.service).includes(p.projectType) ? p.projectType : '',
    // only pre-fill the description if the visitor hasn't written one yet
    message: p.message && !v.message.trim() ? p.message : v.message,
  };
}

interface Props {
  /** Service to pre-select (form value). */
  initialService?: string;
  title?: string;
}

/** The enquiry form. Delivers through Web3Forms when configured, otherwise hands off to WhatsApp / email. */
export function EnquiryForm({ initialService, title = 'Project enquiry' }: Props) {
  const [values, setValues] = useState<Enquiry>(() => {
    const pending = peekPendingPreset();
    if (pending) return applyPreset(EMPTY, pending);
    return initialService ? applyPreset(EMPTY, { service: initialService }) : EMPTY;
  });
  // the preset was applied above; clear it once this form is actually on screen
  useEffect(() => {
    takePendingPreset();
  }, []);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Enquiry, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [botcheck, setBotcheck] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // presets from service buttons, the planner or the guide while this form is on the page
  useEffect(() => {
    const onSelect = (e: Event) => {
      const p = (e as CustomEvent<EnquiryPreset>).detail;
      if (!p) return;
      setValues((v) => applyPreset(v, p));
      setErrors((er) => ({ ...er, service: undefined }));
      if (status.kind === 'sent') setStatus({ kind: 'idle' });
    };
    window.addEventListener(SELECT_SERVICE_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, onSelect);
  }, [status.kind]);

  // a later navigation with a pending preset (form already mounted, e.g. quote → quote)
  useEffect(() => {
    const onNav = () => {
      const p = takePendingPreset();
      if (p) setValues((v) => applyPreset(v, p));
    };
    window.addEventListener('yantra:navigate', onNav);
    return () => window.removeEventListener('yantra:navigate', onNav);
  }, []);

  const set = (k: keyof Enquiry) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let next = { ...values, [k]: e.target.value };
    if (k === 'service') next = applyPreset({ ...values, service: '' }, { service: e.target.value, branch: values.branch, projectType: values.projectType });
    setValues(next);
    if (touched[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
    if (status.kind === 'error' || status.kind === 'handoff') setStatus({ kind: 'idle' });
  };
  const blur = (k: keyof Enquiry) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate(values)[k] }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    const problem = checkFile(f);
    setFileError(problem);
    setFile(problem ? null : f);
    if (problem && fileRef.current) fileRef.current.value = '';
  };
  const clearFile = () => {
    setFile(null);
    setFileError(undefined);
    if (fileRef.current) fileRef.current.value = '';
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
      await submitEnquiry(values, botcheck, file);
      setStatus({ kind: 'sent', name: values.name.trim().split(/\s+/)[0], service: values.service, phone: values.phone.trim(), file: file?.name });
      setValues(EMPTY);
      setTouched({});
      clearFile();
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

  const academic = programmesForService(values.service).length > 0;
  const projectTypes = projectTypesForService(values.service);
  const chosen = SERVICES.find((s) => s.formValue === values.service);

  if (status.kind === 'sent')
    return (
      <div id="enquiry" className="enquiry enquiry--done">
        <div ref={statusRef} tabIndex={-1} className="enquiry__success" role="status" aria-live="polite">
          <span className="enquiry__success-icon" aria-hidden="true">
            <Icon name="check" />
          </span>
          <h3>Thank you{status.name ? `, ${status.name}` : ''}. Your enquiry has been sent.</h3>
          <p>
            We&rsquo;ve received your enquiry for <strong>{status.service}</strong>
            {status.file ? <> with the attachment <strong>{status.file}</strong></> : null}. Our team will contact you on{' '}
            <strong>{status.phone}</strong> or by email to discuss the next steps.
          </p>
          <div className="enquiry__success-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setStatus({ kind: 'idle' })}>
              Send another enquiry
            </button>
            <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn--light">
              <WhatsAppIcon /> Continue on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );

  return (
    <form id="enquiry" ref={formRef} className="enquiry" noValidate onSubmit={onSubmit} aria-labelledby="enquiry-title">
      <div className="enquiry__head">
        <h2 id="enquiry-title">{title}</h2>
        <span className="label">All fields required unless marked optional</span>
      </div>

      <div className="enquiry__grid">
        <div className="field field--full">
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
          {chosen && (
            <p className="field__hint">
              <DeliveryChip days={chosen.deliveryDays} /> <span>Estimate, subject to scope and requirements.</span>
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="f-name">Full name</label>
          <input type="text" autoComplete="name" maxLength={80} {...field('name')} />
          {err('name')}
        </div>
        <div className="field">
          <label htmlFor="f-phone">Mobile number</label>
          <input type="tel" autoComplete="tel" inputMode="tel" maxLength={18} placeholder="10-digit mobile number" {...field('phone')} />
          {err('phone')}
        </div>
        <div className="field field--full">
          <label htmlFor="f-email">Email</label>
          <input type="email" autoComplete="email" inputMode="email" maxLength={120} placeholder="name@example.com" {...field('email')} />
          {err('email')}
        </div>

        {academic && (
          <div className="field field--full field--reveal">
            <label htmlFor="f-branch">
              Programme / branch <span className="field__opt">(optional)</span>
            </label>
            <div className="select">
              <select {...field('branch')}>
                <option value="">Not specified</option>
                {branchesForService(values.service).map((o) => (
                  <option key={o}>{o}</option>
                ))}
                <option>Other</option>
              </select>
            </div>
          </div>
        )}
        {projectTypes.length > 0 && (
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
          <label htmlFor="f-message">Project requirements</label>
          <textarea
            rows={5}
            maxLength={2000}
            placeholder="What would you like to build? Include features, components, deadlines or college format if relevant."
            {...field('message')}
          />
          <div className="field__meta">
            {err('message')}
            <span className="field__count" aria-hidden="true">
              {values.message.length}/2000
            </span>
          </div>
        </div>

        <div className="field field--full">
          <span className="field__legend" id="f-file-label">
            Reference documents or images <span className="field__opt">(optional)</span>
          </span>
          {ATTACHMENTS_ENABLED ? (
            <>
              <label className={`dropzone${file ? ' has-file' : ''}`}>
                <input
                  ref={fileRef}
                  type="file"
                  name="attachment"
                  accept={ACCEPTED_FILES}
                  onChange={onFile}
                  aria-labelledby="f-file-label"
                  aria-describedby={fileError ? 'f-file-err' : 'f-file-hint'}
                  aria-invalid={fileError ? true : undefined}
                />
                <Icon name="upload" />
                <span>{file ? file.name : 'Choose a file or drop it here'}</span>
                <small id="f-file-hint">PDF, Word, PowerPoint, text or image · up to 5 MB</small>
              </label>
              {file && (
                <button type="button" className="link-btn" onClick={clearFile}>
                  Remove file
                </button>
              )}
              {fileError && (
                <p id="f-file-err" className="field__error">
                  {fileError}
                </p>
              )}
            </>
          ) : (
            <p className="field__note">
              <Icon name="upload" />
              <span>
              Have reference files or photos? Send them on{' '}
              <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>{' '}
              or to{' '}
              <a href={`mailto:${CONTACT.email}`}>
                <EmailText />
              </a>{' '}
              after you submit, and mention your name.
              </span>
            </p>
          )}
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
          <>
            <button type="submit" className="btn btn--light" disabled={status.kind === 'sending'} aria-busy={status.kind === 'sending'}>
              {status.kind === 'sending' ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Sending…
                </>
              ) : (
                <>
                  Submit enquiry <Icon name="arrow" />
                </>
              )}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => handoff('WhatsApp')} disabled={status.kind === 'sending'}>
              <WhatsAppIcon /> Send via WhatsApp
            </button>
          </>
        ) : (
          <>
            <button type="submit" className="btn btn--light">
              <WhatsAppIcon /> Send via WhatsApp
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => handoff('email')}>
              Send via Email
            </button>
          </>
        )}
      </div>

      <div ref={statusRef} tabIndex={-1} className="enquiry__status" role="status" aria-live="polite">
        {status.kind === 'handoff' && (
          <p className="notice notice--info">
            {status.channel === 'WhatsApp' ? (
              <>
                <strong>WhatsApp opened with your enquiry.</strong> It is not delivered until you press <em>Send</em> in WhatsApp. If nothing
                opened,{' '}
                <a href={whatsappLink(values)} target="_blank" rel="noopener noreferrer">
                  open WhatsApp here
                </a>{' '}
                or <a href={mailtoLink(values)}>send it by email</a>.
              </>
            ) : (
              <>
                <strong>Your email app opened with the enquiry.</strong> It is not delivered until you send that email. If nothing opened,
                write to{' '}
                <a href={`mailto:${CONTACT.email}`}>
                  <EmailText />
                </a>
                .
              </>
            )}
          </p>
        )}
        {status.kind === 'error' && (
          <p className="notice notice--err">
            <strong>Not sent.</strong> {status.message} Please try again, or reach us directly on{' '}
            <a href={whatsappLink(values)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            , <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a> or <a href={mailtoLink(values)}>email</a>.
          </p>
        )}
      </div>
      {!HAS_BACKEND && (
        <p className="fineprint">Your details are passed to WhatsApp or your email app to send. Nothing is stored on this website.</p>
      )}
    </form>
  );
}
