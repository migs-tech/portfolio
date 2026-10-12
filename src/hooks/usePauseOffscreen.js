import { useEffect } from 'react';

// Endless decorative animations (the "live" dots, the skill map's halos) keep the
// browser drawing frames even when nobody can see them. Each page section gets
// data-offscreen while it's out of view, and motion.css pauses those animations.
export function usePauseOffscreen() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
      },
      { rootMargin: '200px 0px' },
    );
    document.querySelectorAll('main > section').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
}
