import { useEffect, useState } from 'react';
import { openResume, resumeHash } from '../../lib/resume';
import { Icon } from './Icon';

// Link styled as a button.
export function ButtonLink({ href, variant = 'primary', icon, iconPosition = 'end', className = '', children, ...rest }) {
  return (
    <a className={`btn btn-${variant} ${className}`.trim()} href={href} {...rest}>
      {icon && iconPosition === 'start' && <Icon name={icon} />}
      <span>{children}</span>
      {icon && iconPosition === 'end' && <Icon name={icon} />}
    </a>
  );
}

// Opens the résumé viewer. A real link to /#resume, so opening it in a new tab
// or copying the link still works.
export function ResumeButton({ variant = 'secondary', children = 'View Resume', className = '', onClick, ...rest }) {
  const open = (event) => {
    onClick?.(event);
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openResume();
  };

  return (
    <a className={`btn btn-${variant} resume-open ${className}`.trim()} href={resumeHash} aria-haspopup="dialog" onClick={open} {...rest}>
      <span>{children}</span>
      <Icon name="file" />
    </a>
  );
}

// Résumé download. The browser saves the file as usual; the button plays a short
// "saving → saved" sequence: a fill sweeps across, the arrow becomes a spinner,
// then a check.
export function ResumeDownload({ resume, variant = 'secondary', children = 'Download Resume', className = '', ...rest }) {
  const [state, setState] = useState('idle'); // idle | saving | saved

  useEffect(() => {
    if (state === 'idle') return;
    const timer = setTimeout(() => setState(state === 'saving' ? 'saved' : 'idle'), state === 'saving' ? 900 : 1800);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <a
      className={`btn btn-${variant} resume-btn is-${state} ${className}`.trim()}
      href={resume.href}
      download={resume.fileName}
      type="application/pdf"
      onClick={() => setState('saving')}
      {...rest}
    >
      <span className="btn-label">{children}</span>
      <span className="resume-icon" aria-hidden="true">
        <Icon name="download" />
        <svg className="resume-spinner" viewBox="0 0 20 20" focusable="false">
          <circle cx="10" cy="10" r="7.5" pathLength="1" />
        </svg>
        <Icon name="check" />
      </span>
    </a>
  );
}

export function TagList({ items, className = '' }) {
  return (
    <ul className={`tags ${className}`} role="list">
      {items.map((item) => (
        <li key={item} className="tag">
          {item}
        </li>
      ))}
    </ul>
  );
}
