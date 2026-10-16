import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { inquiry } from '../../content/inquiry';
import { profile } from '../../content/profile';
import { briefHash } from '../../lib/brief';
import { confetti } from '../../lib/confetti';
import { CONTACT_ENDPOINT as ENDPOINT, EMAIL_PATTERN } from '../../lib/contact';
import { FieldError } from '../contact/ContactForm';
import { DecodeText } from '../ui/DecodeText';
import { Icon } from '../ui/Icon';

const steps = ['Project', 'Features', 'Budget', 'You'];
const blank = { service: '', features: [], budget: '', timeline: '', name: '', email: '', organization: '', details: '', website: '' };

const isBriefUrl = () => window.location.hash === briefHash;
const urlWithHash = (hash) => `${window.location.pathname}${window.location.search}${hash}`;
const serviceById = (id) => inquiry.services.find((service) => service.id === id);
const budgetById = (id) => inquiry.budgets.find((budget) => budget.id === id);

// Visitors in the Philippines see pesos first; everyone else sees dollars.
function defaultCurrency() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Manila' ? 'php' : 'usd';
  } catch {
    return 'php';
  }
}

// A short reference that goes in the email subject, like FM-1016-K7Q (month, day, three random characters).
function newBriefId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 5).toUpperCase().padEnd(3, '0');
  return `FM-${pad(now.getMonth() + 1)}${pad(now.getDate())}-${random}`;
}

function validateStep(step, values) {
  const errors = {};
  if (step === 0 && !values.service) errors.service = 'Pick what you’d like me to build.';
  if (step === 2) {
    if (!values.budget) errors.budget = 'Pick a budget range, or “Not sure yet”.';
    if (!values.timeline) errors.timeline = 'Pick a timeline, or “Flexible”.';
  }
  if (step === 3) {
    if (!values.name.trim()) errors.name = 'Please enter your name.';
    if (!values.email.trim()) errors.email = 'Please enter your email address.';
    else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address, like name@example.com.';
    if (values.details.trim().length < 10) errors.details = 'Tell me a little about the project (at least 10 characters).';
  }
  return errors;
}

// What lands in Felix's inbox: one field per answer, budgets in both currencies.
function briefFields(values, briefId) {
  const budget = budgetById(values.budget);
  return {
    brief: briefId,
    project: serviceById(values.service)?.label ?? '',
    features: values.features.length ? values.features.join(', ') : 'Not sure yet',
    budget: !budget || budget.id === 'unsure' ? (budget?.php ?? '') : `${budget.php} (about ${budget.usd})`,
    timeline: values.timeline,
    name: values.name.trim(),
    email: values.email.trim(),
    organization: values.organization.trim() || '—',
    details: values.details.trim(),
  };
}

const briefText = (fields) =>
  [
    `Project brief ${fields.brief}`,
    '',
    `Project: ${fields.project}`,
    `Features: ${fields.features}`,
    `Budget: ${fields.budget}`,
    `Timeline: ${fields.timeline}`,
    `Organization: ${fields.organization}`,
    '',
    fields.details,
    '',
    `— ${fields.name}`,
    fields.email,
  ].join('\n');

