/*
 * The guide's chat brain. It runs entirely in the browser and only answers from the website's own
 * content (services, programmes, project types, project ideas, process, contact details).
 * It never invents prices, timelines, past projects or addresses — those go to the team.
 */
import {
  CONTACT,
  PRINCIPLES,
  PROCESS,
  PROGRAMMES,
  SERVICES,
  fillDeliverable,
  typesFor,
  type Branch,
  type EnquiryPreset,
  type Programme,
  type ProgrammeId,
  type Service,
} from '../data/content';
import type { Idea } from '../data/ideas';

export type Action =
  | { kind: 'scroll'; id: string; label: string }
  | { kind: 'link'; href: string; label: string; external?: boolean }
  | { kind: 'enquire'; preset: EnquiryPreset; label: string }
  | { kind: 'idea'; id: string; label: string }
  | { kind: 'planner'; programme: ProgrammeId; branch?: string; type?: string; label: string }
  | { kind: 'tour'; label: string };

export interface IdeaCard {
  id: string;
  title: string;
  level: string;
  tag: string;
  built: boolean;
}

export interface BotReply {
  text: string[];
  bullets?: string[];
  detail?: { title: string; badge?: string; rows: [string, string][] };
  ideas?: IdeaCard[];
  actions?: Action[];
  chips?: string[];
}

interface Located {
  idea: Idea;
  programme: Programme;
  branch: Branch;
}

interface Context {
  programme?: Programme;
  branch?: Branch;
  idea?: Located;
  service?: Service;
}

/* ------------------------------ data access ------------------------------ */

const BRANCHES = new Map<string, { programme: Programme; branch: Branch }>();
PROGRAMMES.forEach((p) => p.branches.forEach((b) => BRANCHES.set(b.id, { programme: p, branch: b })));

let ideasCache: Located[] | null = null;
async function ideas(): Promise<Located[]> {
  if (!ideasCache) {
    const { IDEAS } = await import('../data/ideas');
    ideasCache = IDEAS.flatMap((idea) => {
      const hit = BRANCHES.get(idea.branch);
      return hit ? [{ idea, ...hit }] : [];
    });
  }
  return ideasCache;
}

const tagOf = (p: Programme, b: Branch) => (p.branches.length > 1 ? `${p.label} · ${b.short}` : p.label);
const card = (l: Located): IdeaCard => ({ id: l.idea.id, title: l.idea.title, level: l.idea.level, tag: tagOf(l.programme, l.branch), built: !!l.idea.built });

/* ------------------------------ text helpers ------------------------------ */

function normalise(input: string) {
  return ` ${input
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\bb\.?\s?tech\b/g, 'btech')
    .replace(/\bb\.?\s?sc\b/g, 'bsc')
    .replace(/\bb\.?\s?com\b/g, 'bcom')
    .replace(/\bm\.?\s?b\.?\s?a\b/g, 'mba')
    .replace(/\bb\.?\s?c\.?\s?a\b/g, 'bca')
    .replace(/[^a-z0-9+#]+/g, ' ')
    .trim()} `;
}

const any = (t: string, re: RegExp) => re.test(t);

const STOP = new Set(
  (
    'a an the i im me my we our you your is are am be to of in on for at by with and or it its this that these those what which who how ' +
    'can could would should do does did please tell show give want need looking look some any about from get find me know more ' +
    'project projects idea ideas topic topics suggest suggestion suggestions recommend final year major mini good best simple easy ' +
    'student students college based using use system systems related on like something new latest list help branch engineering ' +
    'btech degree mba school bsc bca bcom bba cse ece eee mech mechanical civil electrical electronics communication computer science ' +
    'finance marketing hr operations analytics business explain whats tell details detail working work works something anything ' +
    'interested interest service services offer kind type types make making build building done want wanted include includes'
  ).split(' '),
);

const SHORT_OK = new Set(['ai', 'ml', 'iot', 'ar', 'vr', 'ev', 'gps', 'rfid', 'gsm', 'plc', 'pcb', 'ui', 'erp', 'crm']);

