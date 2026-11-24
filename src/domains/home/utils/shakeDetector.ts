export interface Acceleration {
  x: number;
  y: number;
  z: number;
}

export interface ShakeOptions {
  // Cuánto debe cambiar la aceleración (suma de los tres ejes, en m/s²) entre
  // dos lecturas seguidas para contar como una sacudida. Caminar o mover el
  // móvil con la mano queda muy por debajo.
  threshold: number;
  // Cuántas sacudidas seguidas, dentro de `windowMs`, hacen falta.
  shakesRequired: number;
  windowMs: number;
  // El móvil da una lectura cada ~16 ms: un solo golpe seco produce varias
  // seguidas por encima del umbral. Cada sacudida debe ser un vaivén distinto,
  // así que entre una y otra tiene que pasar al menos este tiempo.
  minGapMs: number;
  // Tiempo en el que no se vuelve a avisar tras una sacudida.
  cooldownMs: number;
}

// Convierte las lecturas del acelerómetro en «se ha agitado el móvil». Función
// pura: recibe la hora en cada lectura, así que se puede probar sin esperar.
export const createShakeDetector = (
  { threshold, shakesRequired, windowMs, minGapMs, cooldownMs }: ShakeOptions,
  onShake: () => void,
): ((reading: Acceleration, now: number) => void) => {
  let previous: Acceleration | null = null;
  let shakes: number[] = [];
  let silentUntil = 0;

  return (reading, now) => {
    const last = previous;
    previous = reading;

    if (!last || now < silentUntil) {
      return;
    }

    const change =
      Math.abs(reading.x - last.x) +
      Math.abs(reading.y - last.y) +
      Math.abs(reading.z - last.z);

    if (change <= threshold) {
      return;
    }

    const lastShake = shakes[shakes.length - 1];

    if (lastShake !== undefined && now - lastShake < minGapMs) {
      return;
    }

    shakes = [...shakes.filter((time) => now - time <= windowMs), now];

    if (shakes.length >= shakesRequired) {
      shakes = [];
      silentUntil = now + cooldownMs;
      onShake();
    }
  };
};
