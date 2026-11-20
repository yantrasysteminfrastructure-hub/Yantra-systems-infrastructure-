import { lazy, Suspense, useEffect, useState } from 'react';
import { PROGRAMMES, fillDeliverable, typesFor, type DomainScene as SceneId, type ProgrammeId } from '../data/content';
import { hasWebGL, scrollToId } from '../hooks';
import { OPEN_PLANNER_EVENT, type PlannerTarget } from '../lib/guideEvents';
import { DomainFallback } from './visuals/DomainFallback';
import { requestEnquiry } from './Services';
import { IdeaExplorer } from './IdeaExplorer';

const DomainScene = lazy(() => import('../three/DomainScene'));

const SCENE: Record<SceneId, { label: string; caption: string }> = {
  software: { label: 'Desk with a laptop typing firmware code, a phone running a dashboard app, and a microcontroller board', caption: 'Software · live code & app' },
  embedded: { label: 'Microcontroller development board with a sensor module and data pulses on its circuit traces', caption: 'Embedded · MCU & sensor I/O' },
  electrical: { label: 'Microcontroller switching a relay that drives a DC motor and fan from a battery pack', caption: 'Electrical · relay motor control' },
  mechanical: { label: 'Gear train driving a crank and piston mechanism on bearing blocks', caption: 'Mechanical · gear & crank–slider' },
  civil: { label: 'Building frame rising floor by floor on a site plan while a tower crane lifts loads', caption: 'Civil · structure & site plan' },
  business: { label: 'Desk with bound project reports, an open report with charts, and a tablet showing a live dashboard', caption: 'Research · reports & analysis' },
  parking: { label: 'Smart parking model: cars drive in and out while slot sensors switch each slot light', caption: 'Smart parking · built by Yantra' },
};

export function Domains() {
  const [programmeId, setProgrammeId] = useState<ProgrammeId>('btech');
  const [branchIdx, setBranchIdx] = useState(0);
  const [typeId, setTypeId] = useState('complete');
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => setWebgl(hasWebGL()), []);

  const programme = PROGRAMMES.find((p) => p.id === programmeId)!;
  const branch = programme.branches[Math.min(branchIdx, programme.branches.length - 1)];
  const types = typesFor(programme);
  const type = types.find((t) => t.id === typeId) ?? types[0];
  const scene = SCENE[branch.scene];
  const tag = programme.branches.length > 1 ? `${programme.label} · ${branch.short}` : programme.label;

  const pickProgramme = (id: ProgrammeId, branchId?: string) => {
    const p = PROGRAMMES.find((x) => x.id === id)!;
    setProgrammeId(id);
    setBranchIdx(Math.max(0, branchId ? p.branches.findIndex((b) => b.id === branchId) : 0));
  };

  // the guide can open the planner on a programme / branch / project type
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { programme: id, branch: branchId, type } = (e as CustomEvent<PlannerTarget>).detail;
      const p = PROGRAMMES.find((x) => x.id === id);
      if (!p) return;
      setProgrammeId(id);
      setBranchIdx(Math.max(0, branchId ? p.branches.findIndex((b) => b.id === branchId) : 0));
      if (type) setTypeId(type);
      scrollToId('domains');
    };
    window.addEventListener(OPEN_PLANNER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PLANNER_EVENT, onOpen);
  }, []);

  return (
    <section id="domains" className="section section--light domains" aria-labelledby="domains-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__num">03</span> Industries / Domains
          </p>
          <div className="section-head__row">
            <h2 id="domains-title" className="h2" data-reveal>
              Across engineering <span className="mark">disciplines.</span>
            </h2>
            <p className="section-head__aside" data-reveal>
              Choose your programme, branch and the kind of help you need &mdash; see what&rsquo;s included, then send it straight to
              our team.
            </p>
          </div>
        </header>

        <div className="planner" data-reveal>
          <div className="planner__controls">
            <fieldset className="planner__step planner__step--prog">
              <legend className="planner__legend">
                <span>01</span> Programme
              </legend>
              <div className="seg" style={{ '--n': PROGRAMMES.length } as React.CSSProperties}>
                {PROGRAMMES.map((p) => (
                  <label key={p.id} className={`seg__opt${p.id === programmeId ? ' is-on' : ''}`}>
                    <input type="radio" name="programme" value={p.id} checked={p.id === programmeId} onChange={() => pickProgramme(p.id)} />
                    {p.label}
                  </label>
                ))}
                <span className="seg__thumb" style={{ '--i': PROGRAMMES.findIndex((p) => p.id === programmeId) } as React.CSSProperties} aria-hidden="true" />
              </div>
            </fieldset>

            <fieldset className="planner__step planner__step--branch">
              <legend className="planner__legend">
                <span>02</span> Branch
              </legend>
              <div className="branch-list" key={programmeId}>
                {programme.branches.map((b, i) => (
                  <label key={b.id} className={`branch-opt${b.id === branch.id ? ' is-on' : ''}`} style={{ '--i': i } as React.CSSProperties}>
                    <input type="radio" name="branch" value={b.id} checked={b.id === branch.id} onChange={() => setBranchIdx(i)} />
                    <span className="branch-opt__code">{b.short}</span>
                    <span className="branch-opt__name">{b.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="planner__step planner__step--type">
              <legend className="planner__legend">
                <span>03</span> Type of project
              </legend>
              <div className="type-grid">
                {types.map((t) => (
                  <label key={t.id} className={`type-opt${t.id === type.id ? ' is-on' : ''}`}>
                    <input type="radio" name="ptype" value={t.id} checked={t.id === type.id} onChange={() => setTypeId(t.id)} />
                    <span className="type-opt__label">{t.label}</span>
                    <span className="type-opt__hint">{t.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="planner__stage">
            <div className="domains__viewer planner__viewer">
              {webgl === false ? (
                <DomainFallback scene={branch.scene} />
              ) : webgl ? (
                <Suspense fallback={<div className="domains__canvas" />}>
                  <DomainScene scene={branch.scene} label={scene.label} />
                </Suspense>
              ) : null}
              <div className="domains__hud" aria-hidden="true">
                <span>
                  {tag}
                </span>
                <span className="domains__hint">Drag to rotate</span>
              </div>
              <div className="domains__caption" aria-hidden="true">
                <span className="domains__live" />
                {scene.caption}
              </div>
            </div>

            <div className="planner__summary" aria-live="polite" key={`${programmeId}-${branch.id}-${type.id}`}>
              <div className="planner__title-row">
                <h3 className="domains__title">{branch.title}</h3>
                <span className="planner__badge">{programme.label}</span>
              </div>
              <p className="domains__summary">{branch.summary}</p>
              <div className="domains__cols">
                <div>
                  <h4 className="label">Typical project areas</h4>
                  <ul className="chips">
                    {branch.areas.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="label">{type.label} includes</h4>
                  <ul className="ticks">
                    {type.includes.map((s) => (
                      <li key={s}>{fillDeliverable(s, branch)}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="domains__foot">
                <button
                  type="button"
                  className="btn btn--dark"
                  onClick={() => requestEnquiry({ service: programme.formService, branch: branch.title, projectType: type.label })}
                >
                  Enquire: {tag} · {type.label}
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>
                </button>
                <p className="fineprint">Topics, technologies and scope are confirmed with you during the initial discussion.</p>
              </div>
            </div>
          </div>
        </div>

        <IdeaExplorer programme={programme} branch={branch} projectTypeLabel={type.label} onPick={(p, b) => pickProgramme(p, b)} />
      </div>
    </section>
  );
}
