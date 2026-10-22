import { getScaledSize, MAX_OCR_SIDE } from "./imageSize";

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
