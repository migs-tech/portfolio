import { useEffect, useState } from 'react';

// Cycles once through `words` and settles back on the first, so the motion is
// over within a few seconds. Stays on the first word for reduced motion.
// Decorative: give screen readers the full text separately.
export function RotatingText({ words, interval = 1800 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      setIndex(step % words.length);
      if (step >= words.length) clearInterval(id);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="rotator">
      <span key={index} className="rotator-word">
        {words[index]}
      </span>
    </span>
  );
}
