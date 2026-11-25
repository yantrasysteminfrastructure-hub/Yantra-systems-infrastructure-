// All site copy lives here. Content follows the client brief exactly:
// no invented projects, clients, statistics, testimonials, certifications or addresses.

export const CONTACT = {
  phoneDisplay: '8977843546',
  phoneHref: 'tel:+918977843546',
  whatsappNumber: '918977843546',
  email: 'yantrasysteminfrastructure@gmail.com',
  website: 'https://yantra-lyart.vercel.app/',
} as const;

export const COMPANY = {
  name: 'Yantra Systems & Infrastructure',
  short: 'Yantra',
  tagline: 'Turning Ideas Into Innovation.',
} as const;

/** Primary navigation (paths handled by the client-side router). */
export const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About Us' },
  { path: '/services', label: 'Services' },
  { path: '/projects', label: 'Projects' },
  { path: '/contact', label: 'Contact' },
] as const;

/** Kinds of static illustration used where WebGL is unavailable. */
export type ServiceVisual = 'embedded' | 'btech' | 'degree' | 'docs' | 'webapp' | 'civil';

export type ServiceIcon = 'chip' | 'doc' | 'flask' | 'browser' | 'phone';

export interface ServiceExample {
  title: string;
  text: string;
}

export interface Service {
  id: string;
  /** URL segment: /services/<slug> */
  slug: string;
  num: string;
  title: string;
  /** Short name for tight spaces (hero, menus). */
  short: string;
  /** One-line pitch. */
  description: string;
  /** Longer overview for the service page. */
  overview: string[];
  /** What we offer (from the client brief). */
  points: string[];
  /** Technologies and solutions used. */
  tech: string[];
  /** Example project types. These are examples of what can be built, not completed client work. */
  examples: ServiceExample[];
  /** Estimated turnaround in days. */
  deliveryDays: number;
  icon: ServiceIcon;
  /** Accent hue for this service's light beams. */
  hue: string;
  hue2: string;
  /** 3D scene shown on the service page (from the existing domain scenes). */
  scene: DomainScene;
  /** Pre-selects this value in the enquiry form. */
  formValue: string;
}

