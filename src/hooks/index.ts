import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { navigate } from '../lib/router';

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    get() {
      return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches;
    },
  };
}

export function useMediaQuery(query: string): boolean {
  const ref = useRef(mediaStore(query));
  return useSyncExternalStore(ref.current.subscribe, ref.current.get, () => false);
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)');

let webglCache: boolean | null = null;
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement('canvas');
    webglCache = !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    webglCache = false;
  }
  return webglCache;
}

/** Tracks whether an element is in (or near) the viewport. */
export function useInView<T extends Element>(rootMargin = '0px', once = false) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);
  return [ref, inView] as const;
}

/**
 * Adds `is-visible` to every `[data-reveal]` element as it scrolls into view, including
 * elements that mount later (route changes, lazy sections).
 */
export function useRevealOnScroll() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || typeof MutationObserver === 'undefined') {
      const showAll = () => document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      showAll();
      const id = setInterval(showAll, 500);
      return () => clearInterval(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (!queued) queued = requestAnimationFrame(() => ((queued = 0), scan()));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);
}

/** Returns the id of the section currently under the upper-middle of the viewport. */
export function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ids]);
  return active;
}

/** 0 → 1 progress of an element travelling through the viewport. */
export function useElementProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.75 - r.top) / (r.height || 1);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return [ref, progress] as const;
}

/** Sections that live on another page: scrolling to them navigates there first. */
const SECTION_ROUTES: Record<string, string> = {
  home: '/',
  about: '/about',
  process: '/about#process',
  why: '/about#why',
  services: '/services',
  turnaround: '/#turnaround',
  ways: '/#ways',
  domains: '/projects#domains',
  ideas: '/projects#ideas',
  projects: '/projects',
  contact: '/contact',
  enquiry: '/quote#enquiry',
};

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) {
    const route = SECTION_ROUTES[id];
    if (route) navigate(route.includes('#') ? route : `${route}#${id}`);
    return;
  }
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (id !== 'home' && location.hash !== '#' + id) history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
}
