// Una foto de página tiene sombras y degradados (la curvatura, la luz de un
// lado) que despistan a Tesseract: su umbral de blanco/negro es global. Esto
// pasa la imagen a grises y divide cada píxel por el brillo medio de su
// entorno, de modo que el fondo queda blanco parejo y la tinta oscura aunque
// la página tenga zonas más oscuras. No es un blanco/negro duro: se conservan
// los tonos intermedios del borde de las letras.
export interface PixelImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

// Por debajo de esta proporción respecto al entorno es tinta (negro) y por
// encima de la alta es papel (blanco).
const INK_RATIO = 0.5;
const PAPER_RATIO = 0.95;

const toGray = (r: number, g: number, b: number): number =>
  0.299 * r + 0.587 * g + 0.114 * b;

// Suma acumulada de grises: permite la media de cualquier rectángulo con
// cuatro lecturas, sin recorrer la ventana de cada píxel.
const buildIntegral = (gray: Float32Array, width: number, height: number) => {
  const stride = width + 1;
  const integral = new Float64Array(stride * (height + 1));

  for (let y = 1; y <= height; y += 1) {
    let rowSum = 0;
    for (let x = 1; x <= width; x += 1) {
      rowSum += gray[(y - 1) * width + (x - 1)] ?? 0;
      integral[y * stride + x] = (integral[(y - 1) * stride + x] ?? 0) + rowSum;
    }
  }

  return { integral, stride };
};

export const flattenBackground = (image: PixelImage): void => {
  const { data, width, height } = image;

  if (width === 0 || height === 0) {
    return;
  }

  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i += 1) {
    gray[i] = toGray(
      data[i * 4] ?? 0,
      data[i * 4 + 1] ?? 0,
      data[i * 4 + 2] ?? 0,
    );
  }

  const { integral, stride } = buildIntegral(gray, width, height);
  // Ventana mayor que el trazo de una letra pero menor que una sombra.
  const radius = Math.max(8, Math.round(Math.max(width, height) / 16));

  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height, y + radius + 1);

    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width, x + radius + 1);
      const sum =
        (integral[bottom * stride + right] ?? 0) -
        (integral[top * stride + right] ?? 0) -
        (integral[bottom * stride + left] ?? 0) +
        (integral[top * stride + left] ?? 0);
      const mean = sum / ((right - left) * (bottom - top));
      const ratio = mean > 0 ? (gray[y * width + x] ?? 0) / mean : 1;
      const level = Math.round(
        Math.min(
          Math.max((ratio - INK_RATIO) / (PAPER_RATIO - INK_RATIO), 0),
          1,
        ) * 255,
      );
      const offset = (y * width + x) * 4;

      data[offset] = level;
      data[offset + 1] = level;
      data[offset + 2] = level;
      data[offset + 3] = 255;
    }
  }
};

// Aplica la limpieza al contenido de un canvas, en el sitio.
export const enhanceForOcr = (canvas: HTMLCanvasElement): void => {
  const context = canvas.getContext("2d");

  if (!context || canvas.width === 0 || canvas.height === 0) {
    return;
  }

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  flattenBackground(image);
  context.putImageData(image, 0, 0);
};
