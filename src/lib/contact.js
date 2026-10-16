// Shared by the contact form (components/contact/ContactForm.jsx) and the project
// brief (components/inquiry/ProjectBrief.jsx). With VITE_CONTACT_ENDPOINT set
// (e.g. a Formspree form URL) messages are POSTed there; without it both open the
// visitor's email app instead.
export const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT?.trim() || '';
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Fills in the contact form's message from elsewhere on the page, such as the
// job fit checker's "Send this role to Felix".
export const composeMessage = (text) => window.dispatchEvent(new CustomEvent('portfolio:compose', { detail: text }));
