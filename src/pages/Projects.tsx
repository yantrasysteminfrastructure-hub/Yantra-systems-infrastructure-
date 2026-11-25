import { SERVICES, servicePath } from '../data/content';
import { requestEnquiry } from '../lib/enquiryBus';
import { openIdea } from '../lib/guideEvents';
import { Link } from '../lib/router';
import { Domains } from '../components/Domains';
import { Icon } from '../components/Icons';
import { PageHero } from '../components/PageHero';
import { ServiceScene } from '../components/ServiceScene';

const school = SERVICES.find((s) => s.id === 'school')!;

export default function Projects() {
  return (
    <>
      <PageHero
        eyebrow="Our projects"
        title={
          <>
            Work, ideas and <span className="grad">what&rsquo;s next.</span>
          </>
        }
        lead="A delivered Yantra project, plus a planner and an idea library to help you choose and scope your own."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Projects' }]}
        hue="#2fe3a4"
        hue2="#b8ffe4"
      >
        <div className="page-hero__actions">
          <a href="#domains" className="btn btn--light">
            Plan your project <Icon name="arrow" />
          </a>
          <a href="#ideas" className="btn btn--ghost">
            Browse project ideas
          </a>
        </div>
      </PageHero>

      <section className="section featured" aria-labelledby="featured-title">
        <div className="container featured__grid">
          <div data-reveal>
            <ServiceScene scene="parking" />
          </div>
          <div className="featured__copy">
            <p className="eyebrow" data-reveal>
              Delivered by Yantra · School project
            </p>
            <h2 id="featured-title" className="h2 h2--sm" data-reveal>
              Smart Parking System
            </h2>
            <p className="lead" data-reveal>
              A working school model that uses sensors to detect parking slots. Each slot&rsquo;s sensor switches its light, so free spaces
              can be seen at a glance.
            </p>
            <ul className="chip-cloud chip-cloud--sm" data-reveal>
              <li>Slot sensors</li>
              <li>Indicator lights</li>
              <li>Working model</li>
              <li>School exhibition</li>
            </ul>
            <div className="featured__btns" data-reveal>
              <button type="button" className="btn btn--light" onClick={() => openIdea('smart-parking')}>
                How it works <Icon name="arrow" />
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => requestEnquiry({ service: school.formValue, message: 'I am interested in a project like the Smart Parking System. ' })}
              >
                Build one like this
              </button>
            </div>
            <p className="fineprint" data-reveal>
              More case studies will be published here as they are documented. See <Link to={servicePath(school)}>School Projects</Link> for
              this service.
            </p>
          </div>
        </div>
      </section>

      <Domains />
    </>
  );
}