const SYNONYMS: Record<string, string[]> = {
  ai: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural'],
  ml: ['machine learning', 'ml', 'prediction', 'model'],
  iot: ['iot', 'internet of things', 'esp32', 'wifi', 'cloud'],
  robot: ['robot', 'robotic', 'arm', 'automation'],
  solar: ['solar', 'renewable', 'pv'],
  app: ['app', 'android', 'mobile', 'application'],
  website: ['web', 'website', 'portal'],
  sensor: ['sensor', 'ultrasonic', 'pir', 'ldr'],
  security: ['security', 'secure', 'cyber', 'attack', 'fraud'],
  health: ['health', 'medical', 'patient', 'hospital'],
  farm: ['farm', 'agriculture', 'crop', 'irrigation', 'soil'],
  car: ['car', 'vehicle', 'ev', 'traffic', 'parking'],
};

function keywords(t: string) {
  return t
    .trim()
    .split(' ')
    .filter((w) => w && !STOP.has(w) && (w.length >= 3 || SHORT_OK.has(w)))
    .map((w) => (w.length <= 4 || SHORT_OK.has(w) ? w : w.replace(/(ies)$/, 'y').replace(/([^s])s$/, '$1')));
}

/* ----------------------------- entity detection ---------------------------- */

const BRANCH_PATTERNS: [string, RegExp][] = [
  ['bsc-cs', /\bbsc\s*(cs|computer)/],
  ['bsc-ele', /\bbsc\s*(ele|electronics|physics)/],
  ['bca', /\bbca\b/],
  ['bcom', /\b(bcom|bba|commerce)\b/],
  ['mba-fin', /\bfinanc/],
  ['mba-mkt', /\bmarketing\b/],
  ['mba-hr', /\b(hr|human resource)/],
  ['mba-ops', /\b(operations|supply chain|logistics)\b/],
  ['mba-ba', /\bbusiness analytics\b/],
  ['school-stem', /\b(school|class [5-9]|class 1[0-2]|science fair|exhibition)\b/],
  ['cse', /\b(cse|computer science|cs)\b/],
  ['ece', /\b(ece|electronics (and|&)? ?communication)\b/],
  ['eee', /\b(eee|electrical)\b/],
  ['mech', /\b(mech|mechanical)\b/],
  ['civil', /\bcivil (engineering|branch|student|students|project|projects|idea|ideas|topic|topics)\b|\bbtech civil\b/],
];

function detectBranch(t: string) {
  for (const [id, re] of BRANCH_PATTERNS) if (re.test(t)) return BRANCHES.get(id);
  return undefined;
}

function detectProgramme(t: string): Programme | undefined {
  const id: ProgrammeId | undefined = /\bmba\b/.test(t)
    ? 'mba'
    : /\b(btech|engineering)\b/.test(t)
      ? 'btech'
      : /\b(degree|bsc|bca|bcom|bba)\b/.test(t)
        ? 'degree'
        : /\bschool\b/.test(t)
          ? 'school'
          : undefined;
  return id && PROGRAMMES.find((p) => p.id === id);
}

const SERVICE_PATTERNS: [string, RegExp][] = [
  ['embedded', /\b(embedded|iot|esp32|arduino|microcontroller|sensor|hardware|electronics)\b/],
  ['webapp', /\b(web|website|websites|web app|mobile app|android|ios|app development|application development|software)\b/],
  ['civil', /\b(civil work|civil works|construction|infrastructure|building|plan drawing|drawings?)\b/],
  ['docs', /\b(documentation|report writing)\b/],
  ['btech', /\bbtech project/],
  ['degree', /\bdegree project/],
];

function detectService(t: string) {
  for (const [id, re] of SERVICE_PATTERNS) if (re.test(t)) return SERVICES.find((s) => s.id === id);
  return undefined;
}

/* ------------------------------ reply helpers ------------------------------ */

const MAIN_CHIPS = ['Project ideas for my branch', 'What does documentation include?', 'Your services', 'Smart Parking project', 'Contact the team'];

function whatsappText(ctx: Context) {
  let s = 'Hi Yantra, I found you on your website.';
  if (ctx.idea) s += ` I'm interested in the project idea "${ctx.idea.idea.title}" (${tagOf(ctx.idea.programme, ctx.idea.branch)}).`;
  else if (ctx.branch && ctx.programme) s += ` I'm looking for help with a ${ctx.programme.label} ${ctx.branch.title} project.`;
  else if (ctx.service) s += ` I'd like to know more about ${ctx.service.title}.`;
  return s;
}

function presetFor(ctx: Context): EnquiryPreset {
  if (ctx.idea)
    return { service: ctx.idea.programme.formService, branch: ctx.idea.branch.title, message: `I'm interested in the project idea "${ctx.idea.idea.title}". ` };
  if (ctx.branch && ctx.programme) return { service: ctx.programme.formService, branch: ctx.branch.title };
  if (ctx.service) return { service: ctx.service.formValue };
  return { service: '' };
}

