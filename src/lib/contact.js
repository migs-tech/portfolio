// Fills in the contact form's message (components/contact/ContactForm.jsx) from
// elsewhere on the page, such as the job fit checker's "Send this role to Felix".
export const composeMessage = (text) => window.dispatchEvent(new CustomEvent('portfolio:compose', { detail: text }));
