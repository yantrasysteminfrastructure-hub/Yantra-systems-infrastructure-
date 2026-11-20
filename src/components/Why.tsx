import { PRINCIPLES } from '../data/content';

const ICONS = [
  // practical: wrench/caliper
  <path key="0" d="M6 26 20 12m0 0 3-7 4 4-7 3Zm-11 11 3 3M14 6h12v6" />,
  // structured: stacked blocks
  <path key="1" d="M5 8h22v6H5zM9 14v6h14v-6M13 20v6h6v-6" />,
  // quality: target
  <path key="2" d="M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm0 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 5v2" />,
  // communication: bubbles
  <path key="3" d="M5 7h16v11H11l-6 5V7Zm16 5h6v11l-4-3h-9v-2" />,
  // documentation: document
  <path key="4" d="M8 4h12l6 6v18H8V4Zm12 0v6h6M12 16h10M12 21h10" />,
  // engineering: chip
  <path key="5" d="M10 10h12v12H10zM14 4v6m4-6v6m-4 12v6m4-6v6M4 14h6m-6 4h6m12-4h6m-6 4h6" />,
];

export function Why() {
  return (
    <section id="why" className="section section--light why" aria-labelledby="why-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__num">05</span> Why Yantra
          </p>
          <div className="section-head__row">
            <h2 id="why-title" className="h2" data-reveal>
              Built around practical <span className="mark">engineering.</span>
            </h2>
          </div>
        </header>
        <ul className="principles">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="principle" data-reveal style={{ '--d': `${(i % 3) * 70}ms` } as React.CSSProperties}>
              <div className="principle__top">
                <svg viewBox="0 0 32 32" className="principle__icon" aria-hidden="true">
                  {ICONS[i]}
                </svg>
                <span className="principle__idx">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="principle__title">{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
