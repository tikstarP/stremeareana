export function createThrottle(ms: number) {
  let last = 0;
  return (fn: () => void) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn();
    }
  };
}
