import { useEffect, useRef, useState } from 'react';
import { CONTACT, NAV_ITEMS, SERVICES, deliveryLabel, servicePath } from '../data/content';
import { Link, useLocation } from '../lib/router';
import { EmailText } from './EmailText';
import { Icon } from './Icons';
import { Logo } from './Logo';

const isActive = (current: string, path: string) => (path === '/' ? current === '/' : current === path || current.startsWith(`${path}/`));

export function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const svcRef = useRef<HTMLLIElement>(null);

  // close menus whenever the page changes
  useEffect(() => {
    setOpen(false);
    setSvcOpen(false);
  }, [pathname]);

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

  // services dropdown: close on outside click / Escape
  useEffect(() => {
    if (!svcOpen) return;
    const onDown = (e: PointerEvent) => !svcRef.current?.contains(e.target as Node) && setSvcOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSvcOpen(false);
        svcRef.current?.querySelector<HTMLElement>('.site-nav__trigger')?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [svcOpen]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container site-header__bar">
        <Link to="/" className="site-header__brand" aria-label="Yantra Systems & Infrastructure — home">
          <Logo />
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) =>
              item.path === '/services' ? (
                <li
                  key={item.path}
                  ref={svcRef}
                  className={`site-nav__has-menu${svcOpen ? ' is-open' : ''}`}
                  onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setSvcOpen(true)}
                  onMouseLeave={() => window.matchMedia('(hover: hover)').matches && setSvcOpen(false)}
                >
                  <Link to="/services" className={isActive(pathname, item.path) ? 'is-active' : undefined} aria-current={pathname === item.path ? 'page' : undefined}>
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className="site-nav__trigger"
                    aria-expanded={svcOpen}
                    aria-controls="svc-menu"
                    aria-label="Show all services"
                    onClick={() => setSvcOpen((o) => !o)}
                  >
                    <svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg>
                  </button>
                  <div id="svc-menu" className="svc-menu" hidden={!svcOpen}>
                    <ul>
                      {SERVICES.map((s) => (
                        <li key={s.id}>
                          <Link to={servicePath(s)} className="svc-menu__item" style={{ '--hue': s.hue } as React.CSSProperties}>
                            <span className="svc-menu__icon"><Icon name={s.icon} /></span>
                            <span className="svc-menu__text">
                              <span className="svc-menu__title">{s.title}</span>
                              <span className="svc-menu__meta">Est. delivery · {deliveryLabel(s.deliveryDays)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link to="/services" className="svc-menu__all">
                      All services <Icon name="arrow" />
                    </Link>
                  </div>
                </li>
              ) : (
                <li key={item.path}>
                  <Link to={item.path} className={isActive(pathname, item.path) ? 'is-active' : undefined} aria-current={pathname === item.path ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <Link to="/quote" className="btn btn--light btn--sm site-header__cta">
          Request a Quote
        </Link>

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
        <nav aria-label="Mobile" className="container mobile-menu__inner">
          <ol>
            {NAV_ITEMS.map((item, i) => (
              <li key={item.path} style={{ '--i': i } as React.CSSProperties}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  to={item.path}
                  className={isActive(pathname, item.path) ? 'is-active' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="mobile-menu__num">0{i + 1}</span>
                  {item.label}
                </Link>
                {item.path === '/services' && (
                  <ul className="mobile-menu__sub">
                    {SERVICES.map((s) => (
                      <li key={s.id}>
                        <Link to={servicePath(s)} onClick={() => setOpen(false)}>
                          {s.title}
                          <span>{deliveryLabel(s.deliveryDays)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
          <div className="mobile-menu__foot" style={{ '--i': NAV_ITEMS.length } as React.CSSProperties}>
            <Link to="/quote" className="btn btn--light btn--block" onClick={() => setOpen(false)}>
              Request a Quote
            </Link>
            <div className="mobile-menu__contact">
              <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
              <a href={`mailto:${CONTACT.email}`}>
                <EmailText />
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
