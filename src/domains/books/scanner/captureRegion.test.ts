import { getCaptureSize } from "./captureRegion";

describe("Given a region of the camera frame", () => {
  describe("When it is wide enough", () => {
    it("Then it is captured at its own size", () => {
      expect(getCaptureSize({ x: 0, y: 0, width: 1152, height: 540 })).toEqual({
        width: 1152,
        height: 540,
      });
    });
  });

  describe("When it is narrower than the minimum width", () => {
    it("Then it is enlarged keeping its proportions", () => {
      expect(getCaptureSize({ x: 0, y: 0, width: 480, height: 200 })).toEqual({
        width: 960,
        height: 400,
      });
    });
  });
});