export const SERVICES: Service[] = [
  {
    id: 'embedded',
    slug: 'embedded-systems-engineering-projects',
    num: '01',
    title: 'Embedded Systems & Engineering Projects',
    short: 'Embedded & Engineering',
    description:
      'ESP32, Arduino and IoT builds, sensor-based automation and complete B.Tech final-year engineering projects, from circuit to working prototype.',
    overview: [
      'We design and build embedded hardware and the firmware that runs on it: microcontroller boards, sensors, actuators and the connectivity that ties them together.',
      'For engineering students, we develop B.Tech final-year projects as working prototypes, with the circuit design, implementation and explanation needed to present them with confidence.',
    ],
    points: [
      'ESP32 projects',
      'Arduino projects',
      'IoT projects',
      'Microcontroller-based projects',
      'Sensor-based automation',
      'Embedded hardware and software development',
      'B.Tech final-year engineering projects',
      'Electronic circuit design and implementation',
    ],
    tech: ['ESP32', 'Arduino', 'ESP8266 / NodeMCU', 'Embedded C / C++', 'Wi-Fi & Bluetooth', 'Sensors & actuators', 'Relays & motor drivers', 'IoT dashboards', 'Circuit design'],
    examples: [
      { title: 'IoT home automation', text: 'Control lights and appliances from a phone over Wi-Fi with an ESP32 and relay module.' },
      { title: 'Environment monitoring', text: 'Temperature, humidity and air-quality readings pushed to a live online dashboard.' },
      { title: 'Gas leakage alert', text: 'Gas sensor that triggers a buzzer, cuts power with a relay and sends a phone alert.' },
      { title: 'RFID attendance', text: 'RFID cards log entries with time stamps to a sheet or database.' },
    ],
    deliveryDays: 3,
    icon: 'chip',
    hue: '#fc4728',
    hue2: '#ffb36b',
    scene: 'embedded',
    formValue: 'Embedded Systems & Engineering Projects',
  },
  {
    id: 'docs',
    slug: 'project-documentation',
    num: '02',
    title: 'Project Documentation',
    short: 'Documentation',
    description:
      'Engineering project reports, technical and architecture documentation, presentations and the diagrams that support them.',
    overview: [
      'Good work deserves documentation that explains it clearly. We prepare structured reports and technical documents that follow your institution or organisation format.',
      'From system architecture write-ups to review presentations, every document comes with the block diagrams, flow charts and technical drawings it needs.',
    ],
    points: [
      'Engineering project reports',
      'Project documentation',
      'Technical documentation',
      'System architecture documentation',
      'Project presentations',
      'Technical diagrams and supporting documents',
    ],
    tech: ['Microsoft Word', 'PowerPoint', 'Block & circuit diagrams', 'UML / ER / DFD', 'Flow charts', 'Architecture diagrams', 'College / university formats'],
    examples: [
      { title: 'Final-year project report', text: 'Abstract, literature survey, methodology, results and conclusion in your college format.' },
      { title: 'System architecture document', text: 'Components, data flow and interfaces of a software or IoT system, with diagrams.' },
      { title: 'Review / viva presentation', text: 'A clear slide deck that walks reviewers through the problem, design and results.' },
      { title: 'Diagram set', text: 'Block, circuit, UML, ER and flow diagrams prepared for an existing project.' },
    ],
    deliveryDays: 1,
    icon: 'doc',
    hue: '#f5c84c',
    hue2: '#fff1b8',
    scene: 'business',
    formValue: 'Project Documentation',
  },
  {
    id: 'school',
    slug: 'school-projects',
    num: '03',
    title: 'School Projects',
    short: 'School Projects',
    description:
      'Science exhibition projects, working models, robotics and electronics-based STEM projects that students can understand and demonstrate.',
    overview: [
      'We build school projects that actually work and that students can explain: science exhibition models, electronics projects and simple robotics.',
      'Each model comes with an explanation of the science behind it, so the student can present it confidently at the exhibition or in class.',
    ],
    points: [
      'Science exhibition projects',
      'Working models',
      'Electronics-based school projects',
      'Robotics models',
      'Innovative STEM projects',
      'Educational demonstrations',
    ],
    tech: ['Arduino basics', 'Sensors (IR, ultrasonic, LDR)', 'LEDs, buzzers & displays', 'DC & servo motors', 'Solar panels', 'Simple circuits'],
    examples: [
      { title: 'Smart parking model', text: 'Sensors detect free slots and switch each slot light. Yantra has built this one as a working model.' },
      { title: 'Automatic street light', text: 'An LDR switches lights on at dusk and off at dawn.' },
      { title: 'Obstacle-avoiding robot', text: 'A small robot car that senses walls with an ultrasonic sensor and turns away.' },
      { title: 'Solar tracker', text: 'A panel that follows the brightest light using two light sensors and a servo.' },
    ],
    deliveryDays: 3,
    icon: 'flask',
    hue: '#2fe3a4',
    hue2: '#b8ffe4',
    scene: 'parking',
    formValue: 'School Projects',
  },
  {
    id: 'web',
    slug: 'website-development',
    num: '04',
    title: 'Website Designing & Development',
    short: 'Websites',
    description:
      'Business, portfolio and e-commerce websites, landing pages, redesigns, admin dashboards and database-integrated web applications.',
    overview: [
      'We design and develop fast, responsive websites that look right on every screen, from a single landing page to a full e-commerce store with an admin dashboard.',
      'Sites are built with modern web technology, connected to a database where needed, and handed over ready to publish.',
    ],
    points: [
      'Business websites',
      'Portfolio websites',
      'E-commerce websites',
      'Responsive website development',
      'Landing pages',
      'Website redesign',
      'Admin dashboards',
      'Database-integrated websites',
    ],
    tech: ['HTML, CSS & JavaScript', 'React', 'Node.js', 'MySQL / MongoDB / Firebase', 'REST APIs', 'Responsive design', 'SEO basics', 'Hosting & deployment'],
    examples: [
      { title: 'Business website', text: 'Company pages, services, enquiry form and WhatsApp link, optimised for mobile.' },
      { title: 'E-commerce store', text: 'Product catalogue, cart, orders and an admin panel to manage them.' },
      { title: 'Admin dashboard', text: 'Login-protected panel to manage records, users and reports from a database.' },
      { title: 'Landing page', text: 'A focused single page for a product, event or campaign with a lead form.' },
    ],
    deliveryDays: 10,
    icon: 'browser',
    hue: '#b15cff',
    hue2: '#ffb8f0',
    scene: 'software',
    formValue: 'Website Designing & Development',
  },
  {
    id: 'mobile',
    slug: 'mobile-app-development',
    num: '05',
    title: 'Mobile Application Development',
    short: 'Mobile Apps',
    description:
      'Android, business and e-commerce apps, customer and service-provider apps, with admin panels and API integration.',
    overview: [
      'We develop mobile applications for businesses and ideas of every size: customer apps, service-provider apps, stores and internal business tools.',
      'Apps can be connected to an admin panel and to your APIs or database, so you can manage content, orders and users in one place.',
    ],
    points: [
      'Android applications',
      'Business applications',
      'E-commerce mobile applications',
      'Customer and service-provider applications',
      'Admin-integrated mobile applications',
      'API-integrated applications',
      'Custom mobile application development',
    ],
    tech: ['Android', 'Cross-platform frameworks', 'REST API integration', 'Firebase', 'Push notifications', 'Admin panel integration', 'Play Store release support'],
    examples: [
      { title: 'Service booking app', text: 'Customers book a service; providers accept and update the job from their own app.' },
      { title: 'E-commerce app', text: 'Browse products, place orders and track them, managed from an admin panel.' },
      { title: 'Business utility app', text: 'Internal app for attendance, inventory or field reports connected to an API.' },
      { title: 'IoT companion app', text: 'Phone app that monitors and controls an ESP32-based device.' },
    ],
    deliveryDays: 15,
    icon: 'phone',
    hue: '#35c8ff',
    hue2: '#b8f0ff',
    scene: 'software',
    formValue: 'Mobile Application Development',
  },
];

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
export const servicePath = (s: Service) => `/services/${s.slug}`;
export const deliveryLabel = (days: number) => `${days} ${days === 1 ? 'Day' : 'Days'}`;

