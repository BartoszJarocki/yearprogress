import confetti from "canvas-confetti";

var duration = 30 * 1000;
var end = Date.now() + duration;

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function showFireworks() {
  const duration = 15 * 1000;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  const end = Date.now() + duration;

  (function frame() {
    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount: 500,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount: 500,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );

    // keep going until we are out of time
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