// "Start a project": four quick steps for freelance clients, with the brief
// filling in on a ticket beside them as they answer. Sending stamps the ticket
// and posts it to the same inbox as the contact form (lib/contact.js). Opens from
// the freelance card, the contact panel, the command palette (lib/brief.js) or a
// /#start-project link; Back closes it, and an unsent draft is kept until then.
export function ProjectBrief() {
  const [open, setOpen] = useState(isBriefUrl);
  const [values, setValues] = useState(blank);
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [dir, setDir] = useState('forward');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | mailto | error
  const [currency, setCurrency] = useState(defaultCurrency);
  const [briefId, setBriefId] = useState(newBriefId);

  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const sendRef = useRef(null);
  const returnFocus = useRef(null);
  const pressedBackdrop = useRef(false);
  const moved = useRef(false); // the view changed: move focus to its heading

  const service = serviceById(values.service);
  const done = status === 'sent' || status === 'mailto';
  const sending = status === 'sending';
  const last = step === steps.length - 1;
  const view = done ? 'done' : step;

  // Opening adds a history entry, so Back closes the brief instead of leaving the site.
  useEffect(() => {
    const onOpen = () => {
      if (dialogRef.current?.open) return;
      returnFocus.current = document.activeElement;
      if (!isBriefUrl()) window.history.pushState({ brief: true }, '', urlWithHash(briefHash));
      setOpen(true);
    };
    const syncWithUrl = () => setOpen(isBriefUrl());
    window.addEventListener('portfolio:brief', onOpen);
    window.addEventListener('popstate', syncWithUrl);
    window.addEventListener('hashchange', syncWithUrl);
    return () => {
      window.removeEventListener('portfolio:brief', onOpen);
      window.removeEventListener('popstate', syncWithUrl);
      window.removeEventListener('hashchange', syncWithUrl);
    };
  }, []);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.scrollTop = 0;
      headingRef.current?.focus({ preventScroll: true });
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

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus();
  }, [view]);

  const reset = () => {
    setValues(blank);
    setStep(0);
    setFurthest(0);
    setDir('forward');
    setErrors({});
    setStatus('idle');
    setBriefId(newBriefId());
  };

  // Runs however it closes. A sent brief makes way for a fresh one next time.
  const onClose = (event) => {
    if (event.target !== dialogRef.current) return;
    const target = returnFocus.current;
    returnFocus.current = null;
    target?.focus?.({ preventScroll: true });
    if (window.history.state?.brief) window.history.back();
    else if (isBriefUrl()) window.history.replaceState(null, '', urlWithHash(''));
    setOpen(false);
    if (done) reset();
  };

  const requestClose = () => dialogRef.current?.close();

  const focusField = (name) => {
    const field = formRef.current?.elements[name];
    (field?.[0] ?? field)?.focus(); // a radio group comes back as a list
  };

  // Checks steps `from` up to (not including) `to`. On the first problem it shows
  // the errors and moves there, then returns false.
  const check = (from, to) => {
    for (let i = from; i < to; i += 1) {
      const found = validateStep(i, values);
      const first = Object.keys(found)[0];
      if (!first) continue;
      setErrors(found);
      if (i === step) focusField(first);
      else {
        moved.current = true;
        setDir('back');
        setStep(i);
      }
      return false;
    }
    return true;
  };

  const goToStep = (target) => {
    if (target === step || (target > step && !check(step, target))) return;
    setErrors({});
    moved.current = true;
    setDir(target > step ? 'forward' : 'back');
    setStep(target);
    setFurthest((current) => Math.max(current, target));
  };

  const clearError = (name) => errors[name] && setErrors((current) => ({ ...current, [name]: undefined }));

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    clearError(name);
    if (status === 'error') setStatus('idle');
  };

  // Features that don't apply to the new kind of project are dropped.
  const chooseService = (id) => {
    const next = serviceById(id);
    setValues((current) => ({ ...current, service: id, features: current.features.filter((feature) => next.features.includes(feature)) }));
    clearError('service');
  };

  const toggleFeature = (feature) =>
    setValues((current) => {
      const on = current.features.includes(feature);
      return { ...current, features: service.features.filter((item) => (item === feature ? !on : current.features.includes(item))) };
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!last) {
      goToStep(step + 1);
      return;
    }
    if (!check(0, steps.length)) return;

    const fields = briefFields(values, briefId);
    const subject = `Project brief ${briefId}: ${fields.project} for ${fields.name}`;
    moved.current = true;

    if (!ENDPOINT) {
      window.location.assign(`mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefText(fields))}`);
      setStatus('mailto');
      return;
    }

    // Honeypot: real visitors never see or fill this field.
    if (values.website) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...fields, _subject: subject }),
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      // Measured before the button makes way for the confirmation.
      const box = sendRef.current?.getBoundingClientRect();
      setStatus('sent');
      confetti({ origin: box ? { x: box.left + box.width / 2, y: box.top } : undefined, parent: dialogRef.current });
    } catch {
      moved.current = false;
      setStatus('error');
    }
  };

  const field = (name) => ({
    id: `pb-${name}`,
    name,
    value: values[name],
    onChange: update,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `pb-${name}-error` : undefined,
  });

  const nextLabel = step === 1 && values.features.length === 0 ? 'Skip' : 'Next';

  return (
    <dialog
      ref={dialogRef}
      className="brief-dialog"
      aria-labelledby="pb-title"
      onClose={onClose}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === dialogRef.current;
      }}
      onClick={(event) => event.target === dialogRef.current && pressedBackdrop.current && requestClose()}
    >
      {open && (
        <div className={`pb${done ? ' is-done' : ''}`}>
          <header className="pb-bar">
            <p className="pb-kicker">freelance · project brief</p>
            <button type="button" className="icon-btn icon-btn-sm" onClick={requestClose}>
              <Icon name="close" size={18} />
              <span className="visually-hidden">Close project brief</span>
            </button>
          </header>

          <div className="pb-body">
            <form ref={formRef} className="pb-form" onSubmit={handleSubmit} noValidate>
              <div className="pb-head">
                <h2 id="pb-title" className="pb-title">
                  Start a project
                </h2>
                <p className="pb-intro">Four quick steps, then your brief lands in my inbox. I reply {inquiry.replyTime}.</p>
              </div>

              <ol className="pb-steps" role="list" style={{ '--at': done ? 1 : step / (steps.length - 1) }}>
                {steps.map((label, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      className={`pb-step${i < step || done ? ' is-done' : ''}`}
                      aria-current={i === step && !done ? 'step' : undefined}
                      disabled={i > furthest || done}
                      onClick={() => goToStep(i)}
                    >
                      <span className="pb-step-dot" aria-hidden="true">
                        {i < step || done ? <Icon name="check" size={13} /> : i + 1}
                      </span>
                      <span className="pb-step-label">{label}</span>
                      {(i < step || done) && <span className="visually-hidden"> (done)</span>}
                    </button>
                  </li>
                ))}
              </ol>

              <MiniBrief values={values} service={service} currency={currency} briefId={briefId} />

              <div key={view} className="pb-stage" data-dir={dir}>
                {done ? (
                  <div className="pb-done">
                    <span className="pb-done-icon" aria-hidden="true">
                      <Icon name={status === 'sent' ? 'check' : 'mail'} size={26} />
                    </span>
                    <h3 ref={headingRef} className="pb-q" tabIndex={-1}>
                      {status === 'sent' ? 'Brief received' : 'Almost there'}
                    </h3>
                    {status === 'sent' ? (
                      <p>
                        Thanks, {values.name.trim().split(/\s+/)[0]}. Brief <strong>{briefId}</strong> is in my inbox, and I’ll reply to{' '}
                        <strong>{values.email.trim()}</strong> {inquiry.replyTime}.
                      </p>
                    ) : (
                      <p>
                        Your email app should now be open with brief <strong>{briefId}</strong> filled in. Press send there to deliver
                        it. If nothing opened, email me directly at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
                      </p>
                    )}
                    <div className="pb-done-actions">
                      <button type="button" className="btn btn-primary" onClick={requestClose}>
                        Done
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          moved.current = true;
                          reset();
                        }}
                      >
                        Start another brief
                      </button>
                    </div>
                  </div>
                ) : step === 0 ? (
                  <fieldset className="pb-group">
                    <legend>
                      <h3 ref={headingRef} className="pb-q" tabIndex={-1}>
                        What are we building?
                      </h3>
                    </legend>
                    <div className="pb-cards">
                      {inquiry.services.map((item, i) => {
                        const on = values.service === item.id;
                        return (
                          <label key={item.id} className={`pb-card spotlight${on ? ' is-on' : ''}`} data-pointer style={{ '--i': i }}>
                            <input
                              type="radio"
                              className="pb-input"
                              name="service"
                              value={item.id}
                              checked={on}
                              onChange={() => chooseService(item.id)}
                              aria-describedby={errors.service ? 'pb-service-error' : undefined}
                            />
                            <span className="pb-card-icon" aria-hidden="true">
                              <Icon name={item.icon} size={22} />
                            </span>
                            <span className="pb-card-title">{item.label}</span>
                            <span className="pb-card-text">{item.text}</span>
                            <span className="pb-card-proof">{item.proof}</span>
                            <span className="pb-tick" aria-hidden="true">
                              <Icon name="check" size={13} />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <FieldError id="pb-service-error" message={errors.service} />
                  </fieldset>
                ) : step === 1 ? (
                  <fieldset className="pb-group">
                    <legend>
                      <h3 ref={headingRef} className="pb-q" tabIndex={-1}>
                        What should your {service?.label.toLowerCase()} do?
                      </h3>
                    </legend>
                    <p className="pb-help">Pick any that apply, or skip this if you’d like my advice.</p>
                    <div className="pb-chips">
                      {service?.features.map((feature, i) => {
                        const on = values.features.includes(feature);
                        return (
                          <label key={feature} className={`pb-chip${on ? ' is-on' : ''}`} style={{ '--i': i }}>
                            <input
                              type="checkbox"
                              className="pb-input"
                              name="features"
                              value={feature}
                              checked={on}
                              onChange={() => toggleFeature(feature)}
                            />
                            <span className="pb-box" aria-hidden="true">
                              <Icon name="check" size={12} />
                            </span>
                            {feature}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ) : step === 2 ? (
                  <div className="pb-group">
                    <h3 ref={headingRef} className="pb-q" tabIndex={-1}>
                      Budget and timeline
                    </h3>
                    <fieldset className="pb-sub">
                      <legend className="pb-label">Your budget</legend>
                      <div className="pb-currency" role="group" aria-label="Currency">
                        {[
                          ['php', '₱ PHP'],
                          ['usd', '$ USD'],
                        ].map(([id, label]) => (
                          <button key={id} type="button" aria-pressed={currency === id} onClick={() => setCurrency(id)}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="pb-pills">
                        {inquiry.budgets.map((budget, i) => (
                          <Pill key={budget.id} name="budget" value={budget.id} checked={values.budget === budget.id} onChange={update} error={errors.budget} index={i}>
                            <span key={currency} className="pb-flip">
                              {budget[currency]}
                            </span>
                          </Pill>
                        ))}
                      </div>
                      <FieldError id="pb-budget-error" message={errors.budget} />
                    </fieldset>
                    <fieldset className="pb-sub">
                      <legend className="pb-label">When do you need it?</legend>
                      <div className="pb-pills">
                        {inquiry.timelines.map((timeline, i) => (
                          <Pill key={timeline} name="timeline" value={timeline} checked={values.timeline === timeline} onChange={update} error={errors.timeline} index={i}>
                            {timeline}
                          </Pill>
                        ))}
                      </div>
                      <FieldError id="pb-timeline-error" message={errors.timeline} />
                    </fieldset>
                  </div>
                ) : (
                  <div className="pb-group">
                    <h3 ref={headingRef} className="pb-q" tabIndex={-1}>
                      Last step: about you
                    </h3>
                    <div className="pb-fields">
                      <div className="field">
                        <label htmlFor="pb-name">Name</label>
                        <input type="text" autoComplete="name" required {...field('name')} />
                        <FieldError id="pb-name-error" message={errors.name} />
                      </div>
                      <div className="field">
                        <label htmlFor="pb-email">Email</label>
                        <input type="email" autoComplete="email" inputMode="email" required {...field('email')} />
                        <FieldError id="pb-email-error" message={errors.email} />
                      </div>
                      <div className="field pb-wide">
                        <label htmlFor="pb-organization">
                          Business or organization <span className="pb-optional">optional</span>
                        </label>
                        <input type="text" autoComplete="organization" {...field('organization')} />
                      </div>
                      <div className="field pb-wide">
                        <label htmlFor="pb-details">Tell me about it</label>
                        <textarea rows="4" required placeholder={service?.prompt} {...field('details')} />
                        <FieldError id="pb-details-error" message={errors.details} />
                      </div>
                      <div className="field-honeypot" aria-hidden="true">
                        <label htmlFor="pb-website">Website</label>
                        <input type="text" id="pb-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!done && (
                <div className="pb-nav">
                  {step > 0 && (
                    <button type="button" className="btn btn-secondary" onClick={() => goToStep(step - 1)}>
                      <Icon name="chevronLeft" />
                      <span>Back</span>
                    </button>
                  )}
                  <span className="pb-count" aria-hidden="true">
                    {step + 1} / {steps.length}
                  </span>
                  <button ref={sendRef} type="submit" className="btn btn-primary" disabled={sending} aria-busy={sending || undefined}>
                    {last && (sending ? <span className="spinner" aria-hidden="true" /> : <Icon name="send" />)}
                    <span>{last ? (sending ? 'Sending…' : 'Send brief') : nextLabel}</span>
                    {!last && <Icon name="arrowRight" />}
                  </button>
                </div>
              )}
              {last && !done && !ENDPOINT && <p className="form-hint">This opens your email app with the brief ready to send.</p>}

              <div className="form-status" role="status" aria-live="polite">
                {status === 'error' && (
                  <p className="status status-error">
                    Sorry, the brief could not be sent. Please try again, or email me directly at{' '}
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>.
                  </p>
                )}
              </div>
            </form>

            <Ticket values={values} service={service} currency={currency} briefId={briefId} stamped={status === 'sent'} />
          </div>
        </div>
      )}
    </dialog>
  );
}

function Pill({ name, value, checked, onChange, error, index, children }) {
  return (
    <label className={`pb-pill${checked ? ' is-on' : ''}`} style={{ '--i': index }}>
      <input
        type="radio"
        className="pb-input"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        aria-describedby={error ? `pb-${name}-error` : undefined}
      />
      {children}
    </label>
  );
}

const ticketRows = (values, service, currency) => [
  ['Project', service?.label],
  ['Features', values.features.join(' · ')],
  ['Budget', budgetById(values.budget)?.[currency]],
  ['Timeline', values.timeline],
  ['Client', [values.name.trim(), values.organization.trim()].filter(Boolean).join(', ')],
];

// The brief as a ticket: each answer inks in on its line as it's given.
function Ticket({ values, service, currency, briefId, stamped }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <aside className={`pb-ticket${stamped ? ' is-stamped' : ''}`} aria-label="Your brief so far">
      <div className="pb-paper">
        <header className="pb-t-head">
          <p className="pb-t-kicker">
            <span className="pb-led" aria-hidden="true" />
            {stamped ? 'Sent' : 'Drafting'}
          </p>
          <p className="pb-t-id">
            <DecodeText key={briefId} text={briefId} duration={900} />
          </p>
          <p className="pb-t-meta">
            {today} · for {profile.name.split(' ')[0]}
          </p>
        </header>
        <dl className="pb-t-rows">
          {ticketRows(values, service, currency).map(([label, value]) => (
            <div key={label} className="pb-t-row">
              <dt>{label}</dt>
              <dd>
                {value ? (
                  <span key={value} className="pb-t-value">
                    {value}
                  </span>
                ) : (
                  <span className="pb-t-empty">
                    <span className="visually-hidden">Not filled in yet</span>
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <footer className="pb-t-foot">
          <Barcode code={briefId} />
          <p>
            <span>Reply</span>
            <span>{inquiry.replyTime}</span>
          </p>
        </footer>
        {stamped && (
          <span className="pb-stamp" aria-hidden="true">
            Received
          </span>
        )}
      </div>
    </aside>
  );
}

// Narrow screens: the ticket waits until the brief is sent, and this strip
// keeps the answers in view instead.
function MiniBrief({ values, service, currency, briefId }) {
  const count = values.features.length;
  const chips = [
    service?.label,
    count > 0 && `${count} feature${count === 1 ? '' : 's'}`,
    budgetById(values.budget)?.[currency],
    values.timeline,
  ].filter(Boolean);
  return (
    <p className="pb-mini" aria-hidden="true">
      <span className="pb-mini-id">{briefId}</span>
      {chips.length ? chips.map((chip) => <span key={chip} className="pb-mini-chip">{chip}</span>) : <span>Your brief fills in as you go</span>}
    </p>
  );
}

// Decorative bars drawn from the brief's reference, so every brief gets its own.
function Barcode({ code }) {
  const bars = [];
  let x = 0;
  for (const ch of `*${code}*`) {
    const n = ch.charCodeAt(0);
    for (let i = 0; i < 3; i += 1) {
      const width = ((n >> (i * 2)) & 3) + 1;
      bars.push({ x, width });
      x += width + 1 + ((n >> i) & 1);
    }
  }
  return (
    <svg className="pb-barcode" viewBox={`0 0 ${x} 24`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y="0" width={bar.width} height="24" />
      ))}
    </svg>
  );
}
