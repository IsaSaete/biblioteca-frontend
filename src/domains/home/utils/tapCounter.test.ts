import { createTapCounter } from "./tapCounter";

describe("Given a counter of consecutive taps", () => {
  describe("When the required taps arrive within the window", () => {
    it("Then the last one completes the count", () => {
      const counter = createTapCounter(3, 1000);

      expect(counter.register(0)).toBe(false);
      expect(counter.register(300)).toBe(false);
      expect(counter.register(600)).toBe(true);
    });
  });

  describe("When the taps are too slow", () => {
    it("Then the count never completes", () => {
      const counter = createTapCounter(3, 1000);

      expect(counter.register(0)).toBe(false);
      expect(counter.register(800)).toBe(false);
      expect(counter.register(1600)).toBe(false);
    });
  });

  describe("When the count completes", () => {
    it("Then it starts again from zero", () => {
      const counter = createTapCounter(2, 1000);
      counter.register(0);
      expect(counter.register(100)).toBe(true);

      expect(counter.register(200)).toBe(false);
      expect(counter.register(300)).toBe(true);
    });
  });

  describe("When it is reset in the middle", () => {
    it("Then the previous taps no longer count", () => {
      const counter = createTapCounter(3, 1000);
      counter.register(0);
      counter.register(100);

      counter.reset();

      expect(counter.register(200)).toBe(false);
    });
  });
});
