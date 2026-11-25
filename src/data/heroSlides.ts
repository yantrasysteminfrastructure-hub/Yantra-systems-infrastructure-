/** Showcase cycled by the hero 3D scene. Shared by the hero controls (main bundle) and the lazy 3D chunk. */
export const HERO_SLIDES = [
  {
    id: 'embedded',
    label: 'Embedded',
    aria: '3D model of an ESP32-style microcontroller development board with a sensor module connected by jumper wires',
  },
  {
    id: 'mobile',
    label: 'Mobile App',
    aria: 'Two smartphones showing the Yantra website on mobile, scrolling through its sections',
  },
  {
    id: 'web',
    label: 'Web App',
    aria: 'Laptop opening to show the Yantra website in a browser, scrolling from the hero to services and contact',
  },
  {
    id: 'drawings',
    label: 'Civil Drawings',
    aria: 'Drafting board where a pencil draws a sample ground floor plan, beside a tablet showing a sample construction schedule chart',
  },
  {
    id: 'building',
    label: '3D Building',
    aria: '3D building frame rising floor by floor on a site plan while a tower crane lifts loads',
  },
] as const;

export type HeroSlideId = (typeof HERO_SLIDES)[number]['id'];

/** Time each slide stays on screen. */
export const HERO_SLIDE_MS = 5000;
