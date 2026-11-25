import { lazy, Suspense, useEffect, useState } from 'react';
import { hasWebGL, scrollToId, useInView, useReducedMotion } from '../hooks';
import { HERO_SLIDES, HERO_SLIDE_MS } from '../data/heroSlides';
import { PcbFallback } from './visuals/PcbFallback';

const HeroScene = lazy(() => import('../three/HeroScene'));

const CAPABILITIES = ['Embedded Systems & IoT', 'B.Tech & Degree Projects', 'Project Documentation', 'Web & Mobile Apps', 'Civil Works'];

export function Hero() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => setWebgl(hasWebGL()), []);
  const [slide, setSlide] = useState(0);
  const reduced = useReducedMotion();
  const [heroRef, heroInView] = useInView<HTMLElement>('0px');
  // the 3D changes by itself every few seconds while the hero is on screen (not for reduced motion)
  useEffect(() => {
    if (!webgl || !heroInView || reduced) return;
    const id = window.setInterval(() => setSlide((i) => (i + 1) % HERO_SLIDES.length), HERO_SLIDE_MS);
    return () => clearInterval(id);
  }, [webgl, heroInView, reduced]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <section id="home" ref={heroRef} className="hero" aria-labelledby="hero-title">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__visual">
        {webgl === false ? (
          <PcbFallback />
        ) : webgl ? (
          <Suspense fallback={<div className="hero__canvas hero__canvas--loading" aria-hidden="true" />}>
            <HeroScene slide={slide} />
          </Suspense>
        ) : null}
      </div>

      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--dark hero__eyebrow">
            <span className="eyebrow__dot" /> Yantra Systems &amp; Infrastructure
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="line"><span>Engineering</span></span>
            <span className="line"><span><em className="hl">Ideas</em> into</span></span>
            <span className="line"><span className="hl">Reality.</span></span>
          </h1>
          <p className="hero__lead">
            From embedded systems and academic engineering projects to software development and infrastructure solutions, Yantra
            transforms technical ideas into practical outcomes.
          </p>
          <div className="hero__actions">
            <a href="#services" className="btn btn--lime" onClick={go('services')}>
              Explore Our Services
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>
            </a>
            <a href="#contact" className="btn btn--ghost" onClick={go('contact')}>
              Contact Our Team
            </a>
          </div>
        </div>
      </div>

      <div className="container hero__foot">
        <ul className="hero__caps" aria-label="What we do">
          {CAPABILITIES.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <a href="#about" className="scroll-cue" onClick={go('about')}>
          <span className="scroll-cue__track" aria-hidden="true"><span /></span>
          Scroll
        </a>
      </div>
    </section>
  );
}
