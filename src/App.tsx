import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { COMPANY, deliveryLabel, serviceBySlug } from './data/content';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setPageMeta, useLocation } from './lib/router';
import { useRevealOnScroll } from './hooks';
import Home from './pages/Home';

// Home ships in the main bundle; other pages load on demand.
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));
const Quote = lazy(() => import('./pages/Quote'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Guide = lazy(() => import('./guide/Guide'));

const SUFFIX = ` | ${COMPANY.name}`;

interface Route {
  page: ComponentType<any>;
  props?: Record<string, unknown>;
  title: string;
  description: string;
}

function resolve(pathname: string): Route {
  switch (pathname) {
    case '/':
      return {
        page: Home,
        title: `${COMPANY.name} | Embedded Systems, Engineering Projects, Web & App Development`,
        description:
          'Yantra Systems & Infrastructure: ESP32, Arduino and IoT embedded systems, B.Tech engineering projects, project documentation, school projects, website design and mobile app development.',
      };
    case '/about':
      return {
        page: About,
        title: `About Us${SUFFIX}`,
        description: `${COMPANY.name} works across embedded systems, engineering and academic projects, documentation and software development. ${COMPANY.tagline}`,
      };
    case '/services':
      return {
        page: Services,
        title: `Our Services${SUFFIX}`,
        description: `Embedded systems & engineering projects, project documentation, school projects, website development and mobile app development, with estimated delivery from ${deliveryLabel(1)}.`,
      };
    case '/projects':
      return {
        page: Projects,
        title: `Our Projects${SUFFIX}`,
        description: 'A delivered Yantra project, a project planner for B.Tech, Degree, MBA and school students, and a library of project ideas.',
      };
    case '/contact':
      return { page: Contact, title: `Contact Us${SUFFIX}`, description: `Contact ${COMPANY.name} by phone, WhatsApp or email, or send a project enquiry.` };
    case '/quote':
      return {
        page: Quote,
        title: `Request a Quote${SUFFIX}`,
        description: `Request a quote from ${COMPANY.name}. Choose a service, describe your project and the team will get back to you.`,
      };
  }
  const m = /^\/services\/([a-z0-9-]+)$/.exec(pathname);
  const s = m && serviceBySlug(m[1]);
  if (s)
    return {
      page: ServiceDetail,
      props: { service: s },
      title: `${s.title}${SUFFIX}`,
      description: `${s.description} Estimated delivery: ${deliveryLabel(s.deliveryDays)}.`,
    };
  return { page: NotFound, title: `Page not found${SUFFIX}`, description: 'The page you were looking for could not be found.' };
}

/** Loads the guide once the page has finished loading, so it never delays the first paint. */
function GuideMount() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      else window.setTimeout(() => setReady(true), 1200);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }, []);
  return ready ? (
    <Suspense fallback={null}>
      <Guide />
    </Suspense>
  ) : null;
}

/** Scrolls to the URL hash once its element exists (pages load lazily), else to the top. */
function useScrollOnNavigate(pathname: string, hash: string) {
  const first = useRef(true);
  useLayoutEffect(() => {
    const initial = first.current;
    first.current = false;
    if (!hash) {
      if (!initial) window.scrollTo(0, 0);
      return;
    }
    let tries = 0;
    let raf = 0;
    const find = () => {
      const el = document.getElementById(decodeURIComponent(hash));
      if (el) {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: initial || reduce ? 'auto' : 'smooth', block: 'start' });
      } else if (tries++ < 120) raf = requestAnimationFrame(find);
    };
    if (!initial) window.scrollTo(0, 0);
    find();
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
}

export default function App() {
  useRevealOnScroll();
  const { pathname, hash } = useLocation();
  const route = resolve(pathname);
  const Page = route.page;
  const mainRef = useRef<HTMLElement>(null);
  const firstPaint = useRef(true);

  useScrollOnNavigate(pathname, hash);

  useEffect(() => {
    setPageMeta(route.title, route.description, pathname);
    // after client-side navigation, move focus to the new page for keyboard / screen-reader users
    if (firstPaint.current) firstPaint.current = false;
    else if (!hash) mainRef.current?.focus({ preventScroll: true });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // hide the boot screen once the first page is on screen
  useEffect(() => {
    const boot = document.getElementById('boot');
    if (!boot) return;
    boot.classList.add('is-done');
    const t = window.setTimeout(() => boot.remove(), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<div className="page-loading" role="status" aria-label="Loading page"><span className="spinner" /></div>}>
            <Page key={pathname} {...route.props} />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <GuideMount />
    </>
  );
}

