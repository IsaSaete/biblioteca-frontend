// Solo EAN-13: el código de barras de los libros (ISBN-13 con prefijo 978/979).
const formats = ["ean_13"] as const;

export interface BarcodeReader {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
}

interface BarcodeDetectorConstructor {
  new (options: { formats: readonly string[] }): BarcodeReader;
  getSupportedFormats?: () => Promise<string[]>;
}

const isBarcodeDetectorConstructor = (
  value: unknown,
): value is BarcodeDetectorConstructor => typeof value === "function";

const loadNativeDetector = async (): Promise<BarcodeReader | null> => {
  const native: unknown = Reflect.get(globalThis, "BarcodeDetector");

  if (!isBarcodeDetectorConstructor(native)) {
    return null;
  }

  // Hay navegadores con `BarcodeDetector` que no lee todos los formatos.
  const supported = await native.getSupportedFormats?.();

  if (supported && !formats.every((format) => supported.includes(format))) {
    return null;
  }

  return new native({ formats });
};

// Detector nativo si existe y lee EAN-13; si no, la librería `barcode-detector`
// (ZXing en WebAssembly) cargada solo ahora, con el `.wasm` servido desde
// nuestro propio origen y no desde su CDN por defecto (D-019).
export const loadBarcodeDetector = async (): Promise<BarcodeReader> => {
  const native = await loadNativeDetector();

  if (native) {
    return native;
  }

  const [{ BarcodeDetector, prepareZXingModule }, { default: wasmUrl }] =
    await Promise.all([
      import("barcode-detector/ponyfill"),
      import("zxing-wasm/reader/zxing_reader.wasm?url"),
    ]);

  prepareZXingModule({
    overrides: {
      locateFile: (path: string, prefix: string) =>
        path.endsWith(".wasm") ? wasmUrl : prefix + path,
    },
  });

  return new BarcodeDetector({ formats: [...formats] });
};
