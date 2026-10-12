import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { currentTheme, onSystemThemeChange, toggleTheme } from '../../lib/theme';
import { Icon } from './Icon';

// Header light/dark switch. The theme logic lives in lib/theme.js, shared with the
// command palette; this button just shows the right icon and starts the switch
// from its own position.
export function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    // Update the icon inside the theme transition's snapshot, not after it.
    const onThemeChange = (event) => flushSync(() => setTheme(event.detail));
    window.addEventListener('themechange', onThemeChange);
    const stopWatching = onSystemThemeChange(() => setTheme(currentTheme()));
    return () => {
      window.removeEventListener('themechange', onThemeChange);
      stopWatching();
    };
  }, []);

  const toggle = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button type="button" className="icon-btn icon-btn-sm theme-toggle" onClick={toggle} title={label}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
      <span className="visually-hidden">{label}</span>
    </button>
  );
}
