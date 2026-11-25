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

export const SERVICE_OPTIONS = [
  ...SERVICES.map((s) => s.formValue),
  'MBA Project / Documentation',
  'School Project',
  'Other / Not sure yet',
];

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
    formService: 'B.Tech Project',
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
    formService: 'Degree Project',
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
    formService: 'MBA Project / Documentation',
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
    formService: 'School Project',
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
export function programmeForService(service: string): Programme | undefined {
  return PROGRAMMES.find((p) => p.formService === service);
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
