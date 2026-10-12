import { useEffect, useMemo, useRef, useState } from 'react';
import { confetti } from '../../lib/confetti';
import { Icon } from '../ui/Icon';

// A working replica of OJTrack's attendance flow, with two phones side by side:
// the trainee verifies with an emailed one-time PIN and generates a one-time QR
// code that expires; the supervisor scans it. Scanning the same code twice is
// refused, as in the real app. Sample data only; nothing leaves the page.
const LIFETIME = 30; // seconds a code stays valid
const STEPS = ['Verify with an emailed OTP', 'Generate a one-time QR code', 'Supervisor scans it', 'Trainee is timed in'];
const STEP_OF = { start: 0, otp: 0, ready: 1, qr: 2, scanning: 2, in: 3, reused: 3, expired: 1 };
const ANNOUNCE = {
  start: 'Ready. Send an OTP to begin.',
  otp: 'OTP sent to the trainee’s email.',
  ready: 'OTP entered. Generate the QR code.',
  qr: `QR code generated. It works once and expires in ${LIFETIME} seconds.`,
  scanning: 'Supervisor is scanning the code.',
  in: 'Scanned. The trainee is timed in.',
  reused: 'Refused: this code was already used.',
  expired: 'The code expired before it was scanned. Start again.',
};

// 21×21 grid in the shape of a QR code (three finder squares and timing lines),
// filled from a seeded random generator. A look-alike for the demo, not a real code.
function qrCells(seed) {
  let state = seed;
  const random = () => ((state = (state * 1103515245 + 12345) % 2147483648) / 2147483648);
  const corners = [
    [0, 0],
    [0, 14],
    [14, 0],
  ];
  const cells = [];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      const corner = corners.find(([r0, c0]) => r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7);
      let dark;
      let finder = false;
      if (corner) {
        const rr = r - corner[0];
        const cc = c - corner[1];
        const inside = rr >= 0 && rr <= 6 && cc >= 0 && cc <= 6;
        dark = inside && (rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4));
        finder = true;
      } else if (r === 6 || c === 6) {
        dark = (r + c) % 2 === 0;
      } else {
        dark = random() > 0.52;
      }
      if (dark) cells.push({ r, c, delay: finder ? 0 : 0.1 + random() * 0.55 });
    }
  }
  return cells;
}

function QrCode({ seed, className = '' }) {
  const cells = useMemo(() => qrCells(seed), [seed]);
  return (
    <svg className={`qr ${className}`} viewBox="0 0 25 25" aria-hidden="true" focusable="false">
      <rect width="25" height="25" fill="#fff" rx="1" />
      {cells.map(({ r, c, delay }) => (
        <rect key={`${r}-${c}`} x={c + 2} y={r + 2} width="1.02" height="1.02" style={{ '--d': `${delay}s` }} />
      ))}
    </svg>
  );
}

const clock = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const today = () => new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
// Like the real app, the greeting follows the time of day.
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

// The app's bottom navigation, so the mock-ups read as real screens.
function TabBar({ tabs }) {
  return (
    <div className="phone-tabs" aria-hidden="true">
      {tabs.map((tab, i) => (
        <span key={tab} className={i === 0 ? 'is-active' : ''}>
          <i />
          {tab}
        </span>
      ))}
    </div>
  );
}

