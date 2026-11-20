import { CONTACT } from '../data/content';

/** Email address that may wrap only after the @ on narrow screens. */
export function EmailText() {
  const [user, domain] = CONTACT.email.split('@');
  return (
    <>
      {user}@<wbr />
      {domain}
    </>
  );
}
