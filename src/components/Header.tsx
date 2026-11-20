import { useEffect, useRef, useState } from 'react';
import { CONTACT, NAV_ITEMS } from '../data/content';
import { EmailText } from './EmailText';
import { scrollToId, useScrollSpy } from '../hooks';
import { Logo } from './Logo';

const SPY_IDS = ['home', 'about', 'services', 'domains', 'process', 'why', 'contact'] as const;

export function Header() {
  const active = useScrollSpy(SPY_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef.current) menuRef.current.inert = !open;
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // let the menu close before scrolling so the scroll lock is released
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container site-header__bar">
        <a href="#home" className="site-header__brand" onClick={go('home')} aria-label="Yantra Systems & Infrastructure — back to top">
          <Logo />
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  className={active === item.id ? 'is-active' : undefined}
                  aria-current={active === item.id ? 'location' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a href="#contact" className="btn btn--lime btn--sm site-header__cta" onClick={go('contact')}>
          Let&rsquo;s Discuss Your Project
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" aria-hidden={!open}>
        <div className="mobile-menu__grid" aria-hidden="true" />
        <nav aria-label="Mobile" className="container mobile-menu__inner">
          <ol>
            {NAV_ITEMS.map((item, i) => (
              <li key={item.id} style={{ '--i': i } as React.CSSProperties}>
                <a
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  className={active === item.id ? 'is-active' : undefined}
                >
                  <span className="mobile-menu__num">0{i + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
          <div className="mobile-menu__foot" style={{ '--i': NAV_ITEMS.length } as React.CSSProperties}>
            <a href="#contact" className="btn btn--lime btn--block" onClick={go('contact')}>
              Let&rsquo;s Discuss Your Project
            </a>
            <div className="mobile-menu__contact">
              <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
              <a href={`mailto:${CONTACT.email}`}><EmailText /></a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
