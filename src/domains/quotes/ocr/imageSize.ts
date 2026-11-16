// El OCR no gana precisión con fotos a resolución completa y tarda mucho más:
// se reduce el lado mayor a ~1500 px antes de procesar (product-brief, «Decisiones
// técnicas»). Nunca se amplía una imagen pequeña.
export const MAX_OCR_SIDE = 1500;

export const getScaledSize = (
  width: number,
  height: number,
  maxSide: number = MAX_OCR_SIDE,
): { width: number; height: number } => {
  const longest = Math.max(width, height);

  if (longest <= maxSide) {
    return { width, height };
  }

  const ratio = maxSide / longest;

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

export interface SourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Con `object-fit: cover` el visor recorta el vídeo para llenar su caja. Esto
// devuelve ese mismo recorte sobre el fotograma original, para que el OCR lea
// justo lo que la usuaria encuadró y no los márgenes que no veía.
export const getVisibleRegion = (
  videoWidth: number,
  videoHeight: number,
  boxWidth: number,
  boxHeight: number,
): SourceRect => {
  if (boxWidth <= 0 || boxHeight <= 0) {
    return { x: 0, y: 0, width: videoWidth, height: videoHeight };
  }

  const videoRatio = videoWidth / videoHeight;
  const boxRatio = boxWidth / boxHeight;

  if (videoRatio > boxRatio) {
    const width = Math.round(videoHeight * boxRatio);

    return {
      x: Math.round((videoWidth - width) / 2),
      y: 0,
      width,
      height: videoHeight,
    };
  }

  const height = Math.round(videoWidth / boxRatio);

  return {
    x: 0,
    y: Math.round((videoHeight - height) / 2),
    width: videoWidth,
    height,
  };
};
