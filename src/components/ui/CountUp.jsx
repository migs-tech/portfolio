import { useEffect, useRef, useState } from 'react';

const asText = (n, decimals, format) => (format ? format(n) : n.toFixed(decimals));

const canAnimate = () =>
  'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Counts up to `value` the first time it scrolls into view, keeping its decimals
// ("4.47" counts 0.00 → 4.47). Screen readers and visitors who prefer reduced
// motion get the final number straight away. Optional `format` turns each
// number into text, e.g. adding thousands separators.
export function CountUp({ value, duration = 1400, format }) {
  const target = Number(value);
  const decimals = String(value).split('.')[1]?.length ?? 0;
  const animates = Number.isFinite(target) && canAnimate();
  const ref = useRef(null);
  const [display, setDisplay] = useState(() => (animates ? asText(0, decimals, format) : format ? format(target) : String(value)));

  useEffect(() => {
    const el = ref.current;
    if (!el || !animates) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - t) ** 3;
          setDisplay(asText(target * eased, decimals, format));
          if (t < 1) frame = requestAnimationFrame(tick);
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
  }, [animates, target, decimals, duration, format]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {display}
      </span>
      <span className="visually-hidden">{format ? format(target) : value}</span>
    </>
  );
}
