import { getScaledSize, getVisibleRegion, MAX_OCR_SIDE } from "./imageSize";

describe("Given the size of a photo for the OCR", () => {
  describe("When it is bigger than the limit", () => {
    it("Then the longest side is reduced to the limit keeping the proportion", () => {
      expect(getScaledSize(4000, 3000)).toEqual({
        width: MAX_OCR_SIDE,
        height: 1125,
      });
      expect(getScaledSize(3000, 4000)).toEqual({
        width: 1125,
        height: MAX_OCR_SIDE,
      });
    });
  });

  describe("When it is already small", () => {
    it("Then it is left as it is, never enlarged", () => {
      expect(getScaledSize(800, 600)).toEqual({ width: 800, height: 600 });
    });
  });
});

describe("Given the part of the video that the viewfinder shows", () => {
  describe("When the video is wider than the box", () => {
    it("Then the sides are cut and the full height is kept", () => {
      expect(getVisibleRegion(1920, 1080, 300, 400)).toEqual({
        x: 555,
        y: 0,
        width: 810,
        height: 1080,
      });
    });
  });

  describe("When the video is taller than the box", () => {
    it("Then the top and bottom are cut and the full width is kept", () => {
      expect(getVisibleRegion(1080, 1920, 400, 300)).toEqual({
        x: 0,
        y: 555,
        width: 1080,
        height: 810,
      });
    });
  });

  describe("When the box has no size yet", () => {
    it("Then the whole frame is used", () => {
      expect(getVisibleRegion(1920, 1080, 0, 0)).toEqual({
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      });
    });
  });
});
