// Una foto de página tiene sombras y degradados (la curvatura, la luz de un
// lado) que despistan a Tesseract: su umbral de blanco/negro es global. Esto
// pasa la imagen a grises y divide cada píxel por el brillo medio de su
// entorno, de modo que el fondo queda blanco parejo y la tinta oscura aunque
// la página tenga zonas más oscuras. No es un blanco/negro duro: se conservan
// los tonos intermedios del borde de las letras.
//
// Eso supone tinta oscura sobre papel claro. Con letras claras sobre fondo
// oscuro (la contraportada negra de un libro) cada letra es más clara que su
// entorno y se pintaba de blanco, igual que el fondo: el texto desaparecía. Por
// eso, antes, se detecta si el texto es más claro que el fondo y, si lo es, se
// invierten los grises.
export interface PixelImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

// Por debajo de esta proporción respecto al entorno es tinta (negro) y por
// encima de la alta es papel (blanco).
const INK_RATIO = 0.5;
const PAPER_RATIO = 0.95;

// Cuánto debe diferir un punto de su entorno, en niveles de gris, para contar
// como trazo de una letra (más oscuro o más claro que lo que le rodea). El ruido
// y los degradados de luz o de sombra quedan muy por debajo.
const STROKE_DIFF = 40;

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

// Brillo medio del entorno de cada punto, en una ventana mayor que el trazo de
// una letra pero menor que una sombra.
const createLocalMean = (
  gray: Float32Array,
  width: number,
  height: number,
): ((x: number, y: number) => number) => {
  const { integral, stride } = buildIntegral(gray, width, height);
  const radius = Math.max(8, Math.round(Math.max(width, height) / 16));

  return (x, y) => {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height, y + radius + 1);
    const left = Math.max(0, x - radius);
    const right = Math.min(width, x + radius + 1);
    const sum =
      (integral[bottom * stride + right] ?? 0) -
      (integral[top * stride + right] ?? 0) -
      (integral[bottom * stride + left] ?? 0) +
      (integral[top * stride + left] ?? 0);

    return sum / ((right - left) * (bottom - top));
  };
};

// ¿Es el texto más claro que el fondo? Se cuentan los puntos que destacan por
// oscuros y los que destacan por claros respecto a su entorno: las letras son
// pocos puntos y siempre del mismo tipo, y lo demás es fondo parejo. Mirar solo
// qué mitad de la imagen es más oscura no vale: una página con sombra tiene un
// lado oscuro y su texto sigue siendo oscuro.
const hasLightText = (
  gray: Float32Array,
  width: number,
  height: number,
  localMean: (x: number, y: number) => number,
): boolean => {
  let darker = 0;
  let lighter = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const difference = (gray[y * width + x] ?? 0) - localMean(x, y);

      if (difference < -STROKE_DIFF) {
        darker += 1;
      } else if (difference > STROKE_DIFF) {
        lighter += 1;
      }
    }
  }

  return lighter > darker;
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

  const localMean = createLocalMean(gray, width, height);
  // Con letras claras se invierten los grises (el valor y el brillo medio del
  // entorno), y el resto del tratamiento es el de siempre.
  const invert = hasLightText(gray, width, height, localMean);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = gray[y * width + x] ?? 0;
      const value = invert ? 255 - pixel : pixel;
      const mean = invert ? 255 - localMean(x, y) : localMean(x, y);
      const ratio = mean > 0 ? value / mean : 1;
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
