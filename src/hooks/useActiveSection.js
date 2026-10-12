import { useEffect, useState } from 'react';

// Returns the id of the section in the middle of the viewport, or null while
// the visitor is still above the first section (in the hero).
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        const current = ids.find((id) => visible.get(id));
        const aboveFirst = sections[0].getBoundingClientRect().top > window.innerHeight * 0.5;
        setActive((previous) => current ?? (aboveFirst ? null : previous));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