function contactActions(ctx: Context): Action[] {
  return [
    { kind: 'link', href: `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(whatsappText(ctx))}`, label: 'Chat on WhatsApp', external: true },
    { kind: 'link', href: CONTACT.phoneHref, label: `Call ${CONTACT.phoneDisplay}` },
    { kind: 'link', href: `mailto:${CONTACT.email}?subject=${encodeURIComponent('Project enquiry')}&body=${encodeURIComponent(whatsappText(ctx))}`, label: 'Send an email' },
    { kind: 'enquire', preset: presetFor(ctx), label: 'Fill the enquiry form' },
  ];
}

function ideaDetail(l: Located): BotReply {
  const i = l.idea;
  return {
    text: i.built && i.builtNote ? [i.builtNote] : [],
    detail: {
      title: i.title,
      badge: `${tagOf(l.programme, l.branch)} · ${i.level}${i.built ? ' · Built by Yantra' : ''}`,
      rows: [
        ['What it is', i.what],
        ['How it works', i.how],
        ['Key components', i.tech.join(', ')],
        ['Useful today', i.today],
        ['Future scope', i.future],
      ],
    },
    actions: [
      { kind: 'idea', id: i.id, label: 'Open on the page' },
      { kind: 'enquire', preset: { service: l.programme.formService, branch: l.branch.title, message: `I'm interested in the project idea "${i.title}". ` }, label: 'Enquire about this idea' },
    ],
    chips: [`More ${l.branch.short === l.programme.label.toUpperCase() ? l.programme.label : l.branch.short} ideas`, 'What does a complete project include?', 'Contact the team'],
  };
}

