import { useEffect, useRef, useState } from 'react';
import { confetti } from '../../lib/confetti';
import { Icon } from '../ui/Icon';

// A working replica of PRimeSys's request tracker: one purchase request moving
// desk to desk. Each step records who acted and when, hands the request to the
// next office (with a live notification), and prints that stage's form.
// Stages and forms follow the live site; the request itself is sample data.
const STAGES = [
  { label: 'Submitted', status: 'With the TWG', holder: 'Technical Working Group', activity: 'Submitted to the TWG', actor: 'End User', form: 'Purchase Request', hours: 0 },
  { label: 'TWG review', status: 'Approved by TWG', holder: 'Procurement Office', activity: 'Approved, review certificate issued', actor: 'TWG', form: 'TWG review certificate', hours: 29 },
  { label: 'Canvass (RFQ)', status: 'Out for canvass', holder: 'Bids and Awards Committee', activity: 'PR number assigned, RFQ printed', actor: 'Procurement', form: 'Request for Quotation', hours: 22 },
  { label: 'TWG evaluation', status: 'Offers certified', holder: 'Bids and Awards Committee', activity: 'Quotations entered; offers certified compliant', actor: 'BAC · TWG', form: 'TWG certificate on the offers', hours: 51 },
  { label: 'BAC award', status: 'Awarded', holder: 'Procurement Office', activity: 'Lot awarded to the lowest compliant supplier', actor: 'BAC', form: 'Notice of Award', hours: 26 },
  { label: 'Purchase order', status: 'PO issued', holder: 'Supply Office', activity: 'Purchase order issued to the supplier', actor: 'Procurement', form: 'Purchase Order', hours: 23 },
  { label: 'Delivered', status: 'Delivered', holder: 'Archive', activity: 'All items delivered; request closed', actor: 'Supply', form: null, hours: 70 },
];
const LAST = STAGES.length - 1;
const START = new Date(2026, 9, 1, 9, 12); // Oct 1, 9:12 AM

const stampFor = (index) => {
  const hours = STAGES.slice(0, index + 1).reduce((sum, stage) => sum + stage.hours, 0);
  return new Date(START.getTime() + hours * 3600_000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
const initials = (name) =>
  name
    .split(' ')
    .filter((word) => /^[A-Z]/.test(word))
    .map((word) => word[0])
    .join('')
    .slice(0, 3);

export function PrimesysDemo() {
  const [stage, setStage] = useState(0); // index of the latest completed status
  const [playing, setPlaying] = useState(false);
  const cardRef = useRef(null);

  // Everything else (the live flash, the notification toast) is keyed on the
  // stage, so each step simply re-mounts and replays them.
  const advance = () => setStage((current) => Math.min(current + 1, LAST));

  const done = stage === LAST;
  const isPlaying = playing && !done;

  // "Play all" steps through the rest of the stages.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setTimeout(() => setStage((current) => Math.min(current + 1, LAST)), 1300);
    return () => clearTimeout(id);
  }, [isPlaying, stage]);

  // A small celebration when the request is delivered.
  useEffect(() => {
    if (stage !== LAST) return;
    const box = cardRef.current?.getBoundingClientRect();
    if (box) confetti({ origin: { x: box.left + box.width / 2, y: box.top + 60 }, count: 80 });
  }, [stage]);

  const reset = () => {
    setPlaying(false);
    setStage(0);
  };

  const current = STAGES[stage];
  const log = STAGES.slice(0, stage + 1)
    .map((entry, index) => ({ ...entry, when: stampFor(index), index }))
    .reverse();
  const forms = STAGES.slice(0, stage + 1).filter((entry) => entry.form);

  return (
    <div className="demo ps-demo">
      <div className="demo-intro">
        <p className="demo-kicker">
          <span className="demo-logo is-ps">PR</span> PRimeSys · request tracker
        </p>
        <h3 className="demo-title">Follow a purchase request</h3>
        <p className="demo-text">
          One record moves from desk to desk. Each step is timestamped, the next office is notified live, and the form
          that stage needs prints from the record.
        </p>
        <div className="demo-controls">
          <button type="button" className="btn btn-primary btn-sm" onClick={advance} disabled={done}>
            Next stage <Icon name="arrowRight" size={15} />
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPlaying(true)} disabled={done || isPlaying}>
            {isPlaying ? 'Playing…' : 'Play all'}
          </button>
          <button type="button" className="text-link demo-reset" onClick={reset}>
            <Icon name="rotate" size={15} /> Reset
          </button>
        </div>
        <p className="demo-status" role="status">
          {done
            ? 'Delivered. The request is closed and archived.'
            : `${stage === 0 ? 'Request submitted' : `${current.label} complete`}. Now with the ${current.holder}.`}
        </p>
      </div>

      <div className="ps-card" ref={cardRef}>
        <div className="ps-bar">
          <span>
            My Requests <span aria-hidden="true">/</span> <b>Request details</b>
          </span>
          <span className="ps-live" key={stage}>
            <span className="status-dot" aria-hidden="true" /> Updated live
          </span>
        </div>

        <div className="ps-head">
          <div>
            <p className="ps-pr">{stage >= 2 ? 'PR No. 2026-10-0142' : 'PR No. given at canvass'}</p>
            <p className="ps-title">Printer toner and bond paper</p>
            <p className="ps-meta">Registrar · Q4 2026 · 6 items</p>
          </div>
          <div className="ps-amount">
            <span className={`ps-pill${done ? ' is-done' : ''}`} key={current.status}>
              {current.status}
            </span>
            <b>₱48,250.00</b>
          </div>
        </div>

        <ol className="ps-steps" style={{ '--progress': stage / LAST }}>
          {STAGES.map((entry, index) => (
            <li
              key={entry.label}
              className={index <= stage ? 'is-done' : index === stage + 1 ? 'is-current' : ''}
              aria-current={index === stage + 1 ? 'step' : undefined}
            >
              <span className="ps-dot">{index <= stage ? <Icon name="check" size={13} /> : index + 1}</span>
              <span className="ps-step-label">{entry.label}</span>
            </li>
          ))}
        </ol>

        <div className="ps-grid">
          <div className={`ps-holder${done ? ' is-done' : ''}`}>
            <span className="ps-avatar" key={current.holder}>
              {done ? <Icon name="check" size={16} /> : initials(current.holder)}
            </span>
            <span>
              <small>{done ? 'Closed' : 'Who has it now'}</small>
              <b key={current.holder}>{current.holder}</b>
            </span>
          </div>

          <div className="ps-forms">
            <small>Forms printed from the record</small>
            <ul role="list">
              {forms.map((entry) => (
                <li key={entry.form}>
                  <Icon name="download" size={13} /> {entry.form}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ps-activity">
          <small>Activity</small>
          <ul role="list">
            {log.map((entry) => (
              <li key={entry.index}>
                <span className="ps-activity-dot" aria-hidden="true" />
                <span className="ps-activity-text">{entry.activity}</span>
                <span className="ps-activity-meta">
                  {entry.actor} · {entry.when}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Live notification to whoever now has the request; it fades out by itself (CSS). */}
        <div className="ps-toasts" aria-hidden="true">
          {stage > 0 && (
            <p key={stage} className="ps-toast">
              <Icon name="bell" size={15} /> {done ? 'Request closed and archived' : `${current.holder} notified`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
