import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Domains } from './components/Domains';
import { Process } from './components/Process';
import { Why } from './components/Why';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { useRevealOnScroll } from './hooks';

const Guide = lazy(() => import('./guide/Guide'));

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

export default function App() {
  useRevealOnScroll();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Domains />
        <Process />
        <Why />
        <Contact />
      </main>
      <Footer />
      <GuideMount />
    </>
  );
}
