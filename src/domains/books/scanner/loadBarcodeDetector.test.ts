import { loadBarcodeDetector } from "./loadBarcodeDetector";

const prepareZXingModule = vi.fn();
const PonyfillDetector = vi.fn();

vi.mock("barcode-detector/ponyfill", () => ({
  BarcodeDetector: class {
    constructor(options: unknown) {
      PonyfillDetector(options);
    }
  },
  prepareZXingModule: (options: unknown) => prepareZXingModule(options),
}));

class NativeDetector {
  static options: unknown;
  static supported: string[] | undefined = ["ean_13", "qr_code"];
  static getSupportedFormats() {
    return Promise.resolve(NativeDetector.supported ?? []);
  }
  constructor(options: unknown) {
    NativeDetector.options = options;
  }
}

describe("Given the barcode reader loader", () => {
  beforeEach(() => {
    prepareZXingModule.mockClear();
    PonyfillDetector.mockClear();
    NativeDetector.supported = ["ean_13", "qr_code"];
  });
  afterEach(() => vi.unstubAllGlobals());

  describe("When the browser has a native BarcodeDetector that reads EAN-13", () => {
    it("Then it uses the native one and does not load the WebAssembly library", async () => {
      vi.stubGlobal("BarcodeDetector", NativeDetector);

      const reader = await loadBarcodeDetector();

      expect(reader).toBeInstanceOf(NativeDetector);
      expect(NativeDetector.options).toEqual({ formats: ["ean_13"] });
      expect(PonyfillDetector).not.toHaveBeenCalled();
    });
  });

  describe("When there is no native BarcodeDetector", () => {
    it("Then it loads the library with the .wasm served from our own origin", async () => {
      vi.stubGlobal("BarcodeDetector", undefined);

      await loadBarcodeDetector();

      expect(PonyfillDetector).toHaveBeenCalledWith({ formats: ["ean_13"] });
      const { overrides } = prepareZXingModule.mock.calls[0][0];
      expect(overrides.locateFile("zxing_reader.wasm", "https://cdn/")).toMatch(
        /zxing_reader.*\.wasm/,
      );
      expect(
        overrides.locateFile("zxing_reader.wasm", "https://cdn/"),
      ).not.toContain("https://cdn/");
      expect(overrides.locateFile("other.js", "https://cdn/")).toBe(
        "https://cdn/other.js",
      );
    });
  });

  describe("When the native detector does not read EAN-13", () => {
    it("Then it falls back to the library", async () => {
      NativeDetector.supported = ["qr_code"];
      vi.stubGlobal("BarcodeDetector", NativeDetector);

      const reader = await loadBarcodeDetector();

      expect(reader).not.toBeInstanceOf(NativeDetector);
      expect(PonyfillDetector).toHaveBeenCalled();
    });
  });
});
