// Light/dark theme, shared by the header toggle and the command palette.
// With no saved choice the site follows the system setting; index.html applies a
// saved choice before the first paint. Listeners hear a "themechange" event.
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)');

export const currentTheme = () => document.documentElement.dataset.theme ?? (systemDark().matches ? 'dark' : 'light');

export function onSystemThemeChange(callback) {
  const query = systemDark();
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

// Switches theme and remembers it. Where view transitions are supported, the new
// theme spreads out in a circle from `origin` ({ x, y } in viewport pixels).
export function toggleTheme(origin) {
  const root = document.documentElement;
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage blocked: the choice still applies until the page is closed.
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion) {
    apply();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.dataset.vt = 'theme';
  const transition = document.startViewTransition(apply);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {});
  transition.finished.catch(() => {}).finally(() => delete root.dataset.vt);
}
