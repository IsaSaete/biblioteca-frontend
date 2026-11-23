import type { ScanRegion } from "./getScanRegion";

// Con menos de esto de ancho, las barras de un código pequeño quedan en muy
// pocos píxeles: el recorte se amplía para que el lector las distinga mejor.
const MIN_CAPTURE_WIDTH = 960;

export const getCaptureSize = ({
  width,
  height,
}: ScanRegion): { width: number; height: number } => {
  const scale = Math.max(1, MIN_CAPTURE_WIDTH / width);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

// Copia al `canvas` solo la zona indicada del fotograma actual, ampliada si es
// pequeña, y lo devuelve para leerlo. Sin contexto 2D (navegadores sin canvas)
// devuelve el vídeo entero: se lee peor, pero se lee.
export const captureRegion = (
  video: HTMLVideoElement,
  region: ScanRegion,
  canvas: HTMLCanvasElement,
): ImageBitmapSource => {
  const size = getCaptureSize(region);

  if (canvas.width !== size.width) {
    canvas.width = size.width;
  }
  if (canvas.height !== size.height) {
    canvas.height = size.height;
  }

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return video;
  }

  context.imageSmoothingQuality = "high";
  context.drawImage(
    video,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    size.width,
    size.height,
  );

  return canvas;
};
