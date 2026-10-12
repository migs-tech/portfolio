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
    // The page height is measured only when it changes, not on every scroll
    // frame (reading it mid-scroll can force a fresh layout).
    let max = 0;
    let threshold = 0;
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
      threshold = window.innerHeight * 0.8;
    };
    const update = () => {
      frame = 0;
      el.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1).toFixed(4) : '0');
      el.classList.toggle('is-visible', window.scrollY > threshold);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      schedule();
    };
    measure();
    update();
    const resize = 'ResizeObserver' in window ? new ResizeObserver(remeasure) : null;
    resize?.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);
    return () => {
      cancelAnimationFrame(frame);
      resize?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
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