/** Shown wherever delivery times appear. */
export const DELIVERY_NOTE =
  'Estimated turnaround times. Actual delivery depends on project scope, requirements, approvals and availability of materials.';

export const OTHER_SERVICE = 'Other / Not sure yet';
export const SERVICE_OPTIONS = [...SERVICES.map((s) => s.formValue), OTHER_SERVICE];

export type DomainScene = 'software' | 'embedded' | 'electrical' | 'mechanical' | 'civil' | 'business' | 'parking';
export type ProgrammeId = 'btech' | 'degree' | 'mba' | 'school';

export interface Branch {
  id: string;
  short: string;
  title: string;
  scene: DomainScene;
  summary: string;
  /** Typical technical areas for projects in this branch. */
  areas: string[];
  /** What the main deliverable looks like for this branch. */
  build: string;
  /** Kind of diagrams / analysis that go into the report for this branch. */
  diagrams: string;
}

export interface Programme {
  id: ProgrammeId;
  label: string;
  /** Matching value in the enquiry form's "Service required" list. */
  formService: string;
  /** Project types offered for this programme (ids from PROJECT_TYPES). */
  types: string[];
  branches: Branch[];
}

const ENGINEERING_TYPES = ['complete', 'mini', 'implementation', 'documentation', 'ppt'];

