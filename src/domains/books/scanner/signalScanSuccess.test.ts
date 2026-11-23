const oscillator = {
  type: "",
  frequency: { value: 0 },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};
const gain = {
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const stubAudioContext = (state: "running" | "suspended") => {
  const resume = vi.fn().mockResolvedValue(undefined);

  vi.stubGlobal(
    "AudioContext",
    class {
      state = state;
      currentTime = 0;
      destination = {};
      createOscillator = () => oscillator;
      createGain = () => gain;
      resume = resume;
    },
  );

  return { resume };
};

const stubVibrate = (vibrate: unknown) =>
  Object.defineProperty(navigator, "vibrate", {
    value: vibrate,
    configurable: true,
  });

// El módulo guarda el contexto de audio y el interruptor: cada prueba lo carga
// de nuevo para no heredar el de la anterior.
const loadModule = async () => {
  vi.resetModules();

  return import("./signalScanSuccess");
};

describe("Given a successful barcode read", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    oscillator.start.mockClear();
    oscillator.stop.mockClear();
    stubVibrate(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    stubVibrate(undefined);
  });

  describe("When the browser can vibrate (Android)", () => {
    it("Then it vibrates and does not use the iPhone haptic trick", async () => {
      const vibrate = vi.fn();
      stubVibrate(vibrate);
      const { signalScanSuccess } = await loadModule();

      signalScanSuccess();

      expect(vibrate).toHaveBeenCalledWith(80);
      expect(document.querySelector("input[switch]")).toBeNull();
    });
  });

  describe("When the browser cannot vibrate (iPhone)", () => {
    it("Then it activates the hidden switch that makes iOS give a haptic tick", async () => {
      const { signalScanSuccess } = await loadModule();

      signalScanSuccess();

      const input = document.querySelector<HTMLInputElement>("input[switch]");
      expect(input).not.toBeNull();
      expect(input?.checked).toBe(true);
    });

    it("Then it reuses the same switch on the next read", async () => {
      const { signalScanSuccess } = await loadModule();

      signalScanSuccess();
      signalScanSuccess();

      expect(document.querySelectorAll("input[switch]")).toHaveLength(1);
    });
  });

  describe("When audio is available and unlocked", () => {
    it("Then it plays a short beep", async () => {
      stubAudioContext("running");
      const { signalScanSuccess } = await loadModule();

      signalScanSuccess();

      expect(oscillator.start).toHaveBeenCalledTimes(1);
      expect(oscillator.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe("When audio is still locked", () => {
    it("Then it tries to resume it and plays the beep afterwards", async () => {
      const { resume } = stubAudioContext("suspended");
      const { signalScanSuccess } = await loadModule();

      signalScanSuccess();

      await vi.waitFor(() => expect(oscillator.start).toHaveBeenCalledTimes(1));
      expect(resume).toHaveBeenCalled();
    });
  });

  describe("When the scanner opens", () => {
    it("Then it prepares the switch and unlocks the audio", async () => {
      const { resume } = stubAudioContext("suspended");
      const { primeScanFeedback } = await loadModule();

      primeScanFeedback();

      expect(document.querySelector("input[switch]")).not.toBeNull();
      expect(resume).toHaveBeenCalled();
    });
  });

  describe("When nothing is supported or everything fails", () => {
    it("Then it never throws, so scanning is not affected", async () => {
      stubVibrate(() => {
        throw new Error("blocked");
      });
      vi.stubGlobal(
        "AudioContext",
        class {
          constructor() {
            throw new Error("blocked");
          }
        },
      );
      const { signalScanSuccess, primeScanFeedback } = await loadModule();

      expect(() => primeScanFeedback()).not.toThrow();
      expect(() => signalScanSuccess()).not.toThrow();
    });
  });
});
