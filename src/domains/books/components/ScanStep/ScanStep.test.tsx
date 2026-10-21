import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScanStep from "./ScanStep";

const detect = vi.fn();

vi.mock("../../scanner/loadBarcodeDetector", () => ({
  loadBarcodeDetector: () => Promise.resolve({ detect }),
}));

const stopTrack = vi.fn();
const getUserMedia = vi.fn();

const stubCamera = () => {
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
  });
};

const renderScan = () => {
  const onIsbnScanned = vi.fn();
  const onWriteIsbn = vi.fn();
  const view = render(
    <ScanStep onIsbnScanned={onIsbnScanned} onWriteIsbn={onWriteIsbn} />,
  );
  return { ...view, onIsbnScanned, onWriteIsbn };
};

describe("Given the barcode scan step", () => {
  beforeEach(() => {
    detect.mockReset().mockResolvedValue([]);
    getUserMedia.mockReset();
    stopTrack.mockReset();
    stubCamera();
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  });
  afterEach(() =>
    Object.defineProperty(navigator, "mediaDevices", {
      value: undefined,
      configurable: true,
    }),
  );

  describe("When it opens", () => {
    it("Then it asks for the rear camera without audio and tells the user where to aim", async () => {
      renderScan();

      expect(
        await screen.findByText("Apunta al código de barras del libro."),
      ).toBeInTheDocument();
      expect(getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      expect(screen.getByLabelText("Vista de la cámara")).toBeInTheDocument();
    });
  });

  describe("When the same ISBN is read in consecutive frames", () => {
    it("Then it reports the ISBN once and turns the camera off", async () => {
      detect.mockResolvedValue([{ rawValue: "9788437604947" }]);
      const { onIsbnScanned } = renderScan();

      await waitFor(() => expect(onIsbnScanned).toHaveBeenCalledTimes(1), {
        timeout: 3000,
      });

      expect(onIsbnScanned).toHaveBeenCalledWith("9788437604947");
      expect(stopTrack).toHaveBeenCalled();
    });
  });

  describe("When a single frame shows an ISBN and the next one does not", () => {
    it("Then it does not report it", async () => {
      detect
        .mockResolvedValueOnce([{ rawValue: "9788437604947" }])
        .mockResolvedValue([]);
      const { onIsbnScanned } = renderScan();

      await waitFor(() => expect(detect).toHaveBeenCalledTimes(3), {
        timeout: 3000,
      });

      expect(onIsbnScanned).not.toHaveBeenCalled();
    });
  });

  describe("When the camera permission is denied", () => {
    it("Then it explains it and offers to retry or type the ISBN", async () => {
      getUserMedia.mockRejectedValueOnce(
        new DOMException("denied", "NotAllowedError"),
      );
      const user = userEvent.setup();
      const { onWriteIsbn } = renderScan();

      expect(
        await screen.findByText(/No pudimos acceder a la cámara/),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Escribir ISBN" }));
      expect(onWriteIsbn).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "Reintentar" }));
      expect(
        await screen.findByText("Apunta al código de barras del libro."),
      ).toBeInTheDocument();
      expect(getUserMedia).toHaveBeenCalledTimes(2);
    });
  });

  describe("When the camera cannot be started for another reason", () => {
    it("Then it shows a generic camera error", async () => {
      getUserMedia.mockRejectedValueOnce(
        new DOMException("none", "NotFoundError"),
      );
      renderScan();

      expect(
        await screen.findByText(/No pudimos iniciar la cámara/),
      ).toBeInTheDocument();
    });
  });

  describe("When the user leaves the step", () => {
    it("Then the camera is turned off", async () => {
      const { unmount } = renderScan();
      await screen.findByText("Apunta al código de barras del libro.");

      unmount();

      expect(stopTrack).toHaveBeenCalled();
    });
  });
});
