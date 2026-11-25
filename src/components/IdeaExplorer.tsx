import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PROGRAMMES, type Branch, type Programme } from '../data/content';
import type { Idea } from '../data/ideas';
import { requestEnquiry } from '../lib/enquiryBus';
import { OPEN_IDEA_EVENT } from '../lib/guideEvents';
import { scrollToId } from '../hooks';

interface Located {
  idea: Idea;
  programme: Programme;
  branch: Branch;
}

const BRANCH_INDEX = new Map<string, { programme: Programme; branch: Branch }>();
PROGRAMMES.forEach((p) => p.branches.forEach((b) => BRANCH_INDEX.set(b.id, { programme: p, branch: b })));

/** "MBA · FIN", or just "School" for single-branch programmes. */
const tagOf = (p: Programme, b: Branch) => (p.branches.length > 1 ? `${p.label} · ${b.short}` : p.label);

function locate(idea: Idea): Located | null {
  const hit = BRANCH_INDEX.get(idea.branch);
  return hit ? { idea, ...hit } : null;
}

function matches(l: Located, words: string[]) {
  const hay = [
    l.idea.title,
    l.idea.what,
    l.idea.how,
    l.idea.tech.join(' '),
    l.idea.tags.join(' '),
    l.branch.title,
    l.branch.short,
    l.programme.label,
    l.idea.built ? 'built by yantra completed' : '',
  ]
    .join(' ')
    .toLowerCase();
  return words.every((w) => hay.includes(w));
}

interface Props {
  programme: Programme;
  branch: Branch;
  projectTypeLabel: string;
  /** Moves the planner to the idea's programme / branch. */
  onPick(programmeId: Programme['id'], branchId: string): void;
}

