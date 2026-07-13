window.requestAnimationFrame = (callback) => window.setTimeout(
  () => callback(performance.now()),
  750,
);
