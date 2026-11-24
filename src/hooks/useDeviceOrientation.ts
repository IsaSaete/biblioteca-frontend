import { useEffect, useState } from "react";

export interface Orientation {
  // Inclinación adelante y atrás, y a un lado y a otro, en grados.
  beta: number;
  gamma: number;
}

// La inclinación del dispositivo mientras `isEnabled`, o `null` si aún no ha
// llegado ninguna lectura (sin sensor o sin permiso). Se redondea a medio grado
// para no repintar por ruidos que no se ven.
export const useDeviceOrientation = (
  isEnabled: boolean,
): Orientation | null => {
  const [orientation, setOrientation] = useState<Orientation | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) {
        return;
      }

      const next = {
        beta: Math.round(event.beta * 2) / 2,
        gamma: Math.round(event.gamma * 2) / 2,
      };

      setOrientation((current) =>
        current && current.beta === next.beta && current.gamma === next.gamma
          ? current
          : next,
      );
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      setOrientation(null);
    };
  }, [isEnabled]);

  return orientation;
};
