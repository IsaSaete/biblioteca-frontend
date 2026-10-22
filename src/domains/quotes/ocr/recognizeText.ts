// Todo el OCR corre en el dispositivo (HU-24): la foto nunca sale de él. Los
// ficheros de Tesseract se sirven desde nuestro propio origen y no desde el CDN
// por defecto, porque la CSP solo admite `'self'`. `workerBlobURL: false` hace
// que el worker se cargue por URL y no desde un `blob:`, que la CSP tampoco
// admite.
const LANG_PATH = "/tesseract/lang";

export interface RecognizeOptions {
  // Avance de 0 a 1 mientras se lee el texto.
  onProgress?: (progress: number) => void;
}

// Carga Tesseract.js solo ahora (no pesa en el bundle de quien no escanea) y
// devuelve el texto reconocido, ya recortado.
export const recognizeText = async (
  image: HTMLCanvasElement,
  { onProgress }: RecognizeOptions = {},
): Promise<string> => {
  const [{ createWorker }, { default: workerPath }, { default: corePath }] =
    await Promise.all([
      import("tesseract.js"),
      import("tesseract.js/dist/worker.min.js?url"),
      import("tesseract.js-core/tesseract-core-simd-lstm.wasm.js?url"),
    ]);

  const worker = await createWorker("spa", 1, {
    workerPath,
    corePath,
    langPath: LANG_PATH,
    workerBlobURL: false,
    logger: (message: { status: string; progress: number }) => {
      if (message.status === "recognizing text") {
        onProgress?.(message.progress);
      }
    },
  });

  try {
    const { data } = await worker.recognize(image);

    return data.text.trim();
  } finally {
    await worker.terminate();
  }
};
