/*
 * A minimal History-API router. The site has a handful of static routes, so a dependency
 * would add weight without adding anything. Vercel rewrites every path to index.html (vercel.json).
 */
import { forwardRef, useSyncExternalStore, type AnchorHTMLAttributes } from 'react';

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') window.addEventListener('popstate', notify);

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const snapshot = () => location.pathname + location.search + location.hash;

/** Current location as `/path?search#hash`. Re-renders on navigation. */
export function useLocation() {
  const href = useSyncExternalStore(subscribe, snapshot, () => '/');
  const url = new URL(href, 'http://x');
  return { pathname: normalise(url.pathname), search: url.searchParams, hash: url.hash.slice(1), href };
}

/** Strips a trailing slash so `/about/` and `/about` match the same route. */
export function normalise(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export function navigate(to: string, { replace = false } = {}) {
  if (to === snapshot()) {
    // same URL: still honour the hash (e.g. clicking "Services" twice)
    notify();
    window.dispatchEvent(new Event('yantra:navigate'));
    return;
  }
  if (replace) history.replaceState(null, '', to);
  else history.pushState(null, '', to);
  notify();
  window.dispatchEvent(new Event('yantra:navigate'));
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/** An <a> that navigates without a page reload (modified clicks still open normally). */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, onClick, ...rest }, ref) {
  return (
    <a
      ref={ref}
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return;
        e.preventDefault();
        navigate(to);
      }}
    />
  );
});

/** Sets the document title, description and canonical URL for the current page. */
export function setPageMeta(title: string, description: string, path: string) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  const url = `https://yantra-lyart.vercel.app${path === '/' ? '/' : path}`;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
}
