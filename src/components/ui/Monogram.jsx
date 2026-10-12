import { MONOGRAM } from '../../lib/monogram';

// The FA lettermark (shapes in lib/monogram.js). Colours come from CSS, so it
// follows the light/dark theme.
export function Monogram({ className = '' }) {
  return (
    <svg className={`monogram ${className}`.trim()} viewBox={MONOGRAM.viewBox} aria-hidden="true" focusable="false">
      <rect className="monogram-bg" width="64" height="64" rx={MONOGRAM.radius} />
      <path className="monogram-fg" d={MONOGRAM.letters} fillRule="evenodd" />
      <path className="monogram-accent" d={MONOGRAM.accent} />
    </svg>
  );
}
