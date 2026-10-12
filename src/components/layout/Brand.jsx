import { profile } from '../../content/profile';
import { Avatar } from '../ui/Avatar';
import { Monogram } from '../ui/Monogram';

// Logo and name, linking back to the top of the page. The FA monogram turns over
// to the round photo on hover or keyboard focus; `variant="avatar"` shows the
// photo only (used in the footer).
export function Brand({ onClick, variant = 'flip' }) {
  return (
    <a className="brand" href="#home" onClick={onClick}>
      {variant === 'avatar' ? (
        <Avatar size={36} />
      ) : (
        <span className="brand-badge" aria-hidden="true">
          <span className="brand-face brand-front">
            <Monogram />
          </span>
          <span className="brand-face brand-back">
            <Avatar size={34} status={false} />
          </span>
        </span>
      )}
      <span className="brand-name">{profile.name}</span>
    </a>
  );
}
