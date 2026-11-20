// Window-level pointer position in normalised device coords (-1..1), shared by scenes,
// so the 3D reacts even while the pointer is over overlaid text.
export const pointer = { x: 0, y: 0 };

let attached = false;
export function attachPointer() {
  if (attached || typeof window === 'undefined') return;
  attached = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
