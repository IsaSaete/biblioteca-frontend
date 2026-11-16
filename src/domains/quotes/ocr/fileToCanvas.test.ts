import { fileToCanvas, MAX_UPLOAD_SIDE } from "./fileToCanvas";

const drawImage = vi.fn();
const close = vi.fn();
const createImageBitmapMock = vi.fn();

describe("Given a photo chosen from the computer", () => {
  beforeEach(() => {
    drawImage.mockReset();
    close.mockReset();
    createImageBitmapMock.mockReset();
    vi.stubGlobal("createImageBitmap", createImageBitmapMock);
    HTMLCanvasElement.prototype.getContext = vi
      .fn()
      .mockReturnValue({ drawImage });
  });

  afterEach(() => vi.unstubAllGlobals());

  describe("When it is read", () => {
    it("Then it is drawn on a canvas keeping the camera orientation", async () => {
      const bitmap = { width: 800, height: 600, close };
      createImageBitmapMock.mockResolvedValue(bitmap);
      const file = new File(["x"], "page.jpg", { type: "image/jpeg" });

      const canvas = await fileToCanvas(file);

      expect(createImageBitmapMock).toHaveBeenCalledWith(file, {
        imageOrientation: "from-image",
      });
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
      expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 800, 600);
      expect(close).toHaveBeenCalled();
    });
  });

  describe("When the photo is bigger than the limit", () => {
    it("Then it is reduced keeping the proportion", async () => {
      createImageBitmapMock.mockResolvedValue({
        width: 6000,
        height: 4000,
        close,
      });

      const canvas = await fileToCanvas(new File(["x"], "page.jpg"));

      expect(canvas.width).toBe(MAX_UPLOAD_SIDE);
      expect(canvas.height).toBe(2000);
    });
  });

  describe("When the file is not a readable image", () => {
    it("Then it fails", async () => {
      createImageBitmapMock.mockRejectedValue(new Error("not an image"));

      await expect(
        fileToCanvas(new File(["x"], "notes.txt")),
      ).rejects.toThrow();
    });
  });
});
