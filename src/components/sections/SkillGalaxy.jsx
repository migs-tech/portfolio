import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { skillHubs, skillLinks } from '../../content/profile';
import { Reveal } from '../ui/Section';

// Skill galaxy (skillLinks in profile.js): each project is a star, the skills
// used only there are planets orbiting it, and skills used in more than one
// project are bright stars linked to each of them. Hover or focus a skill to
// light up where it was used; hover a star to light up its skills; click a star
// to open the project. Tapping a skill pins it. Time slows while the pointer is
// over the galaxy and stops on a skill, so everything stays easy to click.
//
// Laid out in a 1100 × 670 box that's scaled to fit. Planets are HTML, which
// the browser moves cheaply; the sky, orbits and links are one canvas; the
// spiral galaxy behind is drawn once and turned by CSS. The script stops while
// the galaxy is off screen (motion.css pauses the CSS animations).
const W = 1100;
const H = 670;
const TAU = Math.PI * 2;
// x, y: the star. rx, ry: its orbit, tilted toward the viewer. period: seconds per orbit.
const SYSTEMS = {
  ojtrack: { x: 225, y: 300, rx: 140, ry: 74, period: 80, color: '#ffc45e' },
  primesys: { x: 865, y: 195, rx: 160, ry: 74, period: 100, color: '#8fb3ff' },
  gothong: { x: 690, y: 535, rx: 240, ry: 90, period: 120, color: '#5ee6c5' },
};
// Skills shared between projects sit between them, in two staggered columns.
const SHARED = { left: 490, right: 580, top: 115, bottom: 375, color: '#eef1ff' };
const STAR_TINTS = ['#ffffff', '#cddcff', '#ffe6c7'];

const hubLabel = (id) => skillHubs.find((hub) => hub.id === id)?.label ?? id;
const skillsOf = (hubId) => Object.keys(skillLinks).filter((skill) => skillLinks[skill].includes(hubId));
const clamp01 = (n) => Math.min(1, Math.max(0, n));
const easeOut = (n) => 1 - (1 - n) ** 3;

function buildGalaxy() {
  const byHub = {};
  const shared = [];
  for (const [skill, hubs] of Object.entries(skillLinks)) {
    if (hubs.length > 1) shared.push({ skill, hubs });
    else (byHub[hubs[0]] ??= []).push(skill);
  }
  // Evenly spaced around their star, each system starting at a different angle.
  const planets = Object.entries(byHub).flatMap(([hub, skills], h) =>
    skills.map((skill, i) => ({ skill, hub, phase: h * 0.9 + (i * TAU) / skills.length })),
  );
  shared.forEach((star, i) => {
    const span = SHARED.bottom - SHARED.top;
    star.x = i % 2 ? SHARED.right : SHARED.left;
    star.y = shared.length === 1 ? SHARED.top + span / 2 : SHARED.top + (span * i) / (shared.length - 1);
  });
  return { planets, shared };
}

// Where a planet is at galaxy time `time` (seconds). `grow` (0–1) spirals it out
// of its star when the galaxy first appears. depth: 0 = far side, 1 = near side.
function orbit(planet, time, grow) {
  const sys = SYSTEMS[planet.hub];
  const angle = planet.phase + (time * TAU) / sys.period - (1 - grow) * 2.4;
  return {
    x: sys.x + Math.cos(angle) * sys.rx * grow,
    y: sys.y + Math.sin(angle) * sys.ry * grow,
    depth: (Math.sin(angle) + 1) / 2,
  };
}

// Seeded random numbers, so the sky looks the same on every visit.
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStars() {
  const rand = seeded(11);
  return Array.from({ length: 320 }, () => {
    const depth = rand() ** 2.2; // most stars are far away: small, dim, barely moving
    const tint = rand() < 0.7 ? 0 : rand() < 0.5 ? 1 : 2;
    return {
      x: rand() * (W + 80) - 40,
      y: rand() * (H + 80) - 40,
      r: 0.45 + depth * 1.35,
      depth,
      alpha: 0.3 + rand() * 0.45 + depth * 0.25,
      rate: 0.6 + rand() * 2.4,
      phase: rand() * TAU,
      tint,
    };
  }).sort((a, b) => a.tint - b.tint);
}