export const PROGRAMMES: Programme[] = [
  {
    id: 'btech',
    label: 'B.Tech',
    formService: 'Embedded Systems & Engineering Projects',
    types: ENGINEERING_TYPES,
    branches: [
      {
        id: 'cse',
        short: 'CSE',
        title: 'Computer Science & Engineering',
        scene: 'software',
        summary: 'Software-focused projects: web, mobile, Python, AI / ML and database applications.',
        areas: ['Web development', 'Application development', 'Python', 'AI / ML', 'Database systems', 'IoT & software applications'],
        build: 'Working application with source code',
        diagrams: 'UML, ER and flow diagrams',
      },
      {
        id: 'ece',
        short: 'ECE',
        title: 'Electronics & Communication',
        scene: 'embedded',
        summary: 'Microcontroller, sensor and IoT-based electronics projects.',
        areas: ['Microcontroller-based systems', 'ESP32 / Arduino', 'Sensor integration', 'IoT applications', 'Circuit-level implementation'],
        build: 'Working circuit or embedded prototype',
        diagrams: 'Block and circuit diagrams',
      },
      {
        id: 'eee',
        short: 'EEE',
        title: 'Electrical & Electronics',
        scene: 'electrical',
        summary: 'Electrical and electronics projects with control, switching and monitoring.',
        areas: ['Motor & load control', 'Relay-based switching', 'Sensor & monitoring systems', 'Microcontroller control', 'Hardware–software interfacing'],
        build: 'Working electrical / electronics prototype',
        diagrams: 'Circuit and block diagrams',
      },
      {
        id: 'mech',
        short: 'MECH',
        title: 'Mechanical Engineering',
        scene: 'mechanical',
        summary: 'Mechanism, design-oriented and model-based mechanical projects.',
        areas: ['Mechanisms & power transmission', 'Design-oriented project work', 'Project models', 'Embedded control where applicable'],
        build: 'Design and project model',
        diagrams: 'Technical drawings and mechanism diagrams',
      },
      {
        id: 'civil',
        short: 'CIVIL',
        title: 'Civil Engineering',
        scene: 'civil',
        summary: 'Planning, drawing and structure-oriented civil engineering projects.',
        areas: ['Building planning', 'Drawings & layouts', 'Structure-oriented project work', 'Infrastructure-related studies'],
        build: 'Plans, drawings and project model',
        diagrams: 'Plans, elevations and layout drawings',
      },
    ],
  },
  {
    id: 'degree',
    label: 'Degree',
    formService: 'Embedded Systems & Engineering Projects',
    types: ENGINEERING_TYPES,
    branches: [
      {
        id: 'bca',
        short: 'BCA',
        title: 'BCA',
        scene: 'software',
        summary: 'Application and web projects for Bachelor of Computer Applications students.',
        areas: ['Web applications', 'Mobile applications', 'Database systems', 'Python'],
        build: 'Working application with source code',
        diagrams: 'UML, ER and flow diagrams',
      },
      {
        id: 'bsc-cs',
        short: 'B.Sc CS',
        title: 'B.Sc Computer Science',
        scene: 'software',
        summary: 'Software projects for computer science degree students.',
        areas: ['Web development', 'Python', 'AI / ML', 'Database systems'],
        build: 'Working application with source code',
        diagrams: 'UML, ER and flow diagrams',
      },
      {
        id: 'bsc-ele',
        short: 'B.Sc ELE',
        title: 'B.Sc Electronics',
        scene: 'embedded',
        summary: 'Electronics and microcontroller projects for degree students.',
        areas: ['Microcontroller-based systems', 'Sensor integration', 'IoT applications'],
        build: 'Working circuit or embedded prototype',
        diagrams: 'Block and circuit diagrams',
      },
      {
        id: 'bcom',
        short: 'B.Com/BBA',
        title: 'B.Com / BBA',
        scene: 'business',
        summary: 'Study-based business projects with research, data analysis and a structured report.',
        areas: ['Market & consumer studies', 'Financial analysis', 'Business process studies', 'Survey & data analysis'],
        build: 'Research-based project report',
        diagrams: 'Charts, tables and data analysis',
      },
      {
        id: 'other-degree',
        short: 'OTHER',
        title: 'Other degree programmes',
        scene: 'software',
        summary: 'Technical projects for other degree disciplines, scoped together with you.',
        areas: ['Practical implementation', 'Learning-focused guidance', 'Project presentation'],
        build: 'Implementation suited to your subject',
        diagrams: 'Diagrams relevant to your subject',
      },
    ],
  },
  {
    id: 'mba',
    label: 'MBA',
    formService: 'Project Documentation',
    types: ['report', 'documentation', 'ppt'],
    branches: [
      {
        id: 'mba-fin',
        short: 'FIN',
        title: 'MBA Finance',
        scene: 'business',
        summary: 'Finance projects built on financial statements, market data and structured analysis.',
        areas: ['Financial statement analysis', 'Investment & portfolio studies', 'Banking & credit studies', 'Ratio analysis'],
        build: 'Research-based project report',
        diagrams: 'Financial tables, ratios and charts',
      },
      {
        id: 'mba-mkt',
        short: 'MKT',
        title: 'MBA Marketing',
        scene: 'business',
        summary: 'Marketing projects on consumers, brands and digital channels, backed by survey data.',
        areas: ['Consumer behaviour', 'Brand studies', 'Digital marketing', 'Survey design & analysis'],
        build: 'Research-based project report',
        diagrams: 'Survey analysis with charts and tables',
      },
      {
        id: 'mba-hr',
        short: 'HR',
        title: 'MBA Human Resources',
        scene: 'business',
        summary: 'HR projects on employees, workplace practices and organisational performance.',
        areas: ['Employee engagement', 'Training & development', 'Performance appraisal', 'Workplace well-being'],
        build: 'Research-based project report',
        diagrams: 'Questionnaire analysis with charts and tables',
      },
      {
        id: 'mba-ops',
        short: 'OPS',
        title: 'MBA Operations & Supply Chain',
        scene: 'business',
        summary: 'Operations projects on inventory, logistics, quality and process efficiency.',
        areas: ['Inventory management', 'Logistics & supply chain', 'Quality management', 'Process improvement'],
        build: 'Research-based project report',
        diagrams: 'Process flow charts and data analysis',
      },
      {
        id: 'mba-ba',
        short: 'BA',
        title: 'MBA Business Analytics',
        scene: 'business',
        summary: 'Analytics projects that turn business data into dashboards, forecasts and insights.',
        areas: ['Data cleaning & analysis', 'Dashboards', 'Forecasting', 'Excel / Python / Power BI'],
        build: 'Analysis report with dashboards',
        diagrams: 'Dashboards, charts and data tables',
      },
    ],
  },
  {
    id: 'school',
    label: 'School',
    formService: 'School Projects',
    types: ['model', 'complete', 'ppt'],
    branches: [
      {
        id: 'school-stem',
        short: 'SCHOOL',
        title: 'School Science & Electronics Projects',
        scene: 'parking',
        summary: 'Working models with sensors and simple electronics for school exhibitions and science fairs.',
        areas: ['Sensor-based models', 'Simple electronics', 'Arduino basics', 'Science exhibition models'],
        build: 'Working model',
        diagrams: 'Labelled diagrams and chart',
      },
    ],
  },
];

