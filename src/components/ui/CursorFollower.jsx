import { useEffect, useRef, useState } from 'react';

const FINE_POINTER = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const INTERACTIVE = 'a, button, [role="button"], summary, label';

// A soft ring that trails the mouse (the normal cursor stays). Over links and
// buttons it tightens; over elements with data-cursor="Label" it grows and shows
// that word ("Open", "Flip", "Visit"…). Hidden over text fields, outside the
// window, on touch screens and with reduced motion.
export function CursorFollower() {
  const ringRef = useRef(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER).matches) return;
    const ring = ringRef.current;
    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;
    let frame = 0;
    let shown = false;
    let lastMode = '';
    let lastLabel = '';

    const loop = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      if (!shown) {
        rx = x;
        ry = y;
        shown = true;
      }
      const target = event.target instanceof Element ? event.target : null;
      const labelled = target?.closest('[data-cursor]');
      const overText = target?.closest('input, textarea, select, [contenteditable]');
      const overDialog = document.querySelector('dialog[open]');
      const mode = overDialog || overText ? 'hidden' : labelled ? 'label' : target?.closest(INTERACTIVE) ? 'link' : 'idle';
      const nextLabel = mode === 'label' ? labelled.dataset.cursor : '';
      if (mode !== lastMode) {
        ring.dataset.mode = mode;
        lastMode = mode;
      }
      if (nextLabel !== lastLabel) {
        setLabel(nextLabel);
        lastLabel = nextLabel;
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };

    // Leaving the window: a mouseout with nowhere to go.
    const onLeave = (event) => {
      if (event.relatedTarget) return;
      ring.dataset.mode = 'hidden';
      lastMode = 'hidden';
    };
    const onDown = () => ring.classList.add('is-pressed');
    const onUp = () => ring.classList.remove('is-pressed');

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onLeave);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseout', onLeave);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={ringRef} className="cursor-ring" data-mode="hidden" aria-hidden="true">
      <span className="cursor-label">{label}</span>
    </div>
  );
}
