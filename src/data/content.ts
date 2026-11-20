// All site copy lives here. Content follows the client brief exactly:
// no invented projects, clients, statistics, testimonials, certifications or addresses.

export const CONTACT = {
  phoneDisplay: '8977843546',
  phoneHref: 'tel:+918977843546',
  whatsappNumber: '918977843546',
  email: 'yantrasysteminfrastructure@gmail.com',
  website: 'https://yantra-lyart.vercel.app/',
} as const;

export const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'domains', label: 'Domains' },
  { id: 'contact', label: 'Contact' },
] as const;

export type ServiceVisual = 'embedded' | 'btech' | 'degree' | 'docs' | 'webapp' | 'civil';

export interface Service {
  id: string;
  num: string;
  title: string;
  description: string;
  visual: ServiceVisual;
  points: string[];
  /** Pre-selects this value in the enquiry form. */
  formValue: string;
}

export const SERVICES: Service[] = [
  {
    id: 'embedded',
    num: '01',
    title: 'Embedded Systems',
    description:
      'Embedded electronics, microcontroller-based development, IoT applications, sensor integration, and hardware-software interfacing.',
    visual: 'embedded',
    points: ['ESP32 & Arduino development', 'Sensor integration', 'IoT applications', 'Hardware–software interfacing'],
    formValue: 'Embedded Systems / IoT',
  },
  {
    id: 'btech',
    num: '02',
    title: 'B.Tech Projects',
    description: 'Technical project development and guidance for engineering students across different branches.',
    visual: 'btech',
    points: ['CSE · ECE · EEE', 'Mechanical · Civil', 'Implementation & guidance', 'Presentation support'],
    formValue: 'B.Tech Project',
  },
  {
    id: 'degree',
    num: '03',
    title: 'Degree Projects',
    description:
      'Academic project development and technical guidance for degree students across relevant disciplines.',
    visual: 'degree',
    points: ['Practical implementation', 'Concept understanding', 'Project presentation', 'Technical guidance'],
    formValue: 'Degree Project',
  },
  {
    id: 'docs',
    num: '04',
    title: 'Project Documentation',
    description:
      'Structured technical documentation, project reports, diagrams, presentation materials, and project-related documentation support.',
    visual: 'docs',
    points: ['Project reports', 'Technical diagrams', 'Presentation material', 'Structured formatting'],
    formValue: 'Project Documentation',
  },
  {
    id: 'webapp',
    num: '05',
    title: 'Web & Mobile App Development',
    description: 'Design and development of modern websites, web applications, and mobile applications.',
    visual: 'webapp',
    points: ['Websites', 'Web applications', 'Mobile applications', 'Responsive UI design'],
    formValue: 'Web / Mobile App Development',
  },
  {
    id: 'civil',
    num: '06',
    title: 'Civil Works & Infrastructure',
    description: 'Civil works and infrastructure-related services.',
    visual: 'civil',
    points: ['Civil works', 'Infrastructure-related services', 'Planning discussion', 'Scope defined per requirement'],
    formValue: 'Civil Works / Infrastructure',
  },
];

export const SERVICE_OPTIONS = [...SERVICES.map((s) => s.formValue), 'Other / Not sure yet'];

export const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Degree programme',
  'Other',
];

export type DomainScene = 'embedded' | 'software' | 'mechanical' | 'civil';

export interface Domain {
  id: string;
  short: string;
  title: string;
  scene: DomainScene;
  summary: string;
  areas: string[];
  services: string[];
  /** Enquiry-form service pre-selected by this domain's CTA. */
  formService: string;
}

