import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { projects } from '../../content/projects';
import { morph } from '../../lib/morph';
import { PingBadge } from '../project/PingBadge';
import { ProjectDialog } from '../project/ProjectDialog';
import { Icon } from '../ui/Icon';
import { Reveal, Section } from '../ui/Section';

const displayUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

// A link like /#project-primesys opens that case study directly.
const hashPrefix = '#project-';
const idFromHash = () => {
  const id = window.location.hash.startsWith(hashPrefix) ? window.location.hash.slice(hashPrefix.length) : null;
  return projects.some((project) => project.id === id) ? id : null;
};
const urlWithHash = (hash) => `${window.location.pathname}${window.location.search}${hash}`;

// Each project gets a full-width row: screenshot, one line, proof points, facts,
// stack and links. The full case study opens in a dialog.
export function Projects() {
  const [openId, setOpenId] = useState(idFromHash);
  const triggerRefs = useRef({});
  const lastOpenId = useRef(openId);
  const openProject = projects.find((project) => project.id === openId) ?? null;

  // Opening a case study adds a history entry, so the browser or phone Back
  // button closes it instead of leaving the site, and Forward reopens it.
  // In-page links to #project-<id> open it too.
  useEffect(() => {
    const syncWithUrl = () => {
      const id = idFromHash();
      if (id) lastOpenId.current = id;
      setOpenId(id);
    };
    window.addEventListener('popstate', syncWithUrl);
    window.addEventListener('hashchange', syncWithUrl);
    return () => {
      window.removeEventListener('popstate', syncWithUrl);
      window.removeEventListener('hashchange', syncWithUrl);
    };
  }, []);

  // The card's screenshot grows into the case study's main screenshot (lib/morph.js).
  const open = (id) => {
    morph(
      document.querySelector(`[data-cover="${id}"]`),
      () =>
        flushSync(() => {
          window.history.pushState({ caseStudy: id }, '', urlWithHash(`${hashPrefix}${id}`));
          lastOpenId.current = id;
          setOpenId(id);
        }),
      () => document.querySelector('.project-dialog[open] .shot-primary img'),
    );
  };

  // Runs however the dialog closes: close button, Escape, backdrop click or Back.
  const close = () => {
    triggerRefs.current[lastOpenId.current]?.focus();
    if (window.history.state?.caseStudy) window.history.back();
    else if (idFromHash()) window.history.replaceState(null, '', urlWithHash('#projects'));
    setOpenId(null);
  };

  return (
    <Section
      id="projects"
      index="01"
      label="Projects"
      title="Two systems, both live."
      intro="Both are in use today. Open the live site, or read the case study for the problem, how it works, my role and the stack."
    >
      <ol className="showcase" role="list">
        {projects.map((project, index) => {
          const live = project.links.find((link) => link.primary);
          const cover = project.cover ?? project.gallery[0];
          const chips = project.keyStack ?? project.stack.flatMap((group) => group.items).slice(0, 5);
          const facts = [
            { label: 'Role', value: project.role },
            { label: 'Team', value: project.team },
            { label: 'Platform', value: project.platform },
          ].filter((fact) => fact.value);

          return (
            <Reveal as="li" key={project.id} className="showcase-item spotlight" data-pointer style={{ '--i': index }}>
              <button
                type="button"
                className="showcase-media"
                onClick={() => open(project.id)}
                tabIndex={-1}
                aria-hidden="true"
                data-tilt
                data-cursor="Open"
              >
                {/* The button stays flat so clicks always land; only this frame tilts. */}
                <span className="media-frame">
                  <span className="browser-bar">
                    <span className="window-dots" />
                    {live && <span className="browser-url">{displayUrl(live.url)}</span>}
                  </span>
                  <img
                    src={cover.thumb}
                    srcSet={`${cover.thumb} ${Math.round(cover.width / 2)}w, ${cover.src} ${cover.width}w`}
                    sizes="(max-width: 900px) 100vw, 640px"
                    width={cover.width}
                    height={cover.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    data-cover={project.id}
                  />
                  <span className="glare" />
                </span>
              </button>

              <div className="showcase-body">
                <p className="project-meta">
                  {/* Non-breaking spaces keep "· 2025" on the same line as the type. */}
                  <span>{`${project.type} · ${project.year}`}</span>
                  {project.status &&
                    (live ? (
                      <PingBadge url={live.url} label={project.status} siteName={project.name} />
                    ) : (
                      <span className="status-badge">
                        <span className="status-dot" aria-hidden="true" />
                        {project.status}
                      </span>
                    ))}
                </p>
                <h3 className="project-name">{project.name}</h3>
                <p className="project-tagline">{project.tagline}</p>

                {project.highlights?.length > 0 && (
                  <ul className="highlights" role="list">
                    {project.highlights.map((item, i) => (
                      <li key={item} style={{ '--i': i }}>
                        <Icon name="check" size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {facts.length > 0 && (
                  <dl className="project-facts">
                    {facts.map((fact) => (
                      <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <ul className="chips" role="list" aria-label="Built with">
                  {chips.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="project-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    ref={(el) => (triggerRefs.current[project.id] = el)}
                    onClick={() => open(project.id)}
                    aria-haspopup="dialog"
                  >
                    Read case study <Icon name="arrowRight" size={15} />
                    <span className="visually-hidden"> for {project.name}</span>
                  </button>
                  {live && (
                    <a
                      className="btn btn-secondary btn-sm"
                      href={live.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live site <Icon name="external" size={15} />
                      <span className="visually-hidden"> for {project.name} (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>

      <ProjectDialog project={openProject} onClose={close} />
    </Section>
  );
}
