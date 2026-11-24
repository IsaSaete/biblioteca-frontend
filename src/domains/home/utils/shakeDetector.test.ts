import { createShakeDetector } from "./shakeDetector";
import type { Acceleration } from "./shakeDetector";

const options = {
  threshold: 20,
  shakesRequired: 3,
  windowMs: 1000,
  minGapMs: 50,
  cooldownMs: 3000,
};

const still: Acceleration = { x: 0, y: 0, z: 9.8 };
const left: Acceleration = { x: 25, y: 0, z: 9.8 };
const right: Acceleration = { x: -25, y: 0, z: 9.8 };

describe("Given the readings of the accelerometer", () => {
  describe("When the phone is moved gently", () => {
    it("Then it is not a shake", () => {
      const onShake = vi.fn();
      const feed = createShakeDetector(options, onShake);

      [0, 1, 2, 3, 4, 5].forEach((index) =>
        feed({ x: index, y: 0, z: 9.8 }, index * 100),
      );

      expect(onShake).not.toHaveBeenCalled();
    });
  });

  describe("When the phone changes direction sharply several times in a second", () => {
    it("Then it is a shake", () => {
      const onShake = vi.fn();
      const feed = createShakeDetector(options, onShake);

      feed(still, 0);
      feed(left, 100);
      feed(right, 200);
      feed(left, 300);

      expect(onShake).toHaveBeenCalledTimes(1);
    });
  });

  describe("When a single jolt gives several readings in a few milliseconds", () => {
    it("Then it counts as one movement, not as a shake", () => {
      const onShake = vi.fn();
      const feed = createShakeDetector(options, onShake);

      feed(still, 0);
      feed(left, 10);
      feed(right, 20);
      feed(left, 30);

      expect(onShake).not.toHaveBeenCalled();
    });
  });

  describe("When the sharp movements are too far apart", () => {
    it("Then it is not a shake", () => {
      const onShake = vi.fn();
      const feed = createShakeDetector(options, onShake);

      feed(still, 0);
      feed(left, 100);
      feed(right, 1500);
      feed(left, 3000);

      expect(onShake).not.toHaveBeenCalled();
    });
  });

  describe("When it keeps shaking right after a shake", () => {
    it("Then it does not warn again until the cooldown ends", () => {
      const onShake = vi.fn();
      const feed = createShakeDetector(options, onShake);
      feed(still, 0);
      feed(left, 100);
      feed(right, 200);
      feed(left, 300);

      feed(right, 400);
      feed(left, 500);
      feed(right, 600);
      expect(onShake).toHaveBeenCalledTimes(1);

      feed(left, 3400);
      feed(right, 3500);
      feed(left, 3600);
      feed(right, 3700);
      expect(onShake).toHaveBeenCalledTimes(2);
    });
  });
});
