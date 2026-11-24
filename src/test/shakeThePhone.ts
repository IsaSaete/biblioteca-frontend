import { SHAKE_OPTIONS } from "../domains/home/hooks/useShake";

// jsdom no tiene `DeviceMotionEvent`: se simula con un evento normal que lleva
// la aceleración.
const move = (x: number) => {
  const event = new Event("devicemotion");
  Object.assign(event, { accelerationIncludingGravity: { x, y: 0, z: 9.8 } });
  window.dispatchEvent(event);
};

// Cuatro vaivenes bruscos, con el tiempo mínimo entre uno y otro: lo que el
// detector da por una sacudida.
export const shakeThePhone = async (): Promise<void> => {
  for (const x of [0, 40, -40, 40, -40]) {
    move(x);
    await new Promise((resolve) =>
      setTimeout(resolve, SHAKE_OPTIONS.minGapMs + 10),
    );
  }
};
