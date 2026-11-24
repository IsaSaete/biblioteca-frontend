import { useEffect, useRef } from "react";
import { createShakeDetector } from "../utils/shakeDetector";
import type { ShakeOptions } from "../utils/shakeDetector";

// Ajustes del gesto. Son estimaciones: se afinan probando en el móvil. Más
// umbral o más sacudidas, y cuesta más que salte; menos, y salta al andar.
export const SHAKE_OPTIONS: ShakeOptions = {
  threshold: 25,
  shakesRequired: 3,
  windowMs: 1200,
  minGapMs: 120,
  cooldownMs: 3000,
};

// Avisa cuando se agita el móvil mientras el componente está montado y
// `isEnabled`. Sin sensor de movimiento (o sin permiso) simplemente no llegan
// lecturas y nunca avisa.
export const useShake = (onShake: () => void, isEnabled: boolean): void => {
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const feed = createShakeDetector(SHAKE_OPTIONS, () => onShakeRef.current());
    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;

      if (
        acceleration &&
        acceleration.x !== null &&
        acceleration.y !== null &&
        acceleration.z !== null
      ) {
        feed(
          { x: acceleration.x, y: acceleration.y, z: acceleration.z },
          Date.now(),
        );
      }
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isEnabled]);
};
