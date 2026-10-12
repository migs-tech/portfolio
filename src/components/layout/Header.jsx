import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { navItems } from '../../content/profile';
import { useActiveSection } from '../../hooks/useActiveSection';
import { ResumeButton } from '../ui/Button';
import { openPalette, paletteShortcut } from '../../lib/palette';
import { Icon } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Brand } from './Brand';

const sectionIds = navItems.map((item) => item.id);

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(sectionIds);
  const toggleRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    // Only tell React when the answer changes, not on every scroll event.
    let last = null;
    const onScroll = () => {
      const now = window.scrollY > 8;
      if (now !== last) setScrolled((last = now));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => window.innerWidth > 900 && setOpen(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  // Move the sliding highlight under the current section's link (desktop only;
  // the CSS hides it in the phone menu). Measured again on resize and once the
  // web font has loaded, since both change link widths.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const place = () => {
      const link = list.querySelector('.nav-link[aria-current="true"]');
      list.style.setProperty('--pill-x', `${link ? link.offsetLeft : 0}px`);
      list.style.setProperty('--pill-w', `${link ? link.offsetWidth : 0}px`);
      list.toggleAttribute('data-has-active', Boolean(link));
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container header-inner">
        <Brand onClick={() => setOpen(false)} />

        <nav className="nav" aria-label="Primary">
          <ul id="primary-menu" ref={listRef} className="nav-list" role="list">
            {navItems.map((item, i) => (
              <li key={item.id} style={{ '--i': i }}>
                <a
                  href={`#${item.id}`}
                  className="nav-link"
                  aria-current={active === item.id ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="nav-resume-mobile" style={{ '--i': navItems.length }}>
              <ResumeButton variant="primary" onClick={() => setOpen(false)} />
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <button type="button" className="palette-trigger" onClick={openPalette} title="Search and shortcuts">
            <Icon name="search" size={16} />
            <span className="palette-trigger-text">Search</span>
            <kbd>{paletteShortcut()}</kbd>
            <span className="visually-hidden"> (command palette)</span>
          </button>
          <ThemeToggle />
          <ResumeButton className="btn-sm header-resume">
            Resume
          </ResumeButton>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="primary-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="burger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
