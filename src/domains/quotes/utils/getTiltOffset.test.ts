import { getTiltOffset } from "./getTiltOffset";

describe("Given the tilt of the phone", () => {
  describe("When it is almost flat over a book on the table", () => {
    it("Then it is flat and level only if both axes are straight", () => {
      expect(getTiltOffset({ beta: 1, gamma: -2 })).toEqual({
        mode: "flat",
        x: -2,
        y: 1,
        isLevel: true,
      });
      expect(getTiltOffset({ beta: 10, gamma: 0 })).toMatchObject({
        mode: "flat",
        isLevel: false,
      });
      expect(getTiltOffset({ beta: 0, gamma: 12 })).toMatchObject({
        mode: "flat",
        isLevel: false,
      });
    });
  });

  describe("When it is almost upright in front of a book", () => {
    it("Then it is upright and level when it is not rotated", () => {
      expect(getTiltOffset({ beta: 90, gamma: 0 })).toEqual({
        mode: "upright",
        x: 0,
        y: 0,
        isLevel: true,
      });
      expect(getTiltOffset({ beta: 85, gamma: 2 })).toMatchObject({
        mode: "upright",
        isLevel: true,
      });
    });

    it("Then it is not level when it is rotated to a side", () => {
      expect(getTiltOffset({ beta: 90, gamma: 10 })).toMatchObject({
        mode: "upright",
        x: 10,
        isLevel: false,
      });
    });

    it("Then leaning forward or back does not matter, only the rotation", () => {
      expect(getTiltOffset({ beta: 70, gamma: 0 })).toMatchObject({
        mode: "upright",
        isLevel: true,
      });
    });
  });

  describe("When it is exactly at the tolerance", () => {
    it("Then it still counts as level", () => {
      expect(getTiltOffset({ beta: 90, gamma: 3 }).isLevel).toBe(true);
      expect(getTiltOffset({ beta: 90, gamma: 3.5 }).isLevel).toBe(false);
    });
  });

  describe("When the phone passes from flat to upright", () => {
    it("Then the mode changes at 45 degrees", () => {
      expect(getTiltOffset({ beta: 44, gamma: 0 }).mode).toBe("flat");
      expect(getTiltOffset({ beta: 45, gamma: 0 }).mode).toBe("upright");
    });
  });
});
