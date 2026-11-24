import { render } from "@testing-library/react";
import { shakeThePhone } from "../../../test/shakeThePhone";
import { useShake } from "./useShake";

interface ProbeProps {
  onShake: () => void;
  isEnabled: boolean;
}

const Probe = ({ onShake, isEnabled }: ProbeProps) => {
  useShake(onShake, isEnabled);

  return null;
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
