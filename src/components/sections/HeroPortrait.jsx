import { useCallback, useEffect, useRef, useState } from 'react';
import graduation from '../../assets/images/portrait-graduation.webp';
import graduationSm from '../../assets/images/portrait-graduation-480.webp';
import portrait from '../../assets/images/portrait.webp';
import portraitSm from '../../assets/images/portrait-480.webp';
import { education, profile } from '../../content/profile';

const sizes = '(max-width: 760px) 140px, 360px';
const DURATION = 900;
const EASING = 'cubic-bezier(0.45, 0.05, 0.2, 1)';
const DIRECTIONS = 8; // like the points of a compass star
const SIDEWAYS = [0, 1];
const SWIPE_MIN = 24; // px of finger travel before a touch counts as a swipe

// The axis the card turns over on for a direction (dx, dy): snapped to one of
// eight directions, and perpendicular to it, so the edge or corner in that
// direction tips away and the card turns over that way.
function axisFromVector(dx, dy) {
  const step = (2 * Math.PI) / DIRECTIONS;
  const angle = Math.round(Math.atan2(dy, dx) / step) * step;
  return [-Math.sin(angle), Math.cos(angle)].map((n) => Number(n.toFixed(4)) || 0);
}

// For a click: the direction from the card's centre to the clicked spot.
// Keyboard presses and clicks near the middle turn it over sideways.
function axisForClick(event, box) {
  if (event.detail === 0) return SIDEWAYS;
  const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
  const dy = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
  return Math.hypot(dx, dy) < 0.2 ? SIDEWAYS : axisFromVector(dx, dy);
}

const turn = ([x, y], degrees) => `rotate3d(${x}, ${y}, 0, ${degrees}deg)`;

// Hero photo card: the framed portrait on one side, the framed graduation photo
// on the other. Click a side or corner (or swipe on a phone) and it turns over
// that way; it cross-fades for reduced motion. Only the side that is showing is
// exposed to screen readers. The command palette can flip it too ("portfolio:flip").
export function HeroPortrait() {
  const [side, setSide] = useState('front');
  const [touched, setTouched] = useState(false);
  const sideRef = useRef('front');
  const cardRef = useRef(null);
  const liftRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const running = useRef(null);
  const swipe = useRef(null);
  const ignoreClick = useRef(false);

  const flip = useCallback((axis) => {
    setTouched(true);

    // Flipped again mid-turn: send the card back the way it came.
    if (running.current) {
      running.current.reverse();
      sideRef.current = sideRef.current === 'front' ? 'back' : 'front';
      setSide(sideRef.current);
      return;
    }

    const from = sideRef.current;
    sideRef.current = from === 'front' ? 'back' : 'front';
    setSide(sideRef.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const leaving = from === 'front' ? frontRef.current : backRef.current;
    const arriving = from === 'front' ? backRef.current : frontRef.current;

    // Pre-turn the hidden side on the same axis, so it lands upright whatever
    // the direction of this turn and the ones before it.
    arriving.style.transform = turn(axis, 180);

    const animation = cardRef.current.animate([{ transform: turn(axis, 0) }, { transform: turn(axis, 180) }], {
      duration: DURATION,
      easing: EASING,
      fill: 'forwards',
    });
    running.current = animation;

    // The card rises slightly as it turns and settles back, like a print being turned over.
    liftRef.current.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.05)', offset: 0.45 }, { transform: 'scale(1)' }],
      { duration: DURATION, easing: EASING },
    );

    animation.finished
      .then(() => {
        running.current = null;
        // Finished forwards: make the arrived side the resting front, all in the
        // same frame so nothing moves on screen. Reversed: nothing changed.
        if (animation.playbackRate > 0) {
          arriving.style.transform = 'none';
          leaving.style.transform = turn(axis, 180);
        }
        animation.cancel();
      })
      .catch(() => {
        running.current = null;
      });
  }, []);

  useEffect(() => {
    const onFlip = () => flip(SIDEWAYS);
    window.addEventListener('portfolio:flip', onFlip);
    return () => window.removeEventListener('portfolio:flip', onFlip);
  }, [flip]);

  // Touch: a swipe flips the card in the swipe's direction; a tap is a click.
  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse') swipe.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < SWIPE_MIN) return;
    ignoreClick.current = true;
    setTimeout(() => (ignoreClick.current = false), 400);
    flip(axisFromVector(dx, dy));
  };

  const onClick = (event) => {
    if (ignoreClick.current) return;
    flip(axisForClick(event, event.currentTarget.getBoundingClientRect()));
  };

  const flipped = side === 'back';

  return (
    <figure className="hero-portrait">
      <div className="portrait-card" data-tilt>
        <button
          type="button"
          className="flip-toggle"
          aria-pressed={flipped}
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
          title="Click any side or corner to flip it that way"
          data-cursor="Flip"
        >
          <span className="visually-hidden">Flip photo</span>
        </button>
        <div className="flip-lift" ref={liftRef}>
          <div ref={cardRef} className={`flip${flipped ? ' is-flipped' : ''}${touched ? ' was-flipped' : ''}`}>
            <div ref={frontRef} className="portrait-face flip-front" aria-hidden={flipped || undefined}>
              <img
                src={portrait}
                srcSet={`${portraitSm} 480w, ${portrait} 720w`}
                sizes={sizes}
                width="720"
                height="900"
                alt={`Portrait of ${profile.name} in a suit and tie`}
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div ref={backRef} className="portrait-face flip-back" aria-hidden={!flipped || undefined}>
              <img
                src={graduation}
                srcSet={`${graduationSm} 480w, ${graduation} 720w`}
                sizes={sizes}
                width="720"
                height="900"
                alt={`Graduation photo of ${profile.name} in a black toga and a green, orange and yellow hood with the university seal, holding a graduation cap`}
                decoding="async"
              />
            </div>
          </div>
        </div>
        <span className="crop crop-tl" aria-hidden="true" />
        <span className="crop crop-br" aria-hidden="true" />
      </div>
      <figcaption className="portrait-caption">
        {flipped ? (
          <>
            <span>Graduation day</span>
            <span>{education.graduated}</span>
          </>
        ) : (
          <>
            <span>BS Information Technology</span>
            <span>Class of 2026</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
