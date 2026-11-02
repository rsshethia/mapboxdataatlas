export interface Ticker {
  start: () => void;
  stop: () => void;
  setPaused: (paused: boolean) => void;
  isRunning: () => boolean;
}

export function createTicker(
  callback: (elapsed: number, delta: number) => void,
): Ticker {
  let frame = 0;
  let running = false;
  let paused = false;
  let last = 0;
  let elapsed = 0;

  const loop = (now: number) => {
    if (!running) return;
    if (!paused && document.visibilityState !== 'hidden') {
      if (!last) last = now;
      const delta = Math.min(100, now - last);
      last = now;
      elapsed += delta;
      callback(elapsed, delta);
    }
    frame = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;
    running = true;
    paused = false;
    last = 0;
    frame = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  return {
    start,
    stop,
    setPaused: (value: boolean) => {
      paused = value;
      last = 0;
    },
    isRunning: () => running,
  };
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function loopProgress(elapsed: number, duration: number): number {
  if (duration <= 0) return 1;
  return (elapsed % duration) / duration;
}
