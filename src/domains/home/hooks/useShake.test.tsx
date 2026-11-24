import { render } from "@testing-library/react";
import { SHAKE_OPTIONS, useShake } from "./useShake";

interface ProbeProps {
  onShake: () => void;
  isEnabled: boolean;
}

const Probe = ({ onShake, isEnabled }: ProbeProps) => {
  useShake(onShake, isEnabled);

  return null;
};

// jsdom no tiene `DeviceMotionEvent`: se simula con un evento normal que lleva
// la aceleración.
const move = (x: number) => {
  const event = new Event("devicemotion");
  Object.assign(event, { accelerationIncludingGravity: { x, y: 0, z: 9.8 } });
  window.dispatchEvent(event);
};

const shakeThePhone = async () => {
  for (const x of [0, 40, -40, 40, -40]) {
    move(x);
    await new Promise((resolve) =>
      setTimeout(resolve, SHAKE_OPTIONS.minGapMs + 10),
    );
  }
};

describe("Given a component that listens for shakes", () => {
  describe("When the phone is shaken and it is enabled", () => {
    it("Then it is told once", async () => {
      const onShake = vi.fn();
      render(<Probe onShake={onShake} isEnabled />);

      await shakeThePhone();

      expect(onShake).toHaveBeenCalledTimes(1);
    });
  });

  describe("When the phone is shaken and it is not enabled", () => {
    it("Then it is not told", async () => {
      const onShake = vi.fn();
      render(<Probe onShake={onShake} isEnabled={false} />);

      await shakeThePhone();

      expect(onShake).not.toHaveBeenCalled();
    });
  });

  describe("When the component is removed", () => {
    it("Then it stops listening", async () => {
      const onShake = vi.fn();
      const { unmount } = render(<Probe onShake={onShake} isEnabled />);
      unmount();

      await shakeThePhone();

      expect(onShake).not.toHaveBeenCalled();
    });
  });

  describe("When the sensor gives no values", () => {
    it("Then it ignores the reading", () => {
      const onShake = vi.fn();
      render(<Probe onShake={onShake} isEnabled />);
      const event = new Event("devicemotion");
      Object.assign(event, {
        accelerationIncludingGravity: { x: null, y: null, z: null },
      });

      expect(() => window.dispatchEvent(event)).not.toThrow();
      expect(onShake).not.toHaveBeenCalled();
    });
  });
});
