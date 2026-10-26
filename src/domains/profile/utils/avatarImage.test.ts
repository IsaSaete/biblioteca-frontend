import { getCoverCrop } from "./avatarImage";

describe("Given the crop of a profile photo", () => {
  describe("When the image is landscape", () => {
    it("Then it takes the centered square of the height", () => {
      const crop = getCoverCrop(400, 200);

      expect(crop).toEqual({ x: 100, y: 0, size: 200 });
    });
  });

  describe("When the image is portrait", () => {
    it("Then it takes the centered square of the width", () => {
      const crop = getCoverCrop(200, 500);

      expect(crop).toEqual({ x: 0, y: 150, size: 200 });
    });
  });

  describe("When the image is already square", () => {
    it("Then it takes all of it", () => {
      const crop = getCoverCrop(300, 300);

      expect(crop).toEqual({ x: 0, y: 0, size: 300 });
    });
  });
});
