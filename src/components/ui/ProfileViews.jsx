import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { loadViews, refreshViews } from '../../lib/views';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const REFRESH_AFTER = 15_000; // ms; opening the card fetches fresh numbers at most this often

const withCommas = (n) => n.toLocaleString('en-US');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const dayName = (date, options) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...options });

// Digits on reels that roll into place, like a car's odometer. `places` keeps
// the number of reels steady while the value rolls up from zero.
function Odometer({ value, places = 1 }) {
  const count = Math.max(places, String(value).length);
  const parts = [];
  for (let place = count - 1; place >= 0; place -= 1) {
    const digit = Math.floor(value / 10 ** place) % 10;
    parts.push(
      <span key={place} className="odo-digit">
        <span className="odo-reel" style={{ '--d': digit, '--p': place }}>
          {DIGITS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </span>
      </span>,
    );
    if (place > 0 && place % 3 === 0) parts.push(<span key={`comma-${place}`}>,</span>);
  }
  return (
    <span className="odo">
      <span className="odo-reels" aria-hidden="true">
        {parts}
      </span>
      <span className="visually-hidden">{withCommas(value)}</span>
    </span>
  );
}

// "👁 1,234 profile views" in the hero. The number rolls up when the page loads;
// if this visit was just counted, a "+1" pops and the last digit ticks over.
// The eye follows the cursor. Hover, click or tap opens a card with unique
// visitors, today's views and the last 7 days. Hidden until the counter
// (api/views.js) answers, and stays hidden if it can't.
export function ProfileViews() {
  const [stats, setStats] = useState(null);
  const [shown, setShown] = useState(0);
  const [places, setPlaces] = useState(1);
  const [mine, setMine] = useState(null); // this visitor's view number
  const [plus, setPlus] = useState(0); // bumped to play the "+1"
  const [blink, setBlink] = useState(0); // bumped to make the eye blink
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(null); // index of the chart bar being pointed at
  const rootRef = useRef(null);
  const chipRef = useRef(null);
  const isOpen = useRef(false);
  const pinned = useRef(false); // opened by a click or tap, so leaving with the mouse doesn't close it
  const hoverTimer = useRef(0);
  const lastRefresh = useRef(0);
  const cardId = useId();

  // Load the numbers (counting this visit), then roll up from zero.
  useEffect(() => {
    let active = true;
    const timers = [];
    loadViews().then((data) => {
      if (!active || !data) return;
      lastRefresh.current = Date.now();
      setStats(data);
      setPlaces(String(data.views).length);
      if (data.counted) setMine(data.views);
      if (reducedMotion()) {
        setShown(data.views);
        return;
      }
      timers.push(setTimeout(() => setShown(data.counted ? Math.max(data.views - 1, 0) : data.views), 80));
      if (data.counted) {
        timers.push(
          setTimeout(() => {
            setShown(data.views);
            setPlus((n) => n + 1);
            setBlink((n) => n + 1);
          }, 1700),
        );
      }
    });
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  // The pupil looks toward the cursor while the chip is on screen.
  const ready = stats !== null;
  useEffect(() => {
    const chip = chipRef.current;
    if (!ready || !chip || !finePointer() || reducedMotion()) return;
    let frame = 0;
    let visible = true;
    let last = null;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(chip);
    const look = () => {
      frame = 0;
      const eye = chip.querySelector('.pv-eye');
      if (!eye || !last) return;
      const box = eye.getBoundingClientRect();
      const dx = last.clientX - (box.left + box.width / 2);
      const dy = last.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(distance / 80, 1) * 2.4;
      chip.style.setProperty('--px', `${((dx / distance) * reach).toFixed(2)}px`);
      chip.style.setProperty('--py', `${((dy / distance) * reach).toFixed(2)}px`);
    };
    const onMove = (event) => {
      last = event;
      if (visible && !frame) frame = requestAnimationFrame(look);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [ready]);

  const show = () => {
    if (!isOpen.current) {
      isOpen.current = true;
      setOpen(true);
      setBlink((n) => n + 1);
    }
    if (Date.now() - lastRefresh.current < REFRESH_AFTER) return;
    lastRefresh.current = Date.now();
    refreshViews().then((data) => {
      if (!data) return;
      setStats(data);
      setShown((current) => Math.max(current, data.views));
      setPlaces((current) => Math.max(current, String(data.views).length));
    });
  };

  const hide = useCallback(() => {
    isOpen.current = false;
    pinned.current = false;
    setOpen(false);
    setDay(null);
  }, []);

  // While open: a click outside or Escape closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      if (!rootRef.current?.contains(event.target)) hide();
    };
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      hide();
      chipRef.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, hide]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  if (!stats) return null;

  const today = stats.days.at(-1)?.views ?? 0;
  const busiest = Math.max(1, ...stats.days.map((d) => d.views));
  const picked = day === null ? null : stats.days[day];
  const chartLabel = `Views over the last 7 days: ${stats.days.map((d) => `${dayName(d.date, { weekday: 'long' })} ${d.views}`).join(', ')}`;

  return (
    <div
      ref={rootRef}
      className="pv"
      data-open={open || undefined}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return;
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(show, 120);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return;
        clearTimeout(hoverTimer.current);
        if (!pinned.current) hoverTimer.current = setTimeout(hide, 220);
      }}
    >
      <button
        ref={chipRef}
        type="button"
        className="pv-chip"
        aria-expanded={open}
        aria-controls={cardId}
        onClick={() => {
          clearTimeout(hoverTimer.current);
          if (open && pinned.current) {
            hide();
          } else {
            pinned.current = true;
            show();
          }
        }}
      >
        <svg key={`blink-${blink}`} className={`pv-eye${blink ? ' is-blink' : ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle className="pv-pupil" cx="12" cy="12" r="3" />
        </svg>
        <span className="pv-count">
          <Odometer value={shown} places={places} />
        </span>
        <span className="pv-label">profile {shown === 1 ? 'view' : 'views'}</span>
        {plus > 0 && (
          <span key={`plus-${plus}`} className="pv-plus" aria-hidden="true">
            +1
          </span>
        )}
      </button>

      <div id={cardId} className="pv-card" aria-label="Profile views" role="group" inert={!open}>
        <div className="pv-card-head">
          <p className="pv-card-title">Profile views</p>
          <span className="pv-live">
            <span className="status-dot" aria-hidden="true" />
            Live
          </span>
        </div>
        <p className="pv-total">
          <Odometer value={open || reducedMotion() ? stats.views : 0} places={String(stats.views).length} />
        </p>
        <dl className="pv-facts">
          <div>
            <dt>Unique visitors</dt>
            <dd>{withCommas(stats.visitors)}</dd>
          </div>
          <div>
            <dt>Today</dt>
            <dd>{withCommas(today)}</dd>
          </div>
        </dl>
        <div className="pv-chart" role="img" aria-label={chartLabel}>
          {stats.days.map((d, i) => (
            <span
              key={d.date}
              className={`pv-bar${i === stats.days.length - 1 ? ' is-today' : ''}${day === i ? ' is-picked' : ''}`}
              style={{ '--h': d.views / busiest, '--i': i }}
              onPointerEnter={(event) => event.pointerType === 'mouse' && setDay(i)}
              onPointerLeave={(event) => event.pointerType === 'mouse' && setDay(null)}
              onClick={() => setDay((current) => (current === i ? null : i))}
            >
              <span className="pv-bar-fill" />
              <span className="pv-bar-day">{i === stats.days.length - 1 ? 'Today' : dayName(d.date, { weekday: 'narrow' })}</span>
            </span>
          ))}
        </div>
        <p className="pv-caption" aria-hidden="true">
          {picked
            ? `${dayName(picked.date, { weekday: 'short', month: 'short', day: 'numeric' })}: ${withCommas(picked.views)} ${picked.views === 1 ? 'view' : 'views'}`
            : 'Last 7 days'}
        </p>
        {mine !== null && <p className="pv-mine">You’re view #{withCommas(mine)}. Thanks for stopping by!</p>}
        <p className="pv-note">Counted anonymously: no names, no tracking.</p>
      </div>
    </div>
  );
}
