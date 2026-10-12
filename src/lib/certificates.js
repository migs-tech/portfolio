// Opens a certificate's zoomable view (components/sections/Certificates.jsx) from
// anywhere on the page: the Experience and Education entries, or the command palette.
export const openCertificate = (id) => window.dispatchEvent(new CustomEvent('portfolio:certificate', { detail: id }));
