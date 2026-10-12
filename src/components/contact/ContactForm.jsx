import { useRef, useState } from 'react';
import { profile } from '../../content/profile';
import { confetti } from '../../lib/confetti';
import { Icon } from '../ui/Icon';

// Two delivery modes:
// 1. VITE_CONTACT_ENDPOINT is set (e.g. a Formspree form URL): the message is POSTed there,
//    and success is shown only after the service confirms it received the message.
// 2. No endpoint: the form opens the visitor's email app with the message filled in.
//    It never claims the message was sent, because the visitor still has to press send.
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT?.trim() || '';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) errors.email = 'Please enter your email address.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address, like name@example.com.';
  if (values.message.trim().length < 10) errors.message = 'Please write a message of at least 10 characters.';
  return errors;
}

const initialValues = { name: '', email: '', message: '', company: '' };

export function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | mailto | error
  const formRef = useRef(null);
  const submitRef = useRef(null);

  // A small celebration from the Send button once the message is confirmed.
  const celebrate = () => {
    const box = submitRef.current?.getBoundingClientRect();
    confetti(box ? { origin: { x: box.left + box.width / 2, y: box.top } } : undefined);
  };

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    if (!ENDPOINT) {
      const subject = `Portfolio inquiry from ${values.name.trim()}`;
      const body = `${values.message.trim()}\n\n— ${values.name.trim()}\n${values.email.trim()}`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus('mailto');
      return;
    }

    // Honeypot: real visitors never see or fill this field.
    if (values.company) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          _subject: `Portfolio inquiry from ${values.name.trim()}`,
        }),
      });
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      setStatus('sent');
      setValues(initialValues);
      celebrate();
    } catch {
      setStatus('error');
    }
  };

  const field = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange: update,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  });

  const sending = status === 'sending';

  return (
    <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="contact-name">Name</label>
        <input type="text" autoComplete="name" required {...field('name')} />
        <FieldError id="contact-name-error" message={errors.name} />
      </div>
      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input type="email" autoComplete="email" inputMode="email" required {...field('email')} />
        <FieldError id="contact-email-error" message={errors.email} />
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea rows="5" required {...field('message')} />
        <FieldError id="contact-message-error" message={errors.message} />
      </div>
      <div className="field-honeypot" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input type="text" id="contact-company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={update} />
      </div>

      <div className="form-footer">
        <button ref={submitRef} type="submit" className="btn btn-primary" disabled={sending} aria-busy={sending || undefined}>
          {sending ? <span className="spinner" aria-hidden="true" /> : <Icon name={ENDPOINT ? 'arrowRight' : 'mail'} />}
          <span>{sending ? 'Sending…' : 'Send Message'}</span>
        </button>
        {!ENDPOINT && <p className="form-hint">This opens your email app with the message ready to send.</p>}
      </div>

      <div className="form-status" role="status" aria-live="polite">
        {status === 'sent' && <p className="status status-ok">Thank you — your message was received. I’ll reply by email.</p>}
        {status === 'mailto' && (
          <p className="status status-info">
            Your email app should now be open with the message filled in — press send there to deliver it. If nothing opened,
            email me directly at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
          </p>
        )}
        {status === 'error' && (
          <p className="status status-error">
            Sorry, the message could not be sent. Please try again, or email me directly at{' '}
            <a href={`mailto:${profile.email}`}>{profile.email}</a>.
          </p>
        )}
      </div>
    </form>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      <span aria-hidden="true">!</span> {message}
    </p>
  );
}
