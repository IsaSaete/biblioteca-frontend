import { visuallyHidden } from "./visuallyHidden";

describe("Given the style that hides text visually but keeps it for screen readers", () => {
  describe("When its size is read", () => {
    it("Then it is expressed in pixels, because a bare 1 in MUI's sx means 100%", () => {
      const { width, height } = visuallyHidden;

      expect(width).toBe("1px");
      expect(height).toBe("1px");
    });
  });

  describe("When its position is read", () => {
    it("Then it is absolute and clipped so it never takes space or adds scroll", () => {
      const { position, overflow, clip } = visuallyHidden;

      expect(position).toBe("absolute");
      expect(overflow).toBe("hidden");
      expect(clip).toBe("rect(0 0 0 0)");
    });
  });
});
