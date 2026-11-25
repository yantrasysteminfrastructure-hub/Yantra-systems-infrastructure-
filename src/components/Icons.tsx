import type { ServiceIcon } from '../data/content';

/** Line icons on a 24px grid (stroke = currentColor). */
const PATHS = {
  chip: 'M8 8h8v8H8zM10 4v4m4-4v4m-4 8v4m4-4v4M4 10h4m-4 4h4m8-4h4m-4 4h4M11 11h2v2h-2z',
  doc: 'M7 3h7l4 4v14H7V3Zm7 0v4h4M9.5 11h6M9.5 14h6M9.5 17h4',
  flask: 'M9.5 3h5M10.5 3v6L5.6 18a2 2 0 0 0 1.8 3h9.2a2 2 0 0 0 1.8-3L13.5 9V3M7.8 15h8.4',
  browser: 'M3.5 5.5h17v13h-17zM3.5 9h17M6.5 7.25h.01M8.5 7.25h.01M10.5 7.25h.01M8 13l-2 1.75L8 16.5m8-3.5 2 1.75-2 1.75M13 12l-2 5.5',
  phone: 'M7.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V4a1.5 1.5 0 0 1 1.5-1.5ZM10.5 18.5h3M9.5 5.5h5',
  wifi: 'M4 9.5a11.5 11.5 0 0 1 16 0M7 12.75a7.2 7.2 0 0 1 10 0M10 15.75a3 3 0 0 1 4 0M12 19h.01',
  code: 'M8.5 7 3.5 12l5 5m7-10 5 5-5 5M13.5 4.5l-3 15',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-6v3m0 12v3m9-9h-3M6 12H3m15.4-6.4-2.1 2.1M7.7 16.3l-2.1 2.1m12.8 0-2.1-2.1M7.7 7.7 5.6 5.6',
  bolt: 'M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z',
  chart: 'M4 20h16M7 16v-5m5 5V7m5 9v-8',
  cloud: 'M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.75 3.75 0 0 1 17.25 18.5H7Z',
  cart: 'M3.5 4.5h2l2.2 10.5h9.8l2-7.5H6.6M9.5 19.5h.01M16.5 19.5h.01',
  pen: 'M4 20l4.5-1L19 8.5 15.5 5 5 15.5 4 20Zm9.5-13 3.5 3.5',
  robot: 'M7 8.5h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Zm5-4v4M9.5 13h.01m4.99 0h.01M9.5 16h5M3 12.5v3m18-3v3',
  sensor: 'M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 8.5a5 5 0 0 0 0 7m7-7a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8m12.8-12.8a9 9 0 0 1 0 12.8',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4',
  layers: 'M12 3.5 3 8l9 4.5L21 8l-9-4.5ZM3 12l9 4.5 9-4.5M3 16l9 4.5 9-4.5',
  bell: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15L6 16.5ZM10 20.5h4',
  arrow: 'M4 12h15m-5-5 5 5-5 5',
  arrowUpRight: 'M7 17 17 7m-8 0h8v8',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 7.5V12l3 2',
  mail: 'M3.5 5.5h17v13h-17zM3.5 6.5l8.5 6.5 8.5-6.5',
  call: 'M5 4h3.5l1.5 4.5-2 1.25a11 11 0 0 0 6.25 6.25L15.5 14l4.5 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z',
  chat: 'M4 19.5 5.3 15.6A8 8 0 1 1 8.4 18.6L4 19.5Z',
  upload: 'M12 16V4m-4.5 4.5L12 4l4.5 4.5M4.5 15v4.5h15V15',
  quote: 'M5 4.5h14v15H5zM8.5 9h7M8.5 12.5h7M8.5 16h4',
  spark: 'M12 3v4m0 10v4M3 12h4m10 0h4M6.3 6.3 8.8 8.8m6.4 6.4 2.5 2.5m0-11.4-2.5 2.5m-6.4 6.4-2.5 2.5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5a7.5 7.5 0 0 1 15 0',
  target: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 4.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 3.5v1',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`icon${className ? ` ${className}` : ''}`} aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Small icons that orbit each service's main tile. */
export const ORBIT_ICONS: Record<ServiceIcon, IconName[]> = {
  chip: ['wifi', 'sensor', 'bolt', 'code', 'cloud', 'gear'],
  doc: ['pen', 'chart', 'layers', 'quote', 'check', 'code'],
  flask: ['robot', 'sun', 'bolt', 'sensor', 'gear', 'spark'],
  browser: ['code', 'cart', 'layers', 'chart', 'cloud', 'user'],
  phone: ['bell', 'cart', 'cloud', 'user', 'chat', 'code'],
};

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`icon icon--fill${className ? ` ${className}` : ''}`} aria-hidden="true" focusable="false">
      <path d="M12.04 2.5a9.43 9.43 0 0 0-8.1 14.25L2.5 21.5l4.87-1.4A9.43 9.43 0 1 0 12.04 2.5Zm0 17.2a7.77 7.77 0 0 1-3.96-1.08l-.28-.17-2.9.83.85-2.82-.19-.29a7.77 7.77 0 1 1 6.48 3.53Zm4.26-5.82c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.91-.14.16-.27.18-.5.06a6.37 6.37 0 0 1-3.17-2.77c-.24-.41.24-.38.69-1.28.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.72-1.72-.19-.45-.38-.39-.52-.4h-.45a.86.86 0 0 0-.62.29 2.6 2.6 0 0 0-.81 1.94 4.52 4.52 0 0 0 .95 2.4 10.36 10.36 0 0 0 3.96 3.5c1.47.64 2.05.69 2.78.58.45-.07 1.38-.56 1.57-1.11.2-.55.2-1.02.14-1.11-.06-.1-.21-.16-.44-.27Z" />
    </svg>
  );
}