export const DOMAINS: Domain[] = [
  {
    id: 'cse',
    short: 'CSE',
    title: 'Computer Science & Engineering',
    scene: 'software',
    summary: 'Software-focused academic projects and application development.',
    areas: ['Web development', 'Application development', 'Python', 'AI / ML', 'Database systems', 'IoT & software applications'],
    services: ['B.Tech Projects', 'Web & Mobile App Development', 'Project Documentation'],
    formService: 'B.Tech Project',
  },
  {
    id: 'ece',
    short: 'ECE',
    title: 'Electronics & Communication',
    scene: 'embedded',
    summary: 'Electronics and microcontroller-based project work.',
    areas: ['Microcontroller-based systems', 'Sensor integration', 'IoT applications', 'Circuit-level implementation'],
    services: ['B.Tech Projects', 'Embedded Systems', 'Project Documentation'],
    formService: 'Embedded Systems / IoT',
  },
  {
    id: 'eee',
    short: 'EEE',
    title: 'Electrical & Electronics',
    scene: 'embedded',
    summary: 'Electrical and electronics project development and guidance.',
    areas: ['Electronics-based projects', 'Microcontroller control', 'Sensor & monitoring systems', 'Hardware–software interfacing'],
    services: ['B.Tech Projects', 'Embedded Systems', 'Project Documentation'],
    formService: 'Embedded Systems / IoT',
  },
  {
    id: 'mech',
    short: 'MECH',
    title: 'Mechanical Engineering',
    scene: 'mechanical',
    summary: 'Academic project development and guidance for mechanical engineering students.',
    areas: ['Mechanical project concepts', 'Design-oriented project work', 'Embedded control where applicable', 'Reports & diagrams'],
    services: ['B.Tech Projects', 'Project Documentation'],
    formService: 'B.Tech Project',
  },
  {
    id: 'civil',
    short: 'CIVIL',
    title: 'Civil Engineering',
    scene: 'civil',
    summary: 'Civil engineering academic projects alongside civil works and infrastructure-related services.',
    areas: ['Civil engineering academic projects', 'Drawings & planning documentation', 'Civil works', 'Infrastructure-related services'],
    services: ['B.Tech Projects', 'Civil Works & Infrastructure', 'Project Documentation'],
    formService: 'Civil Works / Infrastructure',
  },
  {
    id: 'iot',
    short: 'IoT',
    title: 'Embedded Systems & IoT',
    scene: 'embedded',
    summary: 'Microcontroller-based development connecting sensors, hardware and software.',
    areas: ['ESP32 development', 'Arduino development', 'Sensor integration', 'IoT applications', 'Hardware–software interfacing'],
    services: ['Embedded Systems', 'B.Tech Projects', 'Degree Projects'],
    formService: 'Embedded Systems / IoT',
  },
  {
    id: 'degree',
    short: 'DEGREE',
    title: 'Degree-level Academic Projects',
    scene: 'software',
    summary: 'Academic project development and technical guidance for degree students.',
    areas: ['Practical implementation', 'Learning-focused guidance', 'Project presentation', 'Documentation support'],
    services: ['Degree Projects', 'Project Documentation', 'Web & Mobile App Development'],
    formService: 'Degree Project',
  },
];

export const PROCESS = [
  { num: '01', title: 'Understand', text: 'Understand the requirement, idea, and technical objective.' },
  { num: '02', title: 'Plan', text: 'Identify the required components, technologies, and implementation approach.' },
  { num: '03', title: 'Develop', text: 'Work on the relevant engineering, software, or project development activities.' },
  { num: '04', title: 'Test', text: 'Validate the implementation and address identified issues.' },
  { num: '05', title: 'Deliver', text: 'Provide the agreed deliverables and relevant documentation.' },
];

export const PRINCIPLES = [
  { title: 'Practical technical approach', text: 'Work is centred on implementation that functions in practice, not just on paper.' },
  { title: 'Structured development process', text: 'Each engagement moves through defined stages from requirement to delivery.' },
  { title: 'Focus on quality', text: 'Implementations are tested and refined before they are handed over.' },
  { title: 'Clear communication', text: 'Requirements, scope and progress are discussed openly throughout.' },
  { title: 'Relevant documentation', text: 'Deliverables come with the documentation the work actually needs.' },
  { title: 'Engineering-oriented solutions', text: 'Problems are approached with engineering reasoning across hardware and software.' },
];