export interface ProjectType {
  id: string;
  label: string;
  hint: string;
  /** Deliverables; {build} and {diagrams} are filled in from the branch. */
  includes: string[];
}

export const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'complete',
    label: 'Complete project',
    hint: 'Build + documentation + PPT',
    includes: ['{build}', 'Project report with {diagrams}', 'Presentation slides (PPT)', 'Walkthrough of how the project works'],
  },
  {
    id: 'mini',
    label: 'Mini project',
    hint: 'Smaller scope, shorter report',
    includes: ['Smaller-scope {build}', 'Short report with {diagrams}', 'Explanation of the concepts used'],
  },
  {
    id: 'implementation',
    label: 'Implementation only',
    hint: 'Working project, no report',
    includes: ['{build}', 'Project files and setup details', 'Walkthrough of how the project works'],
  },
  {
    id: 'documentation',
    label: 'Documentation only',
    hint: 'Report, diagrams, formatting',
    includes: ['Project report', '{diagrams}', 'Formatting to your college guidelines'],
  },
  {
    id: 'ppt',
    label: 'Presentation (PPT) only',
    hint: 'Slides for your review / viva',
    includes: ['Presentation slides', 'Diagrams for the slides', 'Guidance on presenting the project'],
  },
  {
    id: 'report',
    label: 'Complete project report',
    hint: 'Research, analysis, report + PPT',
    includes: ['{build} in your university format', 'Research methodology and {diagrams}', 'Presentation slides (PPT)', 'Guidance for your review / viva'],
  },
  {
    id: 'model',
    label: 'Working model',
    hint: 'Built model for exhibition',
    includes: ['{build}', 'Explanation of how it works', '{diagrams} for display'],
  },
];

// lower-case the first letter, but leave acronyms such as "UML" alone
const lower = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

/** Fills a deliverable template with branch-specific wording. */
export function fillDeliverable(text: string, b: Branch) {
  if (text.startsWith('{build}')) return text.replace('{build}', b.build);
  if (text.startsWith('{diagrams}')) return text.replace('{diagrams}', b.diagrams);
  return text.replace('{build}', lower(b.build)).replace('{diagrams}', lower(b.diagrams));
}

export function typesFor(p: Programme): ProjectType[] {
  return p.types.map((id) => PROJECT_TYPES.find((t) => t.id === id)!);
}

/** The programme a form "Service required" value belongs to, if any. */
/** Student programmes that belong to a form "Service required" value (B.Tech and Degree share one). */
export function programmesForService(service: string): Programme[] {
  return PROGRAMMES.filter((p) => p.formService === service);
}

/** Branch names relevant to a service; every branch when the service has no student programme. */
export function branchesForService(service: string): string[] {
  const ps = programmesForService(service);
  return (ps.length ? ps : PROGRAMMES).flatMap((p) => p.branches.map((b) => b.title));
}

/** Project type labels offered for a service's student programmes (de-duplicated). */
export function projectTypesForService(service: string): string[] {
  return [...new Set(programmesForService(service).flatMap((p) => typesFor(p).map((t) => t.label)))];
}

/** Every branch name, for the enquiry form when no programme is chosen. */
export const ALL_BRANCHES = PROGRAMMES.flatMap((p) => p.branches.map((b) => b.title));

/** Payload for pre-filling the enquiry form from elsewhere on the page. */
export interface EnquiryPreset {
  service: string;
  branch?: string;
  projectType?: string;
  message?: string;
}

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
