// The "FA" lettermark, drawn on a 64×64 grid from plain shapes (no font), so it
// looks the same everywhere. Shared by the site logo (components/ui/Monogram.jsx)
// and the icon generator (scripts/optimize-images.mjs), so the two always match.
export const MONOGRAM = {
  viewBox: '0 0 64 64',
  radius: 15,
  // The F, then the A with its counter (the triangle inside) cut out; draw with fill-rule="evenodd".
  letters: 'M11 18H27V24H17V30H24V35H17V46H11Z M38.5 18H43.5L53 46H47L45.13 40.5H36.87L35 46H29Z M41 28.3L43.44 35.5H38.56Z',
  // The A's crossbar, drawn on top in the accent colour.
  accent: 'M38.56 35.5H43.44L45.13 40.5H36.87Z',
};

// Light-theme colours of the standalone icon; `dark` is used where the icon can
// follow the system theme (favicon.svg).
export const MONOGRAM_COLORS = {
  light: { bg: '#14161a', fg: '#f7f6f2', accent: '#6f9cff' },
  dark: { bg: '#eceae4', fg: '#0f1114', accent: '#2457c5' },
};

// A standalone SVG file of the monogram. `square` drops the rounded corners (iOS
// rounds home-screen icons itself); `adaptive` adds the dark-theme colours.
export function monogramSvg({ size = 64, square = false, adaptive = false } = {}) {
  const { light, dark } = MONOGRAM_COLORS;
  const style = adaptive
    ? `<style>@media (prefers-color-scheme: dark){.bg{fill:${dark.bg}}.fg{fill:${dark.fg}}.ac{fill:${dark.accent}}}</style>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${MONOGRAM.viewBox}">${style}` +
    `<rect class="bg" width="64" height="64" rx="${square ? 0 : MONOGRAM.radius}" fill="${light.bg}"/>` +
    `<path class="fg" d="${MONOGRAM.letters}" fill="${light.fg}" fill-rule="evenodd"/>` +
    `<path class="ac" d="${MONOGRAM.accent}" fill="${light.accent}"/>` +
    `</svg>`
  );
}
