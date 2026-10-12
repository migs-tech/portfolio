import { useLayoutEffect, useRef } from 'react';
import { morph } from '../../lib/morph';
import { TagList } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { CaseStudy } from './CaseStudy';
import { Gallery } from './Gallery';
import { Results } from './Results';

// Full project write-up in a <dialog>, which provides focus trapping,
// Escape-to-close and an inert background. The screenshot lightbox opens on
// top of it and closes first on Escape.
export function ProjectDialog({ project, onClose }) {
  const dialogRef = useRef(null);
  const open = project !== null;

  // Close button and backdrop: the main screenshot shrinks back into its project
  // card (lib/morph.js). Escape and Back close straight away.
  const requestClose = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    const id = project?.id;
    morph(
      dialog.querySelector('.shot-primary img'),
      () => {
        // Synchronous on purpose: Chrome holds the dialog's close event until the
        // transition's update has finished, so waiting for it would stall the page.
        // React catches up when that event arrives, just after the transition.
        dialog.close();
        document.documentElement.style.overflow = '';
      },
      () => document.querySelector(`[data-cover="${id}"]`),
    );
  };

  // Layout effect: when Back clears the project, the dialog closes before the
  // browser paints it empty.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Stop the page behind from scrolling while the dialog is open. A layout effect,
  // so the page is unlocked in the same commit as the close.
  useLayoutEffect(() => {
    if (!open) return;
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, [open]);

  const live = project?.links.find((link) => link.primary);
  const meta = project
    ? [
        { label: 'Role', value: project.role },
        { label: 'Type', value: project.type },
        { label: 'Platform', value: project.platform },
        { label: 'Team', value: project.team },
        { label: 'Year', value: project.year },
      ].filter((item) => item.value)
    : [];

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      // React passes the nested lightbox's close event up to here; only this dialog's own close counts.
      onClose={(event) => event.target === dialogRef.current && onClose()}
      onClick={(event) => event.target === dialogRef.current && requestClose()}
    >
      {project && (
        <article className="pd">
          <header className="pd-bar">
            <p className="pd-kicker">case study · {project.name}</p>
            <button type="button" className="icon-btn icon-btn-sm" onClick={requestClose} autoFocus>
              <Icon name="close" size={18} />
              <span className="visually-hidden">Close case study</span>
            </button>
          </header>

          <div className="pd-head">
            <h2 id="project-dialog-title" className="pd-title">
              {project.title}
            </h2>
            <p className="pd-summary">{project.summary}</p>
            {project.links.length > 0 && (
              <div className="pd-links">
                {project.links.map((link) => (
                  <a
                    key={link.url}
                    className={`btn btn-sm ${link.primary ? 'btn-primary' : 'btn-secondary'}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label} <Icon name="external" size={15} />
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                ))}
                {live && <span className="pd-url">{live.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>}
              </div>
            )}
            <dl className="pd-meta">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Gallery images={project.gallery} projectName={project.name} />

          {project.results && <Results results={project.results} />}

          <section className="pd-section" aria-labelledby="pd-features">
            <h3 id="pd-features" className="pd-label">
              key features
            </h3>
            <ul className="pd-features" role="list">
              {project.features.map((feature) => (
                <li key={feature.title}>
                  <p className="pd-feature-title">{feature.title}</p>
                  <p className="pd-feature-text">{feature.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="pd-section" aria-labelledby="pd-stack">
            <h3 id="pd-stack" className="pd-label">
              stack
            </h3>
            {project.stackNote && <p className="pd-note">{project.stackNote}</p>}
            <dl className="row-list">
              {project.stack.map((group) => (
                <div key={group.layer} className="row">
                  <dt className="row-key">{group.layer}</dt>
                  <dd>
                    <TagList items={group.items} className="tags-sm" />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <CaseStudy project={project} />
        </article>
      )}
    </dialog>
  );
}
