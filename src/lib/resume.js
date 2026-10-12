import { profile } from '../content/profile';

// Opens the résumé viewer (components/resume/ResumeViewer.jsx) from anywhere on
// the page: the résumé buttons and the command palette. /#resume opens it too.
export const resumeHash = '#resume';

export const openResume = () => window.dispatchEvent(new Event('portfolio:resume'));

export function downloadResume() {
  const link = document.createElement('a');
  link.href = profile.resume.href;
  link.download = profile.resume.fileName;
  link.click();
}
