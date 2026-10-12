// Makes one element appear to grow or shrink into another across a DOM update,
// using the View Transitions API: `from` is captured before `update()` runs,
// `getTo()` is looked up after it. Where the API is missing, with reduced
// motion, or when `from` is off screen, it just runs `update()`.
const NAME = 'morph';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const onScreen = (el) => {
  const box = el.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight && box.width > 0;
};

export function morph(from, update, getTo) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion || !from || !onScreen(from)) {
    update();
    return;
  }

  const root = document.documentElement;
  root.dataset.vt = 'morph';
  from.style.viewTransitionName = NAME;
  const transition = document.startViewTransition(async () => {
    from.style.viewTransitionName = '';
    await update();
    const to = getTo();
    if (to && onScreen(to)) {
      to.style.viewTransitionName = NAME;
      // Wait (briefly) for the image to be ready, so it doesn't arrive blank.
      if (to.decode) await Promise.race([to.decode().catch(() => {}), wait(350)]);
    }
  });
  // A transition can be skipped (e.g. another one starts); that's fine, so the
  // rejections are handled here instead of surfacing as errors.
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      const to = getTo();
      if (to) to.style.viewTransitionName = '';
      delete root.dataset.vt;
    });
}
