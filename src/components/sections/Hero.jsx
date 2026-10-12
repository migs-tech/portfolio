import { highlights, profile, socialLinks } from '../../content/profile';
import { ButtonLink, ResumeButton } from '../ui/Button';
import { CountUp } from '../ui/CountUp';
import { Icon } from '../ui/Icon';
import { RotatingText } from '../ui/RotatingText';
import { HeroPortrait } from './HeroPortrait';

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-name" data-pointer>
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-spot" aria-hidden="true" />
      <div className="container">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-kicker">
              <span className="availability">
                <span className="status-dot" aria-hidden="true" />
                {profile.availability}
              </span>
              <span className="kicker-item">
                <Icon name="pin" size={15} />
                {profile.location}
              </span>
            </p>
            {/* Each word slides up in turn; the heading still reads as one name. */}
            <h1 id="hero-name" className="hero-name">
              {profile.name.split(' ').map((word, i) => (
                <span key={word}>
                  {i > 0 && ' '}
                  <span className="word" style={{ '--i': i }}>
                    <span>{word}</span>
                  </span>
                </span>
              ))}
            </h1>
            <p className="hero-role">
              {profile.roleWords?.length ? (
                <>
                  <span className="visually-hidden">{profile.role}</span>
                  <span aria-hidden="true">
                    {profile.rolePrefix} <RotatingText words={profile.roleWords} />
                  </span>
                </>
              ) : (
                profile.role
              )}
            </p>
            <div className="hero-lede">
              {profile.bio.map((text) => (
                <p key={text.slice(0, 24)}>{text}</p>
              ))}
            </div>
            <div className="hero-actions">
              <ButtonLink href="#projects" icon="arrowDown">
                View my work
              </ButtonLink>
              <ResumeButton />
              {socialLinks.length > 0 && (
                <ul className="hero-social" role="list">
                  {socialLinks.map((link) => (
                    <li key={link.label}>
                      <a className="icon-btn" href={link.url} target="_blank" rel="noopener noreferrer">
                        <Icon name={link.label.toLowerCase()} size={18} />
                        <span className="visually-hidden">{link.label} (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <HeroPortrait />
        </div>

        {highlights.length > 0 && (
          <ul className="hero-stats spotlight" role="list" aria-label="Highlights" data-pointer>
            {highlights.map((item) => (
              <li key={item.label} className="stat">
                <p className="stat-value">
                  <CountUp value={item.value} />
                  {item.unit && <span className="stat-unit"> {item.unit}</span>}
                </p>
                <p className="stat-label">{item.label}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
