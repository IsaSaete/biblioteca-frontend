import { act, render, screen } from "@testing-library/react";
import { useDeviceOrientation } from "./useDeviceOrientation";

const Probe = ({ isEnabled }: { isEnabled: boolean }) => {
  const orientation = useDeviceOrientation(isEnabled);

  return (
    <p>
      {orientation ? `${orientation.beta},${orientation.gamma}` : "sin datos"}
    </p>
  );
};

// jsdom no tiene `DeviceOrientationEvent`: se simula con un evento normal.
const tilt = (beta: number | null, gamma: number | null) =>
  act(() => {
    const event = new Event("deviceorientation");
    Object.assign(event, { beta, gamma });
    window.dispatchEvent(event);
  });

describe("Given the tilt of the device", () => {
  describe("When it is enabled and the sensor gives readings", () => {
    it("Then the last reading is available, rounded to half a degree", () => {
      render(<Probe isEnabled />);

      tilt(90.26, -3.74);

      expect(screen.getByText("90.5,-3.5")).toBeInTheDocument();
    });
  });

  describe("When it is not enabled", () => {
    it("Then it ignores the readings", () => {
      render(<Probe isEnabled={false} />);

      tilt(90, 0);

      expect(screen.getByText("sin datos")).toBeInTheDocument();
    });
  });

  describe("When the sensor gives no values", () => {
    it("Then it keeps having no data", () => {
      render(<Probe isEnabled />);

      tilt(null, null);

      expect(screen.getByText("sin datos")).toBeInTheDocument();
    });
  });

  describe("When it is turned off after having readings", () => {
    it("Then the reading is forgotten and it stops listening", () => {
      const { rerender } = render(<Probe isEnabled />);
      tilt(90, 0);

      rerender(<Probe isEnabled={false} />);
      tilt(10, 10);

      expect(screen.getByText("sin datos")).toBeInTheDocument();
    });
  });
});
