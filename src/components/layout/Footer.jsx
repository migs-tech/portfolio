import { navItems, profile, socialLinks } from '../../content/profile';
import { openPalette, paletteShortcut } from '../../lib/palette';
import { Icon } from '../ui/Icon';
import { Brand } from './Brand';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-id">
          <Brand variant="avatar" />
          <p className="footer-tagline">
            {profile.role} · {profile.location}
          </p>
        </div>

        <nav className="footer-col" aria-label="Footer">
          <p className="footer-heading">Sections</p>
          <ul className="footer-links" role="list">
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col">
          <p className="footer-heading">Elsewhere</p>
          <ul className="footer-links" role="list">
            <li>
              <a href={`mailto:${profile.email}`}>Email</a>
            </li>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p className="footer-copy">
          © {year} {profile.name}
        </p>
        <button type="button" className="footer-shortcut" onClick={openPalette}>
          <Icon name="terminal" size={15} /> Shortcuts <kbd>{paletteShortcut()}</kbd>
        </button>
        <a className="text-link" href="#home">
          Back to top <Icon name="arrowUp" size={15} />
        </a>
      </div>
    </footer>
  );
}
