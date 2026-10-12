import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from '../../content/profile';
import { resume } from '../../content/resume';
import { openCertificate } from '../../lib/certificates';
import { resumeHash } from '../../lib/resume';
import { CopyButton } from '../contact/CopyButton';
import { ResumeDownload } from '../ui/Button';
import { DecodeText } from '../ui/DecodeText';
import { Icon } from '../ui/Icon';

const FEED = 450; // ms for the blank sheet to come out of the slot
const PRINT = 1100; // ms to print the part of the sheet that's on screen
const sections = [
  { id: 'rv-projects', tab: 'Projects', title: 'Projects' },
  { id: 'rv-work', tab: 'Work', title: 'Work Experience' },
  { id: 'rv-education', tab: 'Education', title: 'Education' },
  { id: 'rv-skills', tab: 'Skills', title: 'Skills & Interests' },
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isResumeUrl = () => window.location.hash === resumeHash;
const urlWithHash = (hash) => `${window.location.pathname}${window.location.search}${hash}`;
const startPhase = () => (reducedMotion() ? 'ready' : 'printing');

// The résumé as a page on the site (content/resume.js), "printed" when it opens:
// a blank sheet slides out of the slot under the toolbar, a print head sweeps
// down it and the text inks in behind it, then the "Open to work" stamp lands.
// Tabs jump between sections, project names open their case studies, and the
// PDF is one click away. Opens from the résumé buttons, the command palette
// (lib/resume.js) or a /#resume link; Back closes it.
export function ResumeViewer() {
  const [phase, setPhase] = useState(() => (isResumeUrl() ? startPhase() : 'closed')); // closed | printing | ready
  const [run, setRun] = useState(0); // a fresh sheet on every open, so the print plays again
  const [active, setActive] = useState(sections[0].id);
  const open = phase !== 'closed';

  const dialogRef = useRef(null);
  const rvRef = useRef(null);
  const stageRef = useRef(null);
  const paperRef = useRef(null);
  const inkRef = useRef(null);
  const headRef = useRef(null);
  const pctRef = useRef(null);
  const tabsRef = useRef(null);
  const returnFocus = useRef(null);
  const pressedBackdrop = useRef(false);

  // Opening adds a history entry, so Back closes the viewer instead of leaving the site.
  useEffect(() => {
    const show = () => {
      setRun((n) => n + 1);
      setPhase(startPhase());
    };
    const onOpen = () => {
      if (dialogRef.current?.open) return;
      returnFocus.current = document.activeElement;
      if (!isResumeUrl()) window.history.pushState({ resume: true }, '', urlWithHash(resumeHash));
      show();
    };
    const syncWithUrl = () => {
      if (!isResumeUrl()) setPhase('closed');
      else if (!dialogRef.current?.open) show();
    };
    window.addEventListener('portfolio:resume', onOpen);
    window.addEventListener('popstate', syncWithUrl);
    window.addEventListener('hashchange', syncWithUrl);
    return () => {
      window.removeEventListener('portfolio:resume', onOpen);
      window.removeEventListener('popstate', syncWithUrl);
      window.removeEventListener('hashchange', syncWithUrl);
    };
  }, []);

  // Layout effects, in this order: open the dialog, then measure the sheet for the print.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      stageRef.current?.focus({ preventScroll: true }); // arrow keys and Space scroll the sheet
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, [open]);

  // The print. Timed so the part of the sheet on screen takes PRINT ms whatever
  // the screen height; every block inks in as the head passes it.
  useLayoutEffect(() => {
    if (phase !== 'printing') return;
    const rv = rvRef.current;
    const paper = paperRef.current;
    const ink = inkRef.current;
    const paperBox = paper.getBoundingClientRect();
    const height = paperBox.height;
    const visible = Math.min(height, Math.max(240, stageRef.current.getBoundingClientRect().bottom - paperBox.top));
    const total = Math.round(Math.min(3600, Math.max(PRINT, (PRINT * height) / visible)));

    for (const block of ink.querySelectorAll('[data-ink]')) {
      const at = FEED + ((block.getBoundingClientRect().top - paperBox.top) / height) * total;
      block.style.setProperty('--d', `${Math.round(at)}ms`);
    }
    rv.style.setProperty('--stamp-at', `${FEED + Math.min(total, PRINT) + 150}ms`);
    rv.setAttribute('data-animate', '');

    const timing = { duration: total, delay: FEED, easing: 'linear', fill: 'backwards' };
    const reveal = ink.animate({ clipPath: ['inset(-24px -24px 100% -24px)', 'inset(-24px -24px 0% -24px)'] }, timing);
    const head = headRef.current.animate({ transform: ['translateY(0)', `translateY(${height}px)`], opacity: [1, 1] }, timing);

    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(Math.max((now - start - FEED) / total, 0), 1);
      rv.style.setProperty('--printed', progress.toFixed(3));
      if (pctRef.current) pctRef.current.textContent = String(Math.round(progress * 100));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    reveal.finished.then(() => setPhase('ready')).catch(() => {}); // cancelled: closed mid-print

    return () => {
      cancelAnimationFrame(frame);
      reveal.cancel();
      head.cancel();
    };
  }, [phase, run]);

  // Reading progress (the light in the slot) and the current section's tab.
  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    const update = () => {
      const max = stage.scrollHeight - stage.clientHeight;
      rvRef.current?.style.setProperty('--progress', max > 0 ? (stage.scrollTop / max).toFixed(3) : '1');
      const line = stage.getBoundingClientRect().top + stage.clientHeight * 0.3;
      let current = sections[0].id;
      for (const { id } of sections) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= line) current = id;
      }
      if (max > 0 && stage.scrollTop >= max - 2) current = sections.at(-1).id;
      setActive(current);
    };
    update();
    stage.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      stage.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open, run]);

  // Slide the tab highlight under the current tab.
  useLayoutEffect(() => {
    const list = tabsRef.current;
    if (!list) return;
    const place = () => {
      const tab = list.querySelector('[aria-current="true"]');
      list.style.setProperty('--pill-x', `${tab ? tab.offsetLeft : 0}px`);
      list.style.setProperty('--pill-w', `${tab ? tab.offsetWidth : 0}px`);
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [active, open, run]);

  // Close button, Escape and clicks beside the sheet: the sheet lifts away first.
  // Back and links that leave the viewer close it straight away.
  const requestClose = () => {
    const dialog = dialogRef.current;
    if (!dialog?.open || dialog.classList.contains('is-closing')) return;
    if (reducedMotion()) {
      dialog.close();
      return;
    }
    dialog.classList.add('is-closing');
    setTimeout(() => {
      dialog.classList.remove('is-closing');
      if (dialog.open) dialog.close();
    }, 240);
  };

  // Runs however it closes.
  const onClose = (event) => {
    if (event.target !== dialogRef.current) return;
    const target = returnFocus.current;
    returnFocus.current = null;
    target?.focus?.({ preventScroll: true });
    if (window.history.state?.resume) window.history.back();
    else if (isResumeUrl()) window.history.replaceState(null, '', urlWithHash(''));
    setPhase('closed');
  };

  const jumpTo = (id) => {
    const stage = stageRef.current;
    const section = document.getElementById(id);
    if (!stage || !section) return;
    const top = section.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop - 12;
    stage.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
    section.querySelector('.rv-h')?.focus({ preventScroll: true });
    // The heading gets a quick highlighter swipe.
    section.classList.remove('is-flash');
    void section.offsetWidth;
    section.classList.add('is-flash');
    setTimeout(() => section.classList.remove('is-flash'), 1400);
  };

  // Leaves the viewer for the case study (the hash change closes this dialog).
  const openProject = (id) => window.location.assign(`#project-${id}`);

  return (
    <dialog
      ref={dialogRef}
      className="resume-dialog"
      aria-label={`Résumé of ${resume.name}`}
      onClose={onClose}
      onCancel={(event) => {
        if (event.target !== dialogRef.current || !event.cancelable) return;
        event.preventDefault();
        requestClose();
      }}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === stageRef.current || event.target.classList.contains('rv-feed');
      }}
      onClick={(event) => {
        const onBackdrop = event.target === stageRef.current || event.target.classList.contains('rv-feed');
        if (onBackdrop && pressedBackdrop.current) requestClose();
      }}
    >
      {open && (
        <div ref={rvRef} key={run} className={`rv is-${phase}`}>
          <header className="rv-bar">
            <div className="rv-bar-inner">
              <p className="rv-status">
                <span className="rv-led" aria-hidden="true" />
                <span className="rv-title">Résumé</span>
                <span className="rv-meta">
                  {phase === 'printing' ? (
                    <>
                      Printing <span ref={pctRef}>0</span>%
                    </>
                  ) : (
                    `Updated ${resume.updated}`
                  )}
                </span>
              </p>

              <nav className="rv-tabs" aria-label="Résumé sections">
                <ul ref={tabsRef} role="list">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        className="rv-tab"
                        aria-current={active === section.id ? 'true' : undefined}
                        onClick={() => jumpTo(section.id)}
                      >
                        {section.tab}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rv-actions">
                <a className="btn btn-secondary btn-sm" href={profile.resume.href} target="_blank" rel="noopener noreferrer">
                  <Icon name="external" size={15} />
                  <span className="btn-label">Open PDF</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <ResumeDownload resume={profile.resume} variant="primary" className="btn-sm">
                  Download
                </ResumeDownload>
                <button type="button" className="icon-btn icon-btn-sm" onClick={requestClose}>
                  <Icon name="close" size={18} />
                  <span className="visually-hidden">Close résumé</span>
                </button>
              </div>
            </div>
            <span className="rv-slot" aria-hidden="true">
              <span className="rv-progress" />
            </span>
          </header>

          <div ref={stageRef} className="rv-stage" tabIndex={-1}>
            <div className="rv-feed">
              <article ref={paperRef} className="rv-paper">
                <span ref={headRef} className="rv-head" aria-hidden="true" />
                <div ref={inkRef} className="rv-ink">
                  <header className="rv-top">
                    <h2 className="rv-name" data-ink>
                      <DecodeText text={resume.name} duration={1100} />
                    </h2>
                    <ul className="rv-contact" role="list" data-ink>
                      <li>
                        <Icon name="pin" size={15} />
                        {resume.location}
                      </li>
                      <li>
                        <Icon name="mail" size={15} />
                        <a href={`mailto:${resume.email}`}>{resume.email}</a>
                        <CopyButton text={resume.email} label="email address" />
                      </li>
                    </ul>
                    <span className="rv-stamp" aria-hidden="true">
                      {profile.availability}
                    </span>
                  </header>

                  <PaperSection {...sections[0]}>
                    {resume.projects.map((project) => (
                      <Entry
                        key={project.name}
                        title={
                          <>
                            <button type="button" className="rv-link" onClick={() => openProject(project.projectId)}>
                              {project.name}
                              <Icon name="arrowRight" size={14} />
                              <span className="visually-hidden"> (read the case study)</span>
                            </button>{' '}
                            – {project.title}
                            {project.note && <span className="rv-light"> ({project.note})</span>}
                          </>
                        }
                        sub={project.role}
                        bullets={project.bullets}
                      />
                    ))}
                  </PaperSection>

                  <PaperSection {...sections[1]}>
                    {resume.work.map((job) => (
                      <Entry
                        key={job.role}
                        title={
                          <>
                            {job.role}
                            {job.organization && <span className="rv-light"> – {job.organization}</span>}
                          </>
                        }
                        period={job.period}
                        bullets={job.bullets}
                      >
                        {job.certificate && (
                          <button type="button" className="rv-cert" onClick={() => openCertificate(job.certificate)} data-ink>
                            <Icon name="award" size={15} />
                            View certificate
                          </button>
                        )}
                      </Entry>
                    ))}
                  </PaperSection>

                  <PaperSection {...sections[2]}>
                    <Entry title={resume.education.school} period={resume.education.period} sub={resume.education.degree}>
                      <p className="rv-detail" data-ink>
                        Graduated: {resume.education.graduated}
                      </p>
                      <button type="button" className="rv-cert" onClick={() => openCertificate(resume.education.certificate)} data-ink>
                        <Icon name="award" size={15} />
                        View diploma
                      </button>
                    </Entry>
                  </PaperSection>

                  <PaperSection {...sections[3]}>
                    {[
                      ['Technical skills', resume.technicalSkills],
                      ['Personal skills', resume.personalSkills],
                    ].map(([label, items]) => (
                      <div key={label} className="rv-skillset" data-ink>
                        <h4 className="rv-sub">{label}</h4>
                        <ul className="rv-chips" role="list">
                          {items.map((item) => (
                            <li key={item} className="rv-chip">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </PaperSection>

                  <footer className="rv-foot" data-ink>
                    <span>Updated {resume.updated}</span>
                    <span>The PDF also lists my phone number.</span>
                  </footer>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

function PaperSection({ id, title, children }) {
  return (
    <section className="rv-section" id={id} aria-labelledby={`${id}-title`}>
      <h3 className="rv-h" id={`${id}-title`} tabIndex={-1} data-ink>
        <span>{title}</span>
      </h3>
      {children}
    </section>
  );
}

function Entry({ title, period, sub, bullets = [], children }) {
  return (
    <div className="rv-entry">
      <div className="rv-entry-head" data-ink>
        <h4 className="rv-entry-title">{title}</h4>
        {period && <p className="rv-date">{period}</p>}
      </div>
      {sub && (
        <p className="rv-sub" data-ink>
          {sub}
        </p>
      )}
      {bullets.length > 0 && (
        <ul className="rv-bullets" role="list">
          {bullets.map((bullet) => (
            <li key={bullet} data-ink>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