// The spiral galaxy behind everything: a warm core, a faint disc of old stars
// and two arms of young blue stars with pink star-forming clouds.
function drawSpiral(canvas, k) {
  const size = 860;
  const c = size / 2;
  canvas.width = canvas.height = Math.round(size * k);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(k, 0, 0, k, 0, 0);
  const rand = seeded(5);

  const haze = ctx.createRadialGradient(c, c, 0, c, c, c);
  haze.addColorStop(0, 'rgba(255, 230, 190, 0.5)');
  haze.addColorStop(0.07, 'rgba(255, 196, 150, 0.22)');
  haze.addColorStop(0.3, 'rgba(120, 110, 255, 0.07)');
  haze.addColorStop(1, 'rgba(120, 110, 255, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#d9defa';
  for (let i = 0; i < 1400; i += 1) {
    const r = c * 0.9 * Math.sqrt(rand());
    const a = rand() * TAU;
    ctx.globalAlpha = 0.08 + 0.25 * (1 - r / c) * rand();
    ctx.fillRect(c + Math.cos(a) * r, c + Math.sin(a) * r, 1.2, 1.2);
  }

  for (let i = 0; i < 7000; i += 1) {
    const t = rand(); // how far out along the arm
    const r = 16 + t * (c - 30);
    const scatter = (rand() + rand() + rand() - 1.5) * (0.3 - t * 0.12);
    const a = (i % 2) * Math.PI + Math.log(r / 16) * 2.9 + scatter;
    const rr = r * (1 + (rand() - 0.5) * 0.1);
    const cloud = t > 0.25 && rand() < 0.06;
    const s = (cloud ? 1.8 : 0.6 + rand() * 1.1) * (1 - t * 0.35);
    ctx.fillStyle = cloud ? '#ff8fcf' : t < 0.18 ? '#ffe2b8' : rand() < 0.5 ? '#bcd0ff' : '#e7ecff';
    ctx.globalAlpha = (cloud ? 0.75 : 0.55) * (1 - t * 0.65);
    ctx.fillRect(c + Math.cos(a) * rr - s / 2, c + Math.sin(a) * rr - s / 2, s, s);
  }

  const core = ctx.createRadialGradient(c, c, 0, c, c, 46);
  core.addColorStop(0, 'rgba(255, 248, 235, 0.95)');
  core.addColorStop(0.35, 'rgba(255, 214, 160, 0.45)');
  core.addColorStop(1, 'rgba(255, 200, 150, 0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = core;
  ctx.fillRect(c - 46, c - 46, 92, 92);
}

export function SkillGalaxy() {
  const { planets, shared } = useMemo(() => buildGalaxy(), []);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);
  const focus = hover ?? pinned;
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const skyRef = useRef(null);
  const spiralRef = useRef(null);
  const planetRefs = useRef([]);
  const hotRef = useRef({ focus: null, skills: new Set(), hubs: new Set() });
  const repaint = useRef(() => {});

  const hot = { focus, skills: new Set(), hubs: new Set() };
  if (focus?.type === 'skill') {
    hot.skills.add(focus.id);
    skillLinks[focus.id].forEach((hub) => hot.hubs.add(hub));
  } else if (focus?.type === 'hub') {
    hot.hubs.add(focus.id);
    skillsOf(focus.id).forEach((skill) => hot.skills.add(skill));
  }

  // Renders only happen on hover and pin changes; hand them to the animation.
  useEffect(() => {
    hotRef.current = hot;
    repaint.current();
  });

  // The animation: sizing, the sky, orbits, links and the intro, all outside React.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    const sky = skyRef.current;
    const spiral = spiralRef.current;
    const ctx = sky.getContext('2d');
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars = makeStars();
    const meteors = [];
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
    let scale = 0;
    let raf = 0;
    let last = 0;
    let visible = false;
    let introStart = null; // set when the galaxy first scrolls into view
    let time = 0; // galaxy time in seconds; slows down and stops on hover
    let speed = 1;
    let nextMeteor = 2.5;

    const paint = (now) => {
      if (!scale) return;
      const { focus: current, skills: hotSkills, hubs: hotHubs } = hotRef.current;
      const intro = introStart === null ? 0 : motion ? clamp01((now - introStart) / 1800) : 1;

      // Planets: position, size and brightness by depth; the near side passes in front of the star.
      const spots = planets.map((planet, i) => {
        const grow = easeOut(clamp01((intro - 0.15 - i * 0.025) / 0.6));
        const spot = orbit(planet, time, grow);
        const el = planetRefs.current[i];
        if (!el) return spot;
        const isHot = hotSkills.has(planet.skill);
        el.style.transform = `translate3d(${spot.x.toFixed(2)}px, ${spot.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${(0.84 + spot.depth * 0.16).toFixed(3)})`;
        el.style.opacity = (Math.min(1, grow * 1.4) * (isHot ? 1 : 0.62 + spot.depth * 0.38)).toFixed(3);
        const z = isHot ? '5' : spot.depth > 0.5 ? '3' : '1';
        if (el.style.zIndex !== z) el.style.zIndex = z;
        const shown = grow > 0 ? 'visible' : 'hidden';
        if (el.style.visibility !== shown) el.style.visibility = shown;
        return { ...spot, grow };
      });

      ctx.clearRect(-50, -50, W + 100, H + 100);

      // Stars twinkle and drift with the pointer, the nearest the most.
      for (let tint = -1, i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        if (s.tint !== tint) {
          tint = s.tint;
          ctx.fillStyle = STAR_TINTS[tint];
        }
        const twinkle = motion ? 0.55 + 0.45 * Math.sin((now / 1000) * s.rate + s.phase) : 0.8;
        const x = s.x - pointer.x * s.depth * 18;
        const y = s.y - pointer.y * s.depth * 18;
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, TAU);
        ctx.fill();
        if (s.r > 1.3 && twinkle > 0.85) {
          const flare = s.r * 4;
          ctx.globalAlpha = (twinkle - 0.85) * 4 * s.alpha;
          ctx.fillRect(x - flare, y - 0.35, flare * 2, 0.7);
          ctx.fillRect(x - 0.35, y - flare, 0.7, flare * 2);
        }
      }

      // Shooting stars.
      ctx.lineCap = 'round';
      for (const m of meteors) {
        const fade = Math.sin(Math.PI * clamp01(m.life / m.span));
        const tail = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 0.16, m.y - m.vy * 0.16);
        tail.addColorStop(0, '#ffffff');
        tail.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.globalAlpha = fade * 0.9;
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 0.16, m.y - m.vy * 0.16);
        ctx.stroke();
      }

      // Orbits draw themselves in, then light up with their star.
      const rings = easeOut(clamp01(intro / 0.7));
      for (const [id, sys] of Object.entries(SYSTEMS)) {
        const lit = hotHubs.has(id);
        ctx.globalAlpha = (lit ? 0.6 : current ? 0.08 : 0.2) * rings;
        ctx.strokeStyle = sys.color;
        ctx.lineWidth = lit ? 1.5 : 1;
        ctx.beginPath();
        ctx.ellipse(sys.x, sys.y, sys.rx, sys.ry, 0, -Math.PI / 2, -Math.PI / 2 + TAU * rings);
        ctx.stroke();
      }

      // Constellation lines from each shared skill to the stars it belongs to.
      const links = clamp01((intro - 0.35) / 0.5);
      ctx.setLineDash([3, 7]);
      for (const star of shared) {
        for (const hub of star.hubs) {
          const sys = SYSTEMS[hub];
          const lit = hotSkills.has(star.skill) && hotHubs.has(hub);
          const mx = (star.x + sys.x) / 2 - (sys.y - star.y) * 0.12;
          const my = (star.y + sys.y) / 2 + (sys.x - star.x) * 0.12;
          ctx.globalAlpha = (lit ? 0.85 : current ? 0.06 : 0.24) * links;
          ctx.strokeStyle = lit ? sys.color : SHARED.color;
          ctx.lineWidth = lit ? 1.6 : 1;
          ctx.lineDashOffset = lit && motion ? -now / 40 : 0;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.quadraticCurveTo(mx, my, sys.x, sys.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // A beam of light from a star to each lit planet.
      planets.forEach((planet, i) => {
        const spot = spots[i];
        if (!hotSkills.has(planet.skill) || spot.grow < 1) return;
        const sys = SYSTEMS[planet.hub];
        const beam = ctx.createLinearGradient(sys.x, sys.y, spot.x, spot.y);
        beam.addColorStop(0.25, `${sys.color}00`);
        beam.addColorStop(1, sys.color);
        ctx.strokeStyle = beam;
        for (const [width, alpha] of [
          [7, 0.18],
          [1.6, 0.9],
        ]) {
          ctx.globalAlpha = alpha;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(sys.x, sys.y);
          ctx.lineTo(spot.x, spot.y);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    };

    const tick = (now) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = hotRef.current.focus ? 0 : pointer.inside ? 0.25 : 1;
      speed += (target - speed) * Math.min(1, dt * 4);
      time += dt * speed;
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
      spiral.parentElement.style.translate = `${(-pointer.x * 7).toFixed(2)}px ${(-pointer.y * 7).toFixed(2)}px`;

      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        const left = Math.random() < 0.5;
        const angle = (left ? 150 : 30) * (Math.PI / 180) + (Math.random() - 0.5) * 0.4;
        const pace = 650 + Math.random() * 350;
        meteors.push({ x: 150 + Math.random() * 800, y: Math.random() * 220, vx: Math.cos(angle) * pace, vy: Math.sin(angle) * pace, life: 0, span: 0.7 + Math.random() * 0.5 });
        nextMeteor = 4 + Math.random() * 7;
      }
      for (let i = meteors.length - 1; i >= 0; i -= 1) {
        const m = meteors[i];
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.life > m.span) meteors.splice(i, 1);
      }

      paint(now);
      if (visible) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || !motion || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    repaint.current = () => {
      if (!raf) paint(performance.now());
    };

    // Fit the 1100 × 670 layout to the width available, with sharp canvases.
    const fit = () => {
      const width = frame.clientWidth;
      if (!width) return; // hidden (cards view or a phone)
      scale = width / W;
      frame.style.setProperty('--gx-scale', scale.toFixed(4));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sky.width = Math.round(W * scale * dpr);
      sky.height = Math.round(H * scale * dpr);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      drawSpiral(spiral, Math.min(1.5, scale * dpr));
      paint(performance.now());
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(frame);

    const seen = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && introStart === null) {
          introStart = performance.now();
          stage.classList.add('is-lit');
        }
        if (visible && motion) start();
        else stop();
        if (!motion) paint(performance.now());
      },
      { threshold: 0.15 },
    );
    seen.observe(frame);

    const onMove = (event) => {
      const box = frame.getBoundingClientRect();
      pointer.tx = ((event.clientX - box.left) / box.width) * 2 - 1;
      pointer.ty = ((event.clientY - box.top) / box.height) * 2 - 1;
    };
    const onEnter = (event) => {
      if (event.pointerType === 'mouse') pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
      pointer.tx = 0;
      pointer.ty = 0;
    };
    frame.addEventListener('pointermove', onMove, { passive: true });
    frame.addEventListener('pointerenter', onEnter);
    frame.addEventListener('pointerleave', onLeave);

    return () => {
      stop();
      resize.disconnect();
      seen.disconnect();
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerenter', onEnter);
      frame.removeEventListener('pointerleave', onLeave);
      repaint.current = () => {};
    };
  }, [planets, shared]);

  const state = (isHot) => (focus ? (isHot ? 'is-hot' : 'is-dim') : '');
  const info = !focus
    ? 'Hover or tap a skill to see where it was used. Click a star to open its project.'
    : focus.type === 'skill'
      ? `${focus.id}: used in ${skillLinks[focus.id].map(hubLabel).join(' and ')}`
      : `${hubLabel(focus.id)}: ${skillsOf(focus.id).join(', ')}`;

  const pin = (skill) => setPinned((current) => (current?.id === skill ? null : { type: 'skill', id: skill }));
  const openHub = (hub) => window.location.assign(hub.href);
  const onKey = (action) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
  const hoverProps = (target) => ({
    onMouseEnter: () => setHover(target),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(target),
    onBlur: () => setHover(null),
  });
  const skillButton = (skill, hubs) => ({
    type: 'button',
    'aria-pressed': pinned?.id === skill,
    'aria-label': `${skill}, used in ${hubs.map(hubLabel).join(' and ')}`,
    onClick: () => pin(skill),
    ...hoverProps({ type: 'skill', id: skill }),
  });

  return (
    <Reveal className="skill-galaxy">
      <div ref={frameRef} className="gx-frame">
        {/* Clicking empty space (or Escape) lets go of a pinned skill. */}
        <div
          ref={stageRef}
          className="gx-stage"
          role="group"
          aria-label="Skill galaxy: which skills were used where"
          onClick={(event) => event.target === event.currentTarget && setPinned(null)}
          onKeyDown={(event) => event.key === 'Escape' && setPinned(null)}
        >
          <div className="gx-spiral-wrap" aria-hidden="true">
            <canvas ref={spiralRef} className="gx-spiral" />
          </div>
          <canvas ref={skyRef} className="gx-sky" aria-hidden="true" />

          <p className="gx-hud" aria-hidden="true">
            <strong>Skill galaxy</strong>
            {skillHubs.length} star systems · {Object.keys(skillLinks).length} skills
          </p>
          <p className="gx-legend" aria-hidden="true">
            <span>
              <i className="gx-key-star" /> Project
            </span>
            <span>
              <i className="gx-key-planet" /> Skill used there
            </span>
            <span>
              <i className="gx-key-shared" /> Used in both
            </span>
          </p>

          {skillHubs.map((hub, i) => {
            const sys = SYSTEMS[hub.id];
            return (
              <button
                key={hub.id}
                type="button"
                className={`gx-sun ${state(hot.hubs.has(hub.id))}`}
                style={{ left: sys.x, top: sys.y, '--c': sys.color, '--i': i }}
                aria-label={`${hub.label}, ${hub.note}. Skills: ${skillsOf(hub.id).join(', ')}. Open`}
                onClick={() => openHub(hub)}
                onKeyDown={onKey(() => openHub(hub))}
                {...hoverProps({ type: 'hub', id: hub.id })}
              >
                <span className="gx-sun-body">
                  <span className="gx-corona" />
                  <span className="gx-rays" />
                  <span className="gx-core">
                    <span className="gx-sun-name">{hub.label}</span>
                    <span className="gx-sun-note">{hub.note}</span>
                  </span>
                </span>
              </button>
            );
          })}

          {planets.map((planet, i) => (
            <button
              key={planet.skill}
              ref={(el) => {
                planetRefs.current[i] = el;
              }}
              className={`gx-planet ${state(hot.skills.has(planet.skill))}${pinned?.id === planet.skill ? ' is-pinned' : ''}`}
              style={{ '--c': SYSTEMS[planet.hub].color }}
              {...skillButton(planet.skill, [planet.hub])}
            >
              <span className="gx-pill">
                <span className="gx-orb" />
                {planet.skill}
              </span>
            </button>
          ))}

          {shared.map((star, i) => (
            <button
              key={star.skill}
              className={`gx-star ${state(hot.skills.has(star.skill))}${pinned?.id === star.skill ? ' is-pinned' : ''}`}
              style={{ left: star.x, top: star.y, '--c': SHARED.color, '--i': i }}
              {...skillButton(star.skill, star.hubs)}
            >
              <span className="gx-pill">
                <span className="gx-spark" />
                {star.skill}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="gx-info" aria-live="polite">
        {info}
      </p>
    </Reveal>
  );
}
