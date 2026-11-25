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

/**
 * Web3Forms accepts file attachments only on its paid plan, so uploads are switched on explicitly
 * with VITE_WEB3FORMS_ATTACHMENTS=true once the plan supports them.
 */
export const ATTACHMENTS_ENABLED = HAS_BACKEND && (import.meta.env.VITE_WEB3FORMS_ATTACHMENTS as string | undefined)?.trim() === 'true';
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_FILES = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp';
const ACCEPTED_EXT = /\.(pdf|docx?|pptx?|txt|jpe?g|png|webp)$/i;

/** Returns an error message for a file that cannot be attached, or undefined when it is fine. */
export function checkFile(file: File | null): string | undefined {
  if (!file) return undefined;
  if (!ACCEPTED_EXT.test(file.name)) return 'Attach a PDF, Word, PowerPoint, text or image file.';
  if (file.size > MAX_FILE_BYTES) return 'The file is larger than 5 MB. Please attach a smaller file, or share it on WhatsApp or email.';
  return undefined;
}

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
export async function submitEnquiry(v: Enquiry, botcheck: string, file: File | null = null): Promise<void> {
  if (!HAS_BACKEND) throw new Error('No form backend configured.');
  const fields: Record<string, string> = {
    access_key: ACCESS_KEY,
    subject: `Project enquiry: ${v.service} — ${v.name.trim()}`,
    from_name: 'Yantra Systems & Infrastructure website',
    replyto: v.email.trim(),
    name: v.name.trim(),
    phone: v.phone.trim(),
    email: v.email.trim(),
    service: v.service,
    branch: v.branch || 'Not specified',
    project_type: v.projectType || 'Not specified',
    message: v.message.trim(),
    botcheck,
  };
  let body: BodyInit;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (file && ATTACHMENTS_ENABLED) {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, val]) => fd.append(k, val));
    fd.append('attachment', file, file.name);
    body = fd; // the browser sets the multipart boundary
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(fields);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), file ? 45000 : 15000);
  try {
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers, body, signal: controller.signal });
    const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
    if (!res.ok || !data?.success) throw new Error(data?.message || `Request failed (${res.status}).`);
  } finally {
    clearTimeout(timer);
  }
}