export function IdeaExplorer({ programme, branch, projectTypeLabel, onPick }: Props) {
  const [ideas, setIdeas] = useState<Located[] | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const searchId = useId();

  // The idea library is a separate chunk, loaded after the page is interactive.
  useEffect(() => {
    let alive = true;
    import('../data/ideas').then(({ IDEAS }) => {
      if (alive) setIdeas(IDEAS.map(locate).filter((x): x is Located => !!x));
    });
    return () => {
      alive = false;
    };
  }, []);

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searching = words.length > 0;

  const list = useMemo(() => {
    if (!ideas) return [];
    const base = searching ? ideas.filter((l) => matches(l, words)) : ideas.filter((l) => l.branch.id === branch.id);
    // completed Yantra work first, then by level
    const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
    return [...base].sort((a, b) => Number(!!b.idea.built) - Number(!!a.idea.built) || order[a.idea.level] - order[b.idea.level]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, branch.id, query]);

  const selected = list.find((l) => l.idea.id === selectedId) ?? list[0] ?? null;

  // The guide can open a specific idea: switch the planner to its branch, then select it.
  const pending = useRef<string | null>(null);
  const latest = useRef({ branchId: branch.id, onPick });
  latest.current = { branchId: branch.id, onPick };
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      import('../data/ideas').then(({ IDEAS }) => {
        const idea = IDEAS.find((i) => i.id === id);
        const l = idea && locate(idea);
        if (!l) return;
        setQuery('');
        setSelectedId(id);
        if (l.branch.id !== latest.current.branchId) {
          pending.current = id;
          latest.current.onPick(l.programme.id, l.branch.id);
        }
        const narrow = window.matchMedia('(max-width: 1023px)').matches;
        setTimeout(() => (narrow ? detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) : scrollToId('ideas')), 80);
      });
    };
    window.addEventListener(OPEN_IDEA_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_IDEA_EVENT, onOpen);
  }, []);

  // When the branch changes (and not searching), start from its first idea.
  useEffect(() => {
    if (!searching) setSelectedId(pending.current);
    pending.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch.id]);

  const choose = (l: Located) => {
    setSelectedId(l.idea.id);
    if (l.branch.id !== branch.id) onPick(l.programme.id, l.branch.id);
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const enquire = (l: Located) =>
    requestEnquiry({
      service: l.programme.formService,
      branch: l.branch.title,
      projectType: l.programme.id === programme.id ? projectTypeLabel : undefined,
      message: `I'm interested in the project idea "${l.idea.title}". `,
    });

  return (
    <div id="ideas" className="ideas" data-reveal>
      <div className="ideas__head">
        <div>
          <h3 className="ideas__title">
            Project ideas{' '}
            <span className="ideas__for">
              {searching ? `matching “${query.trim()}”` : `for ${programme.branches.length > 1 && !branch.title.startsWith(programme.label) ? `${programme.label} · ${branch.title}` : branch.title}`}
            </span>
          </h3>
          <p className="ideas__note">
            Ideas to help you choose a topic. They are not completed Yantra projects, except those marked{' '}
            <span className="built-badge built-badge--inline">Built by Yantra</span>.
          </p>
        </div>
        <div className="ideas__search">
          <label htmlFor={searchId} className="sr-only">
            Search all project ideas
          </label>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" />
          </svg>
          <input
            id={searchId}
            type="search"
            placeholder="Search all ideas — IoT, finance, sensor, AI…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" className="ideas__clear" onClick={() => setQuery('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </div>

      <div className="ideas__body">
        <div className="ideas__list" role="list" aria-label="Project ideas" aria-busy={!ideas}>
          {!ideas &&
            Array.from({ length: 4 }, (_, i) => <div key={i} className="idea-card idea-card--skeleton" aria-hidden="true" />)}
          {ideas && list.length === 0 && (
            <p className="ideas__empty" role="status">
              No ideas match “{query.trim()}”. Try a broader word such as <em>sensor</em>, <em>web</em> or <em>finance</em> — or tell us
              your own idea in the enquiry form.
            </p>
          )}
          {list.map((l) => (
            <div role="listitem" key={l.idea.id}>
              <button
                type="button"
                className={`idea-card${selected?.idea.id === l.idea.id ? ' is-on' : ''}`}
                aria-pressed={selected?.idea.id === l.idea.id}
                onClick={() => choose(l)}
              >
                <span className="idea-card__meta">
                  {searching && (
                    <span className="idea-card__branch">
                      {tagOf(l.programme, l.branch)}
                    </span>
                  )}
                  <span className={`level level--${l.idea.level.toLowerCase()}`}>{l.idea.level}</span>
                  {l.idea.built && <span className="built-badge">Built by Yantra</span>}
                </span>
                <span className="idea-card__title">{l.idea.title}</span>
                <span className="idea-card__what">{l.idea.what}</span>
              </button>
            </div>
          ))}
        </div>

        <div ref={detailRef} className="idea-detail" aria-live="polite">
          {selected ? (
            <article key={selected.idea.id} className="idea-detail__inner">
              <div className="idea-detail__badges">
                <span className="planner__badge">
                  {tagOf(selected.programme, selected.branch)}
                </span>
                <span className={`level level--${selected.idea.level.toLowerCase()}`}>{selected.idea.level}</span>
                {selected.idea.built && <span className="built-badge">Built by Yantra</span>}
              </div>
              <h4 className="idea-detail__title">{selected.idea.title}</h4>
              {selected.idea.built && selected.idea.builtNote && <p className="idea-detail__built">{selected.idea.builtNote}</p>}

              <dl className="idea-detail__grid">
                <div>
                  <dt>What it is</dt>
                  <dd>{selected.idea.what}</dd>
                </div>
                <div>
                  <dt>How it works</dt>
                  <dd>{selected.idea.how}</dd>
                </div>
                <div className="idea-detail__wide">
                  <dt>Key components &amp; tools</dt>
                  <dd>
                    <ul className="chips chips--dark">
                      {selected.idea.tech.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="idea-detail__use">
                  <dt>
                    <span className="idea-detail__icon" aria-hidden="true">●</span> Useful today
                  </dt>
                  <dd>{selected.idea.today}</dd>
                </div>
                <div className="idea-detail__use">
                  <dt>
                    <span className="idea-detail__icon" aria-hidden="true">→</span> Future scope
                  </dt>
                  <dd>{selected.idea.future}</dd>
                </div>
              </dl>

              <div className="idea-detail__foot">
                <button type="button" className="btn btn--lime" onClick={() => enquire(selected)}>
                  Enquire about this idea
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>
                </button>
                <span className="fineprint fineprint--dark">Scope and components are finalised with you.</span>
              </div>
            </article>
          ) : (
            <div className="idea-detail__inner idea-detail__placeholder">{ideas ? 'Select an idea to see the details.' : 'Loading ideas…'}</div>
          )}
        </div>
      </div>
    </div>
  );
}
