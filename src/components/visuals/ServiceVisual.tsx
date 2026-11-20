import type { ServiceVisual as V } from '../../data/content';

// Technical line illustrations for each service. Colours come from CSS variables
// (--v-line, --v-dim, --v-accent, --v-fill) so cards can restyle them on hover.

const common = {
  viewBox: '0 0 400 260',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: false,
} as const;

function Embedded() {
  const pins = Array.from({ length: 13 }, (_, i) => 84 + i * 16);
  return (
    <svg {...common}>
      <rect x="64" y="58" width="240" height="140" rx="8" className="v-fill v-line" />
      {pins.map((x) => (
        <g key={x}>
          <circle cx={x} cy="72" r="3.2" className="v-pad" />
          <circle cx={x} cy="184" r="3.2" className="v-pad" />
        </g>
      ))}
      <rect x="182" y="92" width="100" height="72" rx="3" className="v-line" />
      <rect x="190" y="100" width="66" height="56" rx="2" className="v-dim" />
      <text x="223" y="132" className="v-text" textAnchor="middle">ESP32</text>
      <path d="M262 104h12v8h-12v8h12v8h-12v8h12v8h-12" className="v-dim" />
      <rect x="52" y="112" width="26" height="32" rx="5" className="v-line" />
      <rect x="112" y="112" width="30" height="30" rx="2" className="v-line" />
      <circle cx="117" cy="117" r="1.6" className="v-accentfill" />
      <path d="M78 124h22l8 -6h4M78 132h24l6 4h4M142 122h18l8 -8h14M142 132h22l6 6h12" className="v-trace" />
      <rect x="150" y="164" width="10" height="6" rx="1" className="v-accentfill v-glow" />
      <path d="M100 184c0 30 -20 38 -44 42M116 184c0 34 -14 40 -40 46M132 184c0 38 -10 44 -38 50" className="v-wire" />
      <rect x="18" y="214" width="66" height="40" rx="4" className="v-line" />
      <rect x="28" y="221" width="46" height="26" rx="3" className="v-dim" />
      <path d="M34 227h34M34 232h34M34 237h34M34 242h34" className="v-dim" />
      <text x="322" y="66" className="v-label">IO · 3V3 · GND</text>
      <text x="322" y="80" className="v-label">UART · I2C</text>
      <path d="M318 92h44M318 104h30" className="v-dim" />
    </svg>
  );
}

function Btech() {
  const chips = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  return (
    <svg {...common}>
      <rect x="40" y="30" width="320" height="200" rx="8" className="v-fill v-line" />
      <path d="M40 62h320" className="v-dim" />
      <circle cx="58" cy="46" r="4" className="v-dim" />
      <circle cx="72" cy="46" r="4" className="v-dim" />
      <text x="92" y="50" className="v-label">B.TECH · PROJECT BRANCHES</text>
      {chips.map((c, i) => (
        <g key={c}>
          <rect x={58 + i * 58} y="80" width="50" height="24" rx="12" className={i === 0 ? 'v-accentline' : 'v-line'} />
          <text x={83 + i * 58} y="96" textAnchor="middle" className={i === 0 ? 'v-text v-accenttext' : 'v-text'}>
            {c}
          </text>
        </g>
      ))}
      {/* code */}
      <path d="M78 140l-14 14 14 14M110 140l14 14 -14 14M100 136l-12 36" className="v-accentline" />
      {/* circuit */}
      <path d="M150 154h18l6 -10 8 20 8 -20 8 20 6 -10h18" className="v-line" />
      <circle cx="150" cy="154" r="3" className="v-pad" />
      <circle cx="222" cy="154" r="3" className="v-pad" />
      {/* gear */}
      <g transform="translate(268 154)">
        <circle r="17" className="v-line" />
        <circle r="6" className="v-dim" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="-3" y="-24" width="6" height="7" className="v-line" transform={`rotate(${i * 45})`} />
        ))}
      </g>
      {/* beam */}
      <path d="M306 168l16 -28 16 28zM306 168h32" className="v-line" />
      <path d="M58 200h284" className="v-dim" />
      <text x="58" y="218" className="v-label">REQUIREMENT → IMPLEMENTATION → REVIEW</text>
    </svg>
  );
}

function Degree() {
  return (
    <svg {...common}>
      <rect x="54" y="34" width="292" height="168" rx="6" className="v-fill v-line" />
      <path d="M200 202v26M150 232h100" className="v-line" />
      <text x="76" y="64" className="v-label">PROJECT PRESENTATION</text>
      <path d="M76 74h120" className="v-dim" />
      {[
        ['IDEA', 86],
        ['BUILD', 176],
        ['PRESENT', 266],
      ].map(([t, x], i) => (
        <g key={t as string}>
          <rect x={x as number} y="98" width="62" height="40" rx="6" className={i === 1 ? 'v-accentline' : 'v-line'} />
          <text x={(x as number) + 31} y="122" textAnchor="middle" className={i === 1 ? 'v-text v-accenttext' : 'v-text'}>
            {t}
          </text>
        </g>
      ))}
      <path d="M150 118h22M240 118h22" className="v-line" />
      <path d="M166 113l6 5 -6 5M256 113l6 5 -6 5" className="v-line" />
      <path d="M86 162h80M86 174h110M86 186h64" className="v-dim" />
      <path d="M232 186l20 -14 20 6 22 -22 26 -8" className="v-accentline" />
      <circle cx="320" cy="148" r="3" className="v-accentfill" />
    </svg>
  );
}

