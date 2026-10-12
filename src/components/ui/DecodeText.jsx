import { useEffect, useRef } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/';
const STEP = 40; // ms between updates: each one re-lays out the text, and ~25 a second reads the same

// Text that "decrypts" the first time it scrolls into view: characters start
// scrambled and lock into place left to right. Screen readers get the real text,
// and with reduced motion it is never scrambled. The scramble writes straight to
// the text node, so React doesn't re-render on every step.
export function DecodeText({ text, duration = 650 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const node = el?.firstChild;
    if (!node || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let last = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          if (now - last >= STEP || progress === 1) {
            last = now;
            const locked = Math.floor(progress * text.length);
            node.nodeValue = [...text]
              .map((ch, i) => (i < locked || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
              .join('');
          }
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text, duration]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
      <span className="visually-hidden">{text}</span>
    </>
  );
}
