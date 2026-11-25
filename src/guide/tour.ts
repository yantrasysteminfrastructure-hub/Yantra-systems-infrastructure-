import { CONTACT } from '../data/content';

export interface TourStep {
  /** Section to scroll to (element id). */
  section?: string;
  /** Element to highlight with the ring. */
  target?: string;
  title: string;
  text: string;
}

/** The guided walk through the home page, top to bottom. */
export const TOUR: TourStep[] = [
  {
    section: 'services',
    target: '.svc-grid',
    title: 'Our services',
    text: 'Yantra offers five services: Embedded Systems & Engineering Projects, Project Documentation, School Projects, Website Development and Mobile App Development. Tap any card for its full page.',
  },
  {
    section: 'turnaround',
    target: '.turn__grid',
    title: 'Delivery estimates',
    text: 'Every service shows its estimated delivery: documentation in 1 day, embedded and school projects in 3 days, websites in 10 and mobile apps in 15. Final timelines depend on your scope.',
  },
  {
    section: 'process',
    target: '#process .steps__head',
    title: 'How we work',
    text: 'Every project follows five steps: Understand, Plan, Develop, Test and Deliver, so nothing gets lost between your first message and the final hand-over.',
  },
  {
    section: 'ways',
    target: '.ways__grid',
    title: 'Ways to start',
    text: `Request a quote with the form, chat on WhatsApp, or call ${CONTACT.phoneDisplay}. Whatever is easiest for you.`,
  },
  {
    section: 'start',
    target: '#start',
    title: 'Projects & ideas',
    text: 'Students: the Projects page has a planner for B.Tech, Degree, MBA and School projects, plus a library of project ideas. Ask me for ideas for your branch any time.',
  },
  {
    title: 'That’s the tour!',
    text: 'From now on I’m your assistant. Ask me about a service, delivery times, project ideas for your branch, or how to contact the team.',
  },
];
