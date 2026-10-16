// Opens the "Start a project" brief (components/inquiry/ProjectBrief.jsx) from
// anywhere on the page: the freelance card, the contact panel and the command
// palette. /#start-project opens it too.
export const briefHash = '#start-project';

export const openBrief = () => window.dispatchEvent(new Event('portfolio:brief'));
