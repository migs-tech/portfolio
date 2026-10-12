import { useEffect } from 'react';

// Cursor-driven effects for mouse and trackpad users, with one shared listener:
// - [data-pointer]: gets --mx / --my (pointer position in px from the element's
//   top-left), used for glows that follow the cursor. Nested elements all update.
//   data-pointer=".child" puts the values on that child instead: custom
//   properties are inherited, so changing them on a big element makes the
//   browser restyle everything inside it on every mouse move.
// - [data-tilt]: gets --rx / --ry (a few degrees of 3D tilt toward the pointer)
//   and --gx / --gy (glare position, in %).
// Does nothing on touch screens or when the visitor prefers reduced motion.
const FINE_POINTER = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function usePointerEffects() {
  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER).matches) return;

    let frame = 0;
    let tilted = null;

    const resetTilt = (el) => {
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
      delete el.dataset.tilting;
    };

    const onMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = event.target instanceof Element ? event.target : null;

        for (let el = target?.closest('[data-pointer]'); el; el = el.parentElement?.closest('[data-pointer]')) {
          const box = el.getBoundingClientRect();
          const host = (el.dataset.pointer && el.querySelector(el.dataset.pointer)) || el;
          host.style.setProperty('--mx', `${event.clientX - box.left}px`);
          host.style.setProperty('--my', `${event.clientY - box.top}px`);
        }

        const tilt = target?.closest('[data-tilt]') ?? null;
        if (tilted && tilted !== tilt) resetTilt(tilted);
        tilted = tilt;
        if (tilt) {
          const box = tilt.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width - 0.5;
          const y = (event.clientY - box.top) / box.height - 0.5;
          tilt.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
          tilt.style.setProperty('--ry', `${(x * 7).toFixed(2)}deg`);
          tilt.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
          tilt.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
          tilt.dataset.tilting = '';
        }
      });
    };

    // Leaving the window (a mouseout with nowhere to go) lets any tilt settle.
    const onLeave = (event) => {
      if (event.relatedTarget) return;
      if (tilted) resetTilt(tilted);
      tilted = null;
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onLeave);
    };
  }, []);
}
