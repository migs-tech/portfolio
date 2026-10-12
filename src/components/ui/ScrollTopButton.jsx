import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

// Floating "back to top" link. It appears after the first screen, and its ring
// fills as the visitor scrolls down the page. Updates the DOM directly, so
// scrolling never re-renders React.
export function ScrollTopButton() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
      el.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <a ref={ref} href="#home" className="to-top">
      <svg className="to-top-ring" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="22" pathLength="1" />
        <circle className="to-top-progress" cx="24" cy="24" r="22" pathLength="1" />
      </svg>
      <Icon name="arrowUp" size={18} />
      <span className="visually-hidden">Back to top</span>
    </a>
  );
}
