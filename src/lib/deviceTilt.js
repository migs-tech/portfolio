// Phone tilt: tipping the phone tilts the [data-tilt] elements (the photo card and
// project screenshots), the way the mouse does on a computer. Android browsers
// allow it straight away; iPhones ask permission, so there it starts from the
// command palette ("Tilt with my phone").
let enabled = false;

export const canTiltWithDevice = () =>
  'DeviceOrientationEvent' in window &&
  window.matchMedia('(pointer: coarse)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const tiltNeedsPermission = () => typeof window.DeviceOrientationEvent?.requestPermission === 'function';

export async function enableDeviceTilt() {
  if (enabled) return true;
  if (!canTiltWithDevice()) return false;
  if (tiltNeedsPermission()) {
    const answer = await window.DeviceOrientationEvent.requestPermission().catch(() => 'denied');
    if (answer !== 'granted') return false;
  }
  enabled = true;

  let base = null;
  let latest = null;
  let frame = 0;
  const clamp = (n) => Math.max(-1, Math.min(1, n));

  const apply = () => {
    frame = 0;
    // The first reading is "flat"; the baseline then drifts slowly toward the
    // current angle, so holding the phone a new way settles back to level.
    base ??= { beta: latest.beta, gamma: latest.gamma };
    const x = clamp((latest.gamma - base.gamma) / 20);
    const y = clamp((latest.beta - base.beta) / 20);
    for (const el of document.querySelectorAll('[data-tilt]')) {
      el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
    }
    base.beta += (latest.beta - base.beta) * 0.015;
    base.gamma += (latest.gamma - base.gamma) * 0.015;
  };

  window.addEventListener('deviceorientation', (event) => {
    if (event.beta == null || event.gamma == null) return;
    latest = event;
    if (!frame) frame = requestAnimationFrame(apply);
  });
  document.documentElement.classList.add('device-tilt');
  return true;
}
