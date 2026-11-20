import { CONTACT } from '../data/content';

export interface Enquiry {
  name: string;
  phone: string;
  email: string;
  service: string;
  branch: string;
  projectType: string;
  message: string;
}

export type Errors = Partial<Record<keyof Enquiry, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(v: Enquiry): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  if (!name) e.name = 'Please enter your full name.';
  else if (name.length < 2 || name.length > 80) e.name = 'Name should be between 2 and 80 characters.';

  const digits = v.phone.replace(/\D/g, '');
  if (!v.phone.trim()) e.phone = 'Please enter a phone number we can reach you on.';
  else if (!/^[+\d\s()-]+$/.test(v.phone.trim()) || digits.length < 10 || digits.length > 13)
    e.phone = 'Enter a valid phone number (10 digits, optionally with country code).';

  if (!v.email.trim()) e.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address, e.g. name@example.com.';

  if (!v.service) e.service = 'Please choose the service you need.';

  const msg = v.message.trim();
  if (!msg) e.message = 'Please describe your project or requirement.';
  else if (msg.length < 20) e.message = 'Please add a little more detail (at least 20 characters).';
  else if (msg.length > 2000) e.message = 'Please keep the description under 2000 characters.';
  return e;
}

export const ACCESS_KEY: string = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim() ?? '';
export const HAS_BACKEND = ACCESS_KEY.length > 0;

function summary(v: Enquiry) {
  return [
    'New project enquiry — Yantra Systems & Infrastructure',
    '',
    `Name: ${v.name.trim()}`,
    `Phone: ${v.phone.trim()}`,
    `Email: ${v.email.trim()}`,
    `Service: ${v.service}`,
    v.branch ? `Branch: ${v.branch}` : null,
    v.projectType ? `Project type: ${v.projectType}` : null,
    '',
    'Requirement:',
    v.message.trim(),
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export function whatsappLink(v: Enquiry) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(summary(v))}`;
}

export function mailtoLink(v: Enquiry) {
  const subject = `Project enquiry: ${v.service} — ${v.name.trim()}`;
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary(v))}`;
}

/** Sends the enquiry through Web3Forms (delivers to the configured inbox). Throws on failure. */
export async function submitEnquiry(v: Enquiry, botcheck: string): Promise<void> {
  if (!HAS_BACKEND) throw new Error('No form backend configured.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `Project enquiry: ${v.service} — ${v.name.trim()}`,
        from_name: 'Yantra website',
        replyto: v.email.trim(),
        name: v.name.trim(),
        phone: v.phone.trim(),
        email: v.email.trim(),
        service: v.service,
        branch: v.branch || 'Not specified',
        project_type: v.projectType || 'Not specified',
        message: v.message.trim(),
        botcheck,
      }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
    if (!res.ok || !data?.success) throw new Error(data?.message || `Request failed (${res.status}).`);
  } finally {
    clearTimeout(timer);
  }
}
