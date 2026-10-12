import { profile, socialLinks } from '../../content/profile';
import { ContactForm } from '../contact/ContactForm';
import { CopyButton } from '../contact/CopyButton';
import { Avatar } from '../ui/Avatar';
import { ResumeButton } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Reveal, Section } from '../ui/Section';

export function Contact() {
  return (
    <Section
      id="contact"
      index="05"
      label="Contact"
      title="Let’s work together"
      intro="I’m open to IT support, ICT, web and mobile development roles, and freelance work. Send a message here or email me directly."
    >
      <div className="contact-grid">
        <Reveal className="contact-panel" data-pointer>
          <div className="contact-person">
            <Avatar size={64} />
            <div>
              <p className="contact-name">{profile.name}</p>
              <p className="contact-role">
                {profile.role} · {profile.availability}
              </p>
            </div>
          </div>
          <div>
            <p className="contact-label">Email</p>
            <div className="email-row">
              <a className="email-link" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <CopyButton text={profile.email} label="email address" />
            </div>
          </div>
          <ul className="contact-list" role="list">
            <li>
              <Icon name="pin" />
              <span>{profile.location}</span>
            </li>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <Icon name={link.label.toLowerCase()} />
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <ResumeButton />
        </Reveal>

        <Reveal className="contact-form-wrap spotlight" data-pointer style={{ '--i': 1 }}>
          <h3 className="form-title">Send a message</h3>
          <p className="form-intro">It goes straight to my inbox, and I’ll reply by email.</p>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