export function OjtrackDemo() {
  const [stage, setStage] = useState('start');
  const [otp, setOtp] = useState('');
  const [left, setLeft] = useState(LIFETIME);
  const [seed, setSeed] = useState(7);
  const [timeIn, setTimeIn] = useState('');
  const traineeRef = useRef(null);
  const phonesRef = useRef(null);
  const code = useRef('');

  // On narrow screens the phones are a swipeable strip: bring the phone that
  // needs attention into view (the supervisor's once there is a code to scan).
  useEffect(() => {
    const strip = phonesRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth + 4) return;
    const supervisorTurn = stage === 'qr' || stage === 'scanning' || stage === 'reused';
    const target = supervisorTurn ? strip.lastElementChild : strip.firstElementChild;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    strip.scrollTo({
      left: target.offsetLeft - (strip.clientWidth - target.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [stage]);

  // Type the emailed OTP into the boxes, one digit at a time.
  useEffect(() => {
    if (stage !== 'otp') return;
    let typed = 0;
    const id = setInterval(() => {
      typed += 1;
      setOtp(code.current.slice(0, typed));
      if (typed >= code.current.length) {
        clearInterval(id);
        setStage('ready');
      }
    }, 160);
    return () => clearInterval(id);
  }, [stage]);

  // The QR code counts down and expires if nobody scans it.
  useEffect(() => {
    if (stage !== 'qr') return;
    let remaining = LIFETIME;
    const id = setInterval(() => {
      remaining -= 1;
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        setStage('expired');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  // Scanning takes a moment; a reused code shows its error, then the screen settles.
  useEffect(() => {
    if (stage !== 'scanning' && stage !== 'reused') return;
    const id = setTimeout(
      () => {
        if (stage === 'scanning') {
          setTimeIn(clock());
          setStage('in');
          const box = traineeRef.current?.getBoundingClientRect();
          if (box) confetti({ origin: { x: box.left + box.width / 2, y: box.top + box.height * 0.4 }, count: 70 });
        } else {
          setStage('in');
        }
      },
      stage === 'scanning' ? 1500 : 2200,
    );
    return () => clearTimeout(id);
  }, [stage]);

  const sendOtp = () => {
    code.current = String(Math.floor(100000 + Math.random() * 900000));
    setOtp('');
    setStage('otp');
  };
  const generate = () => {
    setSeed((value) => value + 1);
    setLeft(LIFETIME);
    setStage('qr');
  };
  const reset = () => {
    setOtp('');
    setTimeIn('');
    setStage('start');
  };

  const step = STEP_OF[stage];
  const hasCode = stage === 'qr' || stage === 'scanning';

  return (
    <div className="demo ojt-demo">
      <div className="demo-intro">
        <p className="demo-kicker">
          <span className="demo-logo">OJ</span> OJTrack · QR attendance
        </p>
        <h3 className="demo-title">Time a trainee in</h3>
        <p className="demo-text">
          The trainee proves it’s them with an emailed one-time PIN, shows a QR code that works once and expires, and
          the supervisor scans it. Try scanning the same code twice, or let it expire.
        </p>
        <ol className="demo-steps">
          {STEPS.map((label, i) => (
            <li key={label} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
              <span className="demo-step-dot">{i < step ? <Icon name="check" size={13} /> : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <p className="demo-status" role="status">
          {ANNOUNCE[stage]}
        </p>
        <button type="button" className="text-link demo-reset" onClick={reset}>
          <Icon name="rotate" size={15} /> Start over
        </button>
      </div>

      <div className="demo-phones" ref={phonesRef}>
        {/* Trainee's phone */}
        <figure className="phone" ref={traineeRef}>
          <figcaption className="phone-label">Trainee</figcaption>
          <div className="phone-screen">
            <div className="phone-top">
              <span className="phone-avatar" aria-hidden="true">
                T
              </span>
              <span>
                <b>{greeting()}, Trainee</b>
                <small>{today()}</small>
              </span>
            </div>

            <div className="phone-body">
              {(stage === 'start' || stage === 'otp' || stage === 'ready') && (
                <div className="phone-card" key="verify">
                  <p className="phone-card-title">Today’s attendance</p>
                  {stage === 'start' ? (
                    <>
                      <p className="phone-small">Verify with a one-time PIN to get your QR code.</p>
                      <button type="button" className="phone-btn" onClick={sendOtp}>
                        Send OTP to my email
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="phone-small">Enter the code sent to t••••@gmail.com</p>
                      <div className="otp" aria-label={`One-time PIN ${otp.split('').join(' ')}`}>
                        {Array.from({ length: 6 }, (_, i) => (
                          <span key={i} className={otp[i] ? 'is-filled' : ''}>
                            {otp[i] ?? ''}
                          </span>
                        ))}
                      </div>
                      <button type="button" className="phone-btn" onClick={generate} disabled={stage !== 'ready'}>
                        Generate QR code
                      </button>
                    </>
                  )}
                </div>
              )}

              {(hasCode || stage === 'expired') && (
                <div className={`phone-card qr-card${stage === 'expired' ? ' is-expired' : ''}`} key={`qr-${seed}`}>
                  <div className="qr-wrap">
                    <QrCode seed={seed} className="is-assembling" />
                    {stage === 'expired' && <span className="qr-stamp">Expired</span>}
                  </div>
                  {stage === 'expired' ? (
                    <button type="button" className="phone-btn" onClick={reset}>
                      Get a new code
                    </button>
                  ) : (
                    <p className="qr-timer">
                      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <circle cx="10" cy="10" r="8" pathLength="1" style={{ '--left': left / LIFETIME }} />
                      </svg>
                      Single use · expires in 0:{String(left).padStart(2, '0')}
                    </p>
                  )}
                </div>
              )}

              {(stage === 'in' || stage === 'reused') && (
                <div className="phone-card timed-in" key="in">
                  <span className="big-check" aria-hidden="true">
                    <Icon name="check" size={30} />
                  </span>
                  <p className="phone-card-title">Timed in · {timeIn}</p>
                  <p className="phone-small">Have a good shift!</p>
                  <div className="week" aria-hidden="true">
                    {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                      <span key={i} className={i < 4 ? 'is-present' : 'is-today'}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <p className="phone-small">Total hours · 312h 45m</p>
                </div>
              )}
            </div>
            <TabBar tabs={['Home', 'Report', 'QR Code', 'Profile']} />
          </div>
        </figure>

        {/* Supervisor's phone */}
        <figure className={`phone is-supervisor${stage === 'reused' ? ' is-refused' : ''}`}>
          <figcaption className="phone-label">Supervisor</figcaption>
          <div className="phone-screen">
            <div className="phone-top">
              <span className="phone-avatar" aria-hidden="true">
                S
              </span>
              <span>
                <b>Daily scanning</b>
                <small>Point the camera at a code</small>
              </span>
            </div>
            <div className="phone-body">
              <div className={`viewfinder is-${stage}`}>
                <span className="vf-corner tl" />
                <span className="vf-corner tr" />
                <span className="vf-corner bl" />
                <span className="vf-corner br" />
                {hasCode && <QrCode seed={seed} className="in-view" />}
                {stage === 'scanning' && <span className="laser" />}
                {stage === 'in' && (
                  <span className="vf-result is-ok">
                    <Icon name="check" size={26} />
                  </span>
                )}
                {stage === 'reused' && (
                  <span className="vf-result is-bad">
                    <Icon name="close" size={26} />
                  </span>
                )}
                {!hasCode && stage !== 'in' && stage !== 'reused' && <span className="vf-wait">Waiting for a code…</span>}
              </div>

              {stage === 'in' && (
                <p className="scan-row">
                  <Icon name="check" size={14} /> Trainee timed in · {timeIn}
                </p>
              )}
              {stage === 'reused' && <p className="scan-row is-bad">Code already used. Ask for a new one.</p>}

              {stage === 'in' || stage === 'reused' ? (
                <button type="button" className="phone-btn is-ghost" onClick={() => setStage('reused')} disabled={stage === 'reused'}>
                  Scan the same code again
                </button>
              ) : (
                <button type="button" className="phone-btn" onClick={() => setStage('scanning')} disabled={stage !== 'qr'}>
                  {stage === 'scanning' ? 'Scanning…' : 'Scan code'}
                </button>
              )}
            </div>
            <TabBar tabs={['Home', 'Report', 'Trainees', 'Profile']} />
          </div>
        </figure>
      </div>
    </div>
  );
}
