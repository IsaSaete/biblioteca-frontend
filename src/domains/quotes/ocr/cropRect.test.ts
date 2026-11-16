import {
  cropCanvas,
  MIN_CROP_SIDE,
  moveCorner,
  moveEdge,
  moveRect,
} from "./cropRect";
import type { CropRect } from "./cropRect";

const rect: CropRect = { x: 0.2, y: 0.2, width: 0.6, height: 0.6 };

describe("Given a crop rectangle", () => {
  describe("When an edge is moved inside the photo", () => {
    it("Then only that side changes and the opposite one stays put", () => {
      const left = moveEdge(rect, "left", 0.1);
      expect(left.x).toBeCloseTo(0.1);
      expect(left.x + left.width).toBeCloseTo(0.8);

      const bottom = moveEdge(rect, "bottom", 0.9);
      expect(bottom.y).toBeCloseTo(0.2);
      expect(bottom.y + bottom.height).toBeCloseTo(0.9);
    });
  });

  describe("When an edge is dragged out of the photo", () => {
    it("Then it stops at the photo border", () => {
      expect(moveEdge(rect, "left", -0.5).x).toBe(0);
      expect(moveEdge(rect, "top", -0.5).y).toBe(0);
      const right = moveEdge(rect, "right", 3);
      expect(right.x + right.width).toBe(1);
      const bottom = moveEdge(rect, "bottom", 3);
      expect(bottom.y + bottom.height).toBe(1);
    });
  });

  describe("When an edge is dragged past the opposite one", () => {
    it("Then the rectangle keeps its minimum size", () => {
      const left = moveEdge(rect, "left", 0.95);
      expect(left.width).toBeCloseTo(MIN_CROP_SIDE);
      expect(left.x + left.width).toBeCloseTo(0.8);

      const bottom = moveEdge(rect, "bottom", 0);
      expect(bottom.height).toBeCloseTo(MIN_CROP_SIDE);
      expect(bottom.y).toBeCloseTo(0.2);
    });
  });
});

describe("Given a corner of the crop rectangle", () => {
  describe("When it is moved", () => {
    it("Then the two edges that meet there follow it", () => {
      const result = moveCorner(rect, "topLeft", 0.1, 0.3);

      expect(result.x).toBeCloseTo(0.1);
      expect(result.y).toBeCloseTo(0.3);
      expect(result.x + result.width).toBeCloseTo(0.8);
      expect(result.y + result.height).toBeCloseTo(0.8);
    });

    it("Then the opposite corner stays put even when dragged past it", () => {
      const result = moveCorner(rect, "bottomRight", 0, 0);

      expect(result.x).toBeCloseTo(0.2);
      expect(result.y).toBeCloseTo(0.2);
      expect(result.width).toBeCloseTo(MIN_CROP_SIDE);
      expect(result.height).toBeCloseTo(MIN_CROP_SIDE);
    });
  });
});

describe("Given the whole crop rectangle", () => {
  describe("When it is moved", () => {
    it("Then it keeps its size", () => {
      const result = moveRect(rect, 0.1, -0.1);

      expect(result.x).toBeCloseTo(0.3);
      expect(result.y).toBeCloseTo(0.1);
      expect(result.width).toBe(rect.width);
      expect(result.height).toBe(rect.height);
    });

    it("Then it stops at the photo border without shrinking", () => {
      const result = moveRect(rect, 5, -5);

      expect(result.x).toBeCloseTo(0.4);
      expect(result.y).toBe(0);
      expect(result.width).toBe(rect.width);
      expect(result.height).toBe(rect.height);
    });
  });
});

describe("Given a photo and a crop rectangle", () => {
  const drawImage = vi.fn();

  beforeEach(() => {
    drawImage.mockReset();
    HTMLCanvasElement.prototype.getContext = vi
      .fn()
      .mockReturnValue({ drawImage });
  });

  describe("When the cropped zone is bigger than the OCR limit", () => {
    it("Then only that zone is copied, reduced to the limit", () => {
      const source = document.createElement("canvas");
      source.width = 4000;
      source.height = 3000;

      const result = cropCanvas(source, {
        x: 0.25,
        y: 0.5,
        width: 0.5,
        height: 0.5,
      });

      expect(drawImage).toHaveBeenCalledWith(
        source,
        1000,
        1500,
        2000,
        1500,
        0,
        0,
        1500,
        1125,
      );
      expect(result.width).toBe(1500);
      expect(result.height).toBe(1125);
    });
  });

  describe("When the cropped zone is small", () => {
    it("Then it is not enlarged", () => {
      const source = document.createElement("canvas");
      source.width = 1000;
      source.height = 800;

      const result = cropCanvas(source, {
        x: 0,
        y: 0,
        width: 0.5,
        height: 0.5,
      });

      expect(result.width).toBe(500);
      expect(result.height).toBe(400);
    });
  });
});
