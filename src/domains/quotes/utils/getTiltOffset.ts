import type { Orientation } from "../../../hooks/useDeviceOrientation";

// Cuánto se puede desviar el móvil de lo recto para darlo por nivelado.
export const LEVEL_TOLERANCE_DEG = 3;

// «Plano»: sobre un libro en la mesa, mirando hacia abajo. «Vertical»: frente a
// un libro que se sostiene.
export type TiltMode = "flat" | "upright";

export interface TiltOffset {
  mode: TiltMode;
  // Desviación a un lado y a otro (x) y adelante o atrás (y), en grados.
  x: number;
  y: number;
  isLevel: boolean;
}

// El móvil solo sabe cómo está inclinado respecto a la gravedad, no respecto al
// libro, así que se mide contra la postura recta más cercana:
// - casi plano: lo recto es beta y gamma a 0, y hacen falta los dos ejes;
// - casi vertical: lo recto es no estar girado (gamma a 0). Es lo que enseña la
//   línea, y el texto torcido es lo que más estorba al lector, así que solo
//   cuenta ese giro.
export const getTiltOffset = ({ beta, gamma }: Orientation): TiltOffset => {
  const mode: TiltMode = Math.abs(beta) < 45 ? "flat" : "upright";
  const x = gamma;
  const y = mode === "flat" ? beta : beta - 90;
  const isXLevel = Math.abs(x) <= LEVEL_TOLERANCE_DEG;

  return {
    mode,
    x,
    y,
    isLevel:
      mode === "flat"
        ? isXLevel && Math.abs(y) <= LEVEL_TOLERANCE_DEG
        : isXLevel,
  };
};
