import avatar from '../../assets/images/avatar.webp';
import avatarSm from '../../assets/images/avatar-160.webp';
import { profile } from '../../content/profile';

// Round photo, like a social profile picture. With `status` it gets a green ring
// and dot for "open to work". Decorative by default (the name is always next to it).
export function Avatar({ size = 40, status = true, alt = '', className = '' }) {
  return (
    <span
      className={`avatar${status ? ' has-status' : ''} ${className}`.trim()}
      style={{ '--size': `${size}px` }}
      title={status ? profile.availability : undefined}
    >
      <img
        src={avatarSm}
        srcSet={`${avatarSm} 160w, ${avatar} 320w`}
        sizes={`${size}px`}
        width={size}
        height={size}
        alt={alt}
        decoding="async"
      />
      {status && <span className="avatar-status" aria-hidden="true" />}
    </span>
  );
}
