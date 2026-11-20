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
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const reduced = useReducedMotion();
  const [heroRef, heroInView] = useInView<HTMLElement>('0px');
  // auto-advance only while the hero is visible, not paused, and motion is allowed
  const running = !paused && !holding && heroInView && !reduced;
  const next = () => setSlide((i) => (i + 1) % HERO_SLIDES.length);

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
        {webgl && (
          <div
            className={`showcase${running ? '' : ' is-paused'}${reduced ? ' is-static' : ''}`}
            role="group"
            aria-label="3D showcase"
            // hold while a mouse hovers or a keyboard user is on the controls (not after a tap)
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHolding(true)}
            onPointerLeave={() => setHolding(false)}
            onFocus={(e) => e.target.matches(':focus-visible') && setHolding(true)}
            onBlur={() => setHolding(false)}
          >
            <ol className="showcase__tabs">
              {HERO_SLIDES.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`showcase__tab${i === slide ? ' is-on' : ''}${i < slide ? ' is-done' : ''}`}
                    aria-current={i === slide ? 'true' : undefined}
                    onClick={() => setSlide(i)}
                  >
                    <span className="showcase__label">{s.label}</span>
                    <span className="showcase__track" aria-hidden="true">
                      {i === slide && (
                        <span
                          key={slide}
                          className="showcase__fill"
                          style={{ animationDuration: `${HERO_SLIDE_MS}ms` }}
                          onAnimationEnd={next}
                        />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            {!reduced && (
              <button
                type="button"
                className="showcase__pause"
                aria-label={paused ? 'Play showcase' : 'Pause showcase'}
                aria-pressed={paused}
                onClick={() => setPaused((p) => !p)}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">{paused ? <path d="M7 5v10l8-5z" /> : <path d="M7 5v10M13 5v10" />}</svg>
              </button>
            )}
          </div>
        )}
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