function score(l: Located, words: string[]) {
  const title = l.idea.title.toLowerCase();
  const tags = `${l.idea.tags.join(' ')} ${l.idea.tech.join(' ')}`.toLowerCase();
  const body = `${l.idea.what} ${l.idea.how}`.toLowerCase();
  let s = 0;
  let matched = 0;
  for (const w of words) {
    const variants = SYNONYMS[w] ?? [w];
    let best = 0;
    for (const v of variants) {
      // short terms (AI, EV, IoT) must match a whole word, longer ones may match a prefix
      const re = new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${v.length <= 3 ? '\\b' : ''}`);
      const k = v === w ? 1 : 0.8; // the visitor's own word outranks a synonym
      if (re.test(title)) best = Math.max(best, 3 * k);
      else if (re.test(tags)) best = Math.max(best, 2 * k);
      else if (re.test(body)) best = Math.max(best, 1 * k);
    }
    if (best) matched++;
    s += best;
  }
  return { s, matched };
}

/* --------------------------------- engine --------------------------------- */

export function createBot() {
  const ctx: Context = {};

  const ideasReply = async (t: string, words: string[], branchHit?: { programme: Programme; branch: Branch }, prog?: Programme): Promise<BotReply | null> => {
    const all = await ideas();
    let pool = all;
    if (branchHit) pool = all.filter((l) => l.branch.id === branchHit.branch.id);
    else if (prog) pool = all.filter((l) => l.programme.id === prog.id);

    if (!words.length) {
      if (!branchHit && !prog) return null;
      const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
      const list = [...pool].sort((a, b) => Number(!!b.idea.built) - Number(!!a.idea.built) || order[a.idea.level] - order[b.idea.level]).slice(0, 6);
      const where = !branchHit
        ? prog!.label
        : branchHit.branch.title.startsWith(branchHit.programme.label)
          ? branchHit.branch.title
          : `${branchHit.programme.label} ${branchHit.branch.title}`;
      return {
        text: [`Here are project ideas for ${where}. Tap one to see what it is, how it works and why it’s useful.`],
        ideas: list.map(card),
        actions: branchHit
          ? [{ kind: 'planner', programme: branchHit.programme.id, branch: branchHit.branch.id, label: `Open ${branchHit.branch.short} in the planner` }]
          : [{ kind: 'scroll', id: 'ideas', label: 'Browse all ideas' }],
        chips: ['Ideas with sensors', 'AI based ideas', 'What does documentation include?', 'Contact the team'],
      };
    }

    const rank = (set: Located[]) =>
      set
        .map((l) => ({ l, ...score(l, words) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.matched - a.matched || b.s - a.s || Number(!!b.l.idea.built) - Number(!!a.l.idea.built));
    let ranked = rank(pool);
    let widened = false;
    if (!ranked.length && pool !== all) {
      ranked = rank(all);
      widened = ranked.length > 0;
    }
    if (!ranked.length) return null;

    // one clear match by title → explain it in full
    const top = ranked[0];
    const titleHit = words.every((w) => (SYNONYMS[w] ?? [w]).some((v) => top.l.idea.title.toLowerCase().includes(v)));
    const asksAbout = any(t, /\b(what is|whats|explain|tell me about|how does|details|about the)\b/);
    if ((titleHit && (ranked.length === 1 || ranked[1].matched < top.matched || asksAbout)) || (ranked.length === 1 && top.matched === words.length)) {
      ctx.idea = top.l;
      ctx.programme = top.l.programme;
      ctx.branch = top.l.branch;
      return ideaDetail(top.l);
    }
    const label = words.join(' ');
    return {
      text: [
        widened
          ? `I couldn’t find “${label}” ideas for ${branchHit?.branch.short ?? prog?.label}, but these from other branches match:`
          : `Ideas matching “${label}”${branchHit ? ` for ${branchHit.branch.short}` : ''}:`,
      ],
      ideas: ranked.slice(0, 5).map((r) => card(r.l)),
      chips: ['Show beginner ideas', 'Contact the team'],
    };
  };

  async function reply(input: string): Promise<BotReply> {
    const t = normalise(input);
    const words = keywords(t);
    const branchHit = detectBranch(t);
    const prog = branchHit?.programme ?? detectProgramme(t);
    if (branchHit) {
      ctx.branch = branchHit.branch;
      ctx.programme = branchHit.programme;
      ctx.idea = undefined;
    } else if (prog) ctx.programme = prog;

    if (!t.trim()) return help();
    const wantsIdeas = any(t, /\b(idea|ideas|topic|topics|suggest|recommend|final year|major project|mini project|projects? (on|for|in|about|using|with|related))\b/);

    // small talk
    if (any(t, /^ (hi+|hello|hey|hai|namaste|good (morning|afternoon|evening)|yo) ?(there|yantra|guide)? $/))
      return { text: ['Hello! 👋 I can help you find a project idea, explain what each service includes, or connect you with the team.'], chips: MAIN_CHIPS };
    if (any(t, /\b(thank|thanks|thx|thank you)\b/) && t.trim().split(' ').length < 6)
      return { text: ['You’re welcome! Anything else I can help with?'], chips: MAIN_CHIPS };
    if (any(t, /^ (bye|goodbye|see you|ok bye) /)) return { text: ['Bye! I’ll be here in the corner if you need me.'] };
    if (any(t, /\b(tour|walk ?through|show me around|guide me|explain (the )?(website|site|page))\b/))
      return { text: ['Sure — I’ll walk you through the website again, section by section.'], actions: [{ kind: 'tour', label: 'Start the tour' }] };
    if (any(t, /\b(who are you|your name|are you (a )?(bot|human|real))\b/))
      return {
        text: [
          'I’m the Yantra guide — a small assistant built into this website. I answer from what’s on the site: services, project ideas, project types and how to reach the team.',
          'For anything specific to your project, the team will help you directly.',
        ],
        chips: MAIN_CHIPS,
      };

    // things only the team can answer
    if (any(t, /\b(price|prices|pricing|cost|costs|fee|fees|charge|charges|rate|rates|budget|how much|cheap|discount|payment|pay|amount|rs|rupees|inr)\b/))
      return {
        text: [
          'Costs depend on the scope — the branch, the type of help (complete project, documentation only, PPT…) and the components involved — so the website doesn’t list fixed prices.',
          'Send your requirement and the team will discuss scope and cost with you directly.',
        ],
        actions: contactActions(ctx),
      };
    if (any(t, /\b(how long|how many days|days|weeks|deadline|urgent|duration|time ?line|timeline|delivery date|when can|asap)\b/))
      return {
        text: ['Timelines depend on the scope of your project. Share your deadline when you enquire and the team will tell you what’s possible.'],
        actions: contactActions(ctx),
      };
    if (any(t, /\b(where|location|address|office|located|city|visit|branch office|near me)\b/) && !branchHit && !wantsIdeas)
      return {
        text: ['The website doesn’t list an office address. You can reach the team by phone, WhatsApp or email and ask them about meeting in person.'],
        actions: contactActions(ctx),
      };

    // contact
    if (any(t, /\b(contact|call|phone|number|mobile number|whatsapp|whats app|email|e mail|mail|reach|talk|speak|connect|human|person|team|enquire|enquiry|inquiry)\b/))
      return {
        text: [`You can reach Yantra Systems & Infrastructure on ${CONTACT.phoneDisplay} (call or WhatsApp) or at ${CONTACT.email}. Or fill the enquiry form and the team will get back to you.`],
        actions: contactActions(ctx),
      };

    // the one completed project + portfolio questions
    if (any(t, /\bsmart park/)) {
      const l = (await ideas()).find((x) => x.idea.id === 'smart-parking');
      if (l) {
        ctx.idea = l;
        return ideaDetail(l);
      }
    }
    if (any(t, /\b(portfolio|previous|past|completed|done before|your work|work samples|examples? of your|clients?|experience|built)\b/))
      return {
        text: [
          'The project we show on this website as built by Yantra is the Smart Parking System — a school working model that uses sensors to detect free parking slots.',
          'The other ideas on the site are suggestions to help you pick a topic. For more about past work, ask the team directly.',
        ],
        actions: [{ kind: 'idea', id: 'smart-parking', label: 'See Smart Parking' }, ...contactActions(ctx).slice(0, 1)],
        chips: ['Smart Parking project', 'Project ideas for school', 'Contact the team'],
      };

    // process / why / about
    if (any(t, /\b(process|steps|procedure|workflow|how do you work|how does it work|how it works|approach)\b/) && (!words.length || t.trim().split(' ').length <= 4))
      return {
        text: ['Every project follows the same five steps:'],
        bullets: PROCESS.map((p) => `${p.num} ${p.title} — ${p.text}`),
        actions: [{ kind: 'scroll', id: 'process', label: 'See the process' }],
        chips: MAIN_CHIPS.slice(0, 3),
      };
    if (any(t, /\b(why (yantra|you|should|choose)|trust|reliable|quality|guarantee)\b/))
      return {
        text: ['What we focus on:'],
        bullets: PRINCIPLES.map((p) => `${p.title} — ${p.text}`),
        actions: [{ kind: 'scroll', id: 'why', label: 'Why Yantra' }],
      };
    if (any(t, /\b(about (yantra|you|the company|company)|what is yantra|who is yantra|what do you do|company)\b/))
      return {
        text: [
          'Yantra Systems & Infrastructure works across engineering, technology, academic project development, software solutions and infrastructure-related services — turning concepts into practical implementations.',
          'Tagline: “Turning Ideas Into Innovation.”',
        ],
        chips: MAIN_CHIPS,
      };

    // project types (documentation, PPT, complete project …)
    const typeMatch = /\b(documentation|document|report|ppt|presentation|slides|mini project|implementation|working model|model|complete project|full project|viva|thesis|black book)\b/.exec(t);
    if (typeMatch && !any(t, /\b(idea|ideas|topic|topics)\b/)) {
      const p = prog ?? ctx.programme ?? PROGRAMMES[0];
      const b = branchHit?.branch ?? (ctx.branch && p.branches.includes(ctx.branch) ? ctx.branch : p.branches[0]);
      const types = typesFor(p);
      const w = typeMatch[1];
      const type =
        types.find((x) =>
          /ppt|presentation|slides|viva/.test(w)
            ? x.id === 'ppt'
            : /mini/.test(w)
              ? x.id === 'mini'
              : /implementation/.test(w)
                ? x.id === 'implementation'
                : /model/.test(w)
                  ? x.id === 'model'
                  : /complete|full/.test(w)
                    ? x.id === 'complete' || x.id === 'report'
                    : /report|thesis|black book/.test(w)
                      ? x.id === 'report' || x.id === 'documentation'
                      : x.id === 'documentation',
        ) ?? types[0];
      ctx.programme = p;
      ctx.branch = b;
      return {
        text: [`For ${p.label}${p.branches.length > 1 ? ` · ${b.title}` : ''}, “${type.label}” includes:`],
        bullets: type.includes.map((s) => fillDeliverable(s, b)),
        actions: [
          { kind: 'planner', programme: p.id, branch: b.id, type: type.id, label: 'Open in the planner' },
          { kind: 'enquire', preset: { service: p.formService, branch: b.title, projectType: type.label }, label: `Enquire: ${type.label}` },
        ],
        chips: [`Other options for ${p.label}`, `Project ideas for ${p.branches.length > 1 ? b.short : p.label}`, 'Contact the team'],
      };
    }
    if (any(t, /\b(other options|types of project|what types|options for)\b/)) {
      const p = prog ?? ctx.programme ?? PROGRAMMES[0];
      return {
        text: [`For ${p.label}, you can choose:`],
        bullets: typesFor(p).map((x) => `${x.label} — ${x.hint}`),
        actions: [{ kind: 'planner', programme: p.id, label: `Open ${p.label} in the planner` }],
        chips: ['What does documentation include?', 'Contact the team'],
      };
    }
    if (any(t, /\b(beginner|easy|simple)\b/)) {
      const all = await ideas();
      const pool = all.filter((l) => l.idea.level === 'Beginner' && (!ctx.branch || l.branch.id === ctx.branch.id));
      const list = (pool.length ? pool : all.filter((l) => l.idea.level === 'Beginner')).slice(0, 6);
      return { text: [`Beginner-friendly ideas${pool.length && ctx.branch ? ` for ${ctx.branch.short}` : ''}:`], ideas: list.map(card), chips: MAIN_CHIPS.slice(2) };
    }
    if (any(t, /\bmore (\S+ )?ideas\b/) && ctx.branch && !branchHit) return (await ideasReply(t, [], { programme: ctx.programme!, branch: ctx.branch }))!;

    // services (unless the visitor is clearly asking for ideas)
    const svc = detectService(t);
    const asksServices = any(t, /\b(service|services|offer|offering|provide|what can you do|help with|do you do)\b/);
    if (!wantsIdeas && !branchHit) {
      if (svc) return serviceReply(svc);
      if (asksServices) return servicesReply();
    }

    // project ideas
    if (wantsIdeas && !branchHit && !prog && !words.length)
      return {
        text: ['Happy to suggest ideas! Which programme and branch are you in?'],
        chips: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EEE', 'B.Tech Mechanical', 'B.Tech Civil', 'BCA', 'B.Sc Computer Science', 'MBA Finance', 'MBA Marketing', 'School project'],
      };
    if (wantsIdeas || branchHit || words.length) {
      const r = await ideasReply(t, words, branchHit, prog);
      if (r) return r;
    }

    if (svc) return serviceReply(svc);
    if (asksServices) return servicesReply();

    if (words.length)
      return {
        text: [`I couldn’t find anything about “${words.join(' ')}” on the website. I only know what’s on this site — the team can answer anything else.`],
        actions: contactActions(ctx).slice(0, 2),
        chips: MAIN_CHIPS,
      };
    return help();
  }

  function serviceReply(svc: Service): BotReply {
    ctx.service = svc;
    return {
      text: [`${svc.title}: ${svc.description}`],
      bullets: svc.points,
      actions: [
        { kind: 'enquire', preset: { service: svc.formValue }, label: `Enquire about ${svc.title}` },
        { kind: 'scroll', id: 'services', label: 'See all services' },
      ],
      chips: MAIN_CHIPS.filter((c) => c !== 'Your services').slice(0, 4),
    };
  }

  function servicesReply(): BotReply {
    return {
      text: ['Yantra offers six services:'],
      bullets: SERVICES.map((s) => `${s.title} — ${s.description}`),
      actions: [{ kind: 'scroll', id: 'services', label: 'See services' }],
      chips: ['Embedded systems', 'Web & mobile apps', 'Civil works', 'What does documentation include?'],
    };
  }

  function help(): BotReply {
    return {
      text: ['I can help you with:'],
      bullets: ['Project ideas for your branch (B.Tech, Degree, MBA, School)', 'What a complete project, documentation or PPT includes', 'Our services and process', 'Contacting the team on WhatsApp, phone or email'],
      chips: MAIN_CHIPS,
    };
  }

  /** Full explanation of one idea (when a visitor taps an idea card in the chat). */
  async function describe(id: string): Promise<BotReply> {
    const l = (await ideas()).find((x) => x.idea.id === id);
    if (!l) return help();
    ctx.idea = l;
    ctx.programme = l.programme;
    ctx.branch = l.branch;
    return ideaDetail(l);
  }

  return { reply, describe, context: ctx };
}

export const WELCOME_CHIPS = MAIN_CHIPS;