function Docs() {
  return (
    <svg {...common}>
      <rect x="132" y="24" width="160" height="210" rx="4" className="v-fill v-dim" transform="rotate(6 212 129)" />
      <rect x="112" y="28" width="160" height="210" rx="4" className="v-fill v-line" />
      <text x="128" y="54" className="v-label">PROJECT REPORT</text>
      <path d="M128 62h70" className="v-accentline" />
      <path d="M128 78h128M128 88h120M128 98h96" className="v-dim" />
      {/* block diagram */}
      <rect x="128" y="112" width="36" height="22" rx="2" className="v-line" />
      <rect x="182" y="112" width="36" height="22" rx="2" className="v-accentline" />
      <rect x="236" y="112" width="22" height="22" rx="2" className="v-line" />
      <path d="M164 123h18M218 123h18" className="v-line" />
      <rect x="182" y="150" width="36" height="20" rx="2" className="v-line" />
      <path d="M200 134v16" className="v-line" />
      <path d="M128 186h128M128 196h112M128 206h120" className="v-dim" />
      <text x="248" y="228" className="v-label">— 12 —</text>
      <rect x="296" y="150" width="78" height="56" rx="4" className="v-line" />
      <path d="M306 192l14 -14 12 8 16 -18 16 10" className="v-accentline" />
      <rect x="26" y="70" width="70" height="50" rx="4" className="v-line" />
      <path d="M36 84h40M36 94h50M36 104h30" className="v-dim" />
    </svg>
  );
}

function WebApp() {
  return (
    <svg {...common}>
      <rect x="28" y="36" width="250" height="176" rx="8" className="v-fill v-line" />
      <path d="M28 60h250" className="v-dim" />
      <circle cx="44" cy="48" r="3.5" className="v-dim" />
      <circle cx="56" cy="48" r="3.5" className="v-dim" />
      <circle cx="68" cy="48" r="3.5" className="v-dim" />
      <rect x="86" y="42" width="150" height="12" rx="6" className="v-dim" />
      <rect x="44" y="74" width="118" height="12" rx="2" className="v-accentfill" />
      <path d="M44 98h150M44 108h120" className="v-dim" />
      <rect x="44" y="122" width="60" height="18" rx="9" className="v-accentline" />
      <rect x="44" y="152" width="66" height="46" rx="4" className="v-line" />
      <rect x="118" y="152" width="66" height="46" rx="4" className="v-line" />
      <rect x="192" y="152" width="70" height="46" rx="4" className="v-line" />
      <rect x="194" y="74" width="68" height="66" rx="4" className="v-dim" />
      <rect x="292" y="70" width="86" height="164" rx="14" className="v-fill v-line" />
      <rect x="320" y="78" width="30" height="6" rx="3" className="v-dim" />
      <rect x="302" y="96" width="66" height="10" rx="2" className="v-accentfill" />
      <path d="M302 116h58M302 124h44" className="v-dim" />
      <rect x="302" y="136" width="66" height="30" rx="4" className="v-line" />
      <rect x="302" y="172" width="66" height="30" rx="4" className="v-line" />
      <path d="M318 222h34" className="v-dim" />
      <text x="28" y="232" className="v-label">&lt;/&gt; RESPONSIVE · WEB · MOBILE</text>
    </svg>
  );
}

function Civil() {
  return (
    <svg {...common}>
      {/* elevation */}
      <path d="M30 214h200" className="v-line" />
      <rect x="54" y="74" width="140" height="140" className="v-fill v-line" />
      {[0, 1, 2, 3].map((f) => (
        <path key={f} d={`M54 ${109 + f * 35}h140`} className="v-dim" />
      ))}
      {[0, 1, 2, 3].map((f) =>
        [0, 1, 2].map((c) => <rect key={`${f}${c}`} x={66 + c * 44} y={82 + f * 35} width="30" height="20" className="v-dim" />),
      )}
      <rect x="110" y="186" width="28" height="28" className="v-accentline" />
      <path d="M54 62h140M54 56v12M194 56v12" className="v-line" />
      <text x="124" y="52" textAnchor="middle" className="v-label">ELEVATION</text>
      <path d="M38 74v140M32 74h12M32 214h12" className="v-dim" />
      {/* plan */}
      <rect x="252" y="74" width="120" height="96" className="v-fill v-line" />
      <path d="M252 122h56M308 74v96M308 140h64" className="v-line" />
      <path d="M308 122a18 18 0 0 1 18 -18" className="v-accentline" />
      {[
        [252, 74],
        [308, 74],
        [372, 74],
        [252, 170],
        [308, 170],
        [372, 170],
      ].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x - 4} y={y - 4} width="8" height="8" className="v-accentfill" />
      ))}
      <path d="M252 190h120M252 184v12M372 184v12" className="v-dim" />
      <text x="312" y="208" textAnchor="middle" className="v-label">PLAN · GRID A–C</text>
    </svg>
  );
}

export function ServiceVisual({ kind }: { kind: V }) {
  switch (kind) {
    case 'embedded':
      return <Embedded />;
    case 'btech':
      return <Btech />;
    case 'degree':
      return <Degree />;
    case 'docs':
      return <Docs />;
    case 'webapp':
      return <WebApp />;
    case 'civil':
      return <Civil />;
  }
}
