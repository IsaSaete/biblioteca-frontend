import { getScanRegion } from "./getScanRegion";

describe("Given the video frame of the camera", () => {
  describe("When the video has no size yet", () => {
    it("Then there is no region to scan", () => {
      expect(getScanRegion(0, 0, 1)).toBeNull();
    });
  });

  describe("When the video is wider than the viewfinder", () => {
    it("Then the region is the guide frame inside the visible centre, centred", () => {
      // 1920×1080: la ventana 4:3 enseña 1440×1080 del centro; el recuadro
      // (80 % × 50 %) mide 1152×540.
      expect(getScanRegion(1920, 1080, 1)).toEqual({
        x: 384,
        y: 270,
        width: 1152,
        height: 540,
      });
    });
  });

  describe("When the video is taller than the viewfinder (phone in portrait)", () => {
    it("Then the region is taken from the visible centre of the frame", () => {
      // 1080×1920: la ventana 4:3 enseña 1080×810; el recuadro mide 864×405.
      expect(getScanRegion(1080, 1920, 1)).toEqual({
        x: 108,
        y: 758,
        width: 864,
        height: 405,
      });
    });
  });

  describe("When the zoom grows", () => {
    it("Then the region shrinks around the same centre", () => {
      const normal = getScanRegion(1920, 1080, 1);
      const zoomed = getScanRegion(1920, 1080, 2);

      expect(zoomed).toEqual({ x: 672, y: 405, width: 576, height: 270 });
      expect(zoomed && normal && zoomed.x + zoomed.width / 2).toBe(
        normal && normal.x + normal.width / 2,
      );
    });

    it("Then a zoom below 1 is treated as 1", () => {
      expect(getScanRegion(1920, 1080, 0.5)).toEqual(
        getScanRegion(1920, 1080, 1),
      );
    });
  });
});
