import { getScaledSize } from "./imageSize";

export type CropEdge = "top" | "right" | "bottom" | "left";

// Recorte en proporciones de 0 a 1 de la foto, para no depender de su tamaño.
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Con márgenes: el OCR falla sobre todo en los bordes de la página (sombras,
// curvatura, el renglón de arriba o de abajo), así que se empieza más adentro.
export const DEFAULT_CROP: CropRect = {
  x: 0.08,
  y: 0.15,
  width: 0.84,
  height: 0.7,
};

// Un recorte nunca baja de esta proporción por lado: más pequeño no se podría
// volver a agarrar ni tendría texto que leer.
export const MIN_CROP_SIDE = 0.1;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// Mueve un borde a `position` (0-1, medida desde arriba o desde la izquierda)
// sin que cruce el borde contrario ni salga de la foto.
export const moveEdge = (
  rect: CropRect,
  edge: CropEdge,
  position: number,
): CropRect => {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  switch (edge) {
    case "left": {
      const x = clamp(position, 0, right - MIN_CROP_SIDE);
      return { ...rect, x, width: right - x };
    }
    case "right": {
      const end = clamp(position, rect.x + MIN_CROP_SIDE, 1);
      return { ...rect, width: end - rect.x };
    }
    case "top": {
      const y = clamp(position, 0, bottom - MIN_CROP_SIDE);
      return { ...rect, y, height: bottom - y };
    }
    case "bottom": {
      const end = clamp(position, rect.y + MIN_CROP_SIDE, 1);
      return { ...rect, height: end - rect.y };
    }
  }
};

// Copia a un canvas nuevo solo la zona recortada, ya reducida para el OCR (el
// recorte conserva la resolución original: se reduce una sola vez, aquí).
export const cropCanvas = (
  source: HTMLCanvasElement,
  rect: CropRect,
): HTMLCanvasElement => {
  const sx = Math.round(rect.x * source.width);
  const sy = Math.round(rect.y * source.height);
  const sw = Math.max(1, Math.round(rect.width * source.width));
  const sh = Math.max(1, Math.round(rect.height * source.height));
  const size = getScaledSize(sw, sh);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas
    .getContext("2d")
    ?.drawImage(source, sx, sy, sw, sh, 0, 0, size.width, size.height);

  return canvas;
};
