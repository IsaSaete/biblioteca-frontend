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
