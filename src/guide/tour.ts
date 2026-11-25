import { CONTACT } from '../data/content';

export interface TourStep {
  /** Section to scroll to (element id). */
  section?: string;
  /** Element to highlight with the ring. */
  target?: string;
  title: string;
  text: string;
}

/** The guided walk through the website, top to bottom. */
export const TOUR: TourStep[] = [
  {
    section: 'about',
    target: '#about .about__copy',
    title: 'About Yantra',
    text: 'Who we are: Yantra Systems & Infrastructure works across engineering, technology, academic projects, software and infrastructure — turning ideas into working implementations.',
  },
  {
    section: 'services',
    target: '.svc-grid',
    title: 'Services',
    text: 'Our six services: Embedded Systems, B.Tech Projects, Degree Projects, Project Documentation, Web & Mobile Apps, and Civil Works. Each card has an “Enquire” button that fills the contact form for you.',
  },
  {
    section: 'domains',
    target: '.planner',
    title: 'Project planner',
    text: 'Plan your project in three taps: pick your programme (B.Tech, Degree, MBA or School), your branch, and the help you need — complete project, documentation, PPT and more. It shows exactly what’s included.',
  },
  {
    section: 'ideas',
    target: '.ideas__head',
    title: 'Project ideas',
    text: 'Stuck on a topic? Browse ideas for your branch or search them all. Each idea explains what it is, how it works, and why it’s useful today and in the future. The Smart Parking System is one we’ve built.',
  },
  {
    section: 'process',
    target: '.timeline',
    title: 'How we work',
    text: 'Every project follows five steps: Understand, Plan, Develop, Test and Deliver — so nothing gets lost between your first message and the final hand-over.',
  },
  {
    section: 'why',
    target: '.principles',
    title: 'Why Yantra',
    text: 'What we focus on: a practical approach, a structured process, quality, clear communication and the documentation your work actually needs.',
  },
  {
    section: 'contact',
    target: '.enquiry',
    title: 'Contact',
    text: `Ready to start? Fill this enquiry form, or reach us directly on ${CONTACT.phoneDisplay} (call or WhatsApp) or by email. The team will get back to you to discuss your project.`,
  },
  {
    title: 'That’s the whole website!',
    text: 'From now on I’m your assistant. Ask me for project ideas for your branch, what documentation or a PPT includes, or how to contact the team.',
  },
];
