import type { EnquiryPreset } from '../data/content';
import { scrollToId } from '../hooks';
import { navigate } from './router';

export const SELECT_SERVICE_EVENT = 'yantra:select-service';

let pending: EnquiryPreset | null = null;

/** Reads the waiting preset without consuming it (safe during render, which React may repeat). */
export function peekPendingPreset() {
  return pending;
}

/** The preset waiting for a form that has not mounted yet (taken once; call from effects only). */
export function takePendingPreset() {
  const p = pending;
  pending = null;
  return p;
}

/**
 * Pre-fills the enquiry form (service, and optionally branch / project type / message) and
 * takes the visitor to it: on this page if a form is here, otherwise on the quote page.
 */
export function requestEnquiry(preset: EnquiryPreset) {
  if (document.getElementById('enquiry')) {
    window.dispatchEvent(new CustomEvent<EnquiryPreset>(SELECT_SERVICE_EVENT, { detail: preset }));
    scrollToId('enquiry');
    return;
  }
  pending = preset;
  navigate('/quote#enquiry');
}

export function requestService(service: string) {
  requestEnquiry({ service });
}
