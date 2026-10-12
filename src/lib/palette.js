// Helpers for the command palette (components/ui/CommandPalette.jsx), shared with
// the header and footer buttons that open it.
const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

export const paletteShortcut = () => (isMac() ? '⌘K' : 'Ctrl K');

export const openPalette = () => window.dispatchEvent(new Event('portfolio:palette'));
