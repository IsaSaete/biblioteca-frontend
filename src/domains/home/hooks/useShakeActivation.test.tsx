import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readShakeSetting } from "../utils/shakeSetting";
import { useShakeActivation } from "./useShakeActivation";

const requestMotionPermission = vi.hoisted(() => vi.fn());

vi.mock("../../../utils/motionPermission", () => ({ requestMotionPermission }));

const Probe = () => {
  const { handleNavTap, notice } = useShakeActivation();

  return (
    <>
      <button type="button" onClick={() => handleNavTap("library")}>
        Biblioteca
      </button>
      <button type="button" onClick={() => handleNavTap("home")}>
        Inicio
      </button>
      <p role="status">{notice}</p>
    </>
  );
};

const tap = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  times: number,
) => {
  for (let count = 0; count < times; count += 1) {
    await user.click(screen.getByRole("button", { name }));
  }
};

describe("Given the secret taps on the navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    requestMotionPermission.mockReset().mockResolvedValue("granted");
  });

  describe("When Biblioteca is tapped five times in a row and the permission is granted", () => {
    it("Then the secret is activated and the user is told", async () => {
      const user = userEvent.setup();
      render(<Probe />);

      await tap(user, "Biblioteca", 5);

      expect(
        await screen.findByText(/Has encontrado un secreto/),
      ).toBeInTheDocument();
      expect(requestMotionPermission).toHaveBeenCalledTimes(1);
      expect(readShakeSetting()).toBe(true);
    });
  });

  describe("When Biblioteca is tapped fewer than five times", () => {
    it("Then nothing happens", async () => {
      const user = userEvent.setup();
      render(<Probe />);

      await tap(user, "Biblioteca", 4);

      expect(requestMotionPermission).not.toHaveBeenCalled();
      expect(readShakeSetting()).toBe(false);
    });
  });

  describe("When another section is tapped in the middle", () => {
    it("Then the count starts again", async () => {
      const user = userEvent.setup();
      render(<Probe />);

      await tap(user, "Biblioteca", 3);
      await tap(user, "Inicio", 1);
      await tap(user, "Biblioteca", 3);

      expect(requestMotionPermission).not.toHaveBeenCalled();
    });
  });

  describe("When the user refuses the permission", () => {
    it("Then it says it could not activate it and stays off", async () => {
      requestMotionPermission.mockResolvedValue("denied");
      const user = userEvent.setup();
      render(<Probe />);

      await tap(user, "Biblioteca", 5);

      expect(
        await screen.findByText(/falta el permiso para notar el movimiento/),
      ).toBeInTheDocument();
      expect(readShakeSetting()).toBe(false);
    });
  });

  describe("When the device has no motion sensor", () => {
    it("Then it says so and stays off", async () => {
      requestMotionPermission.mockResolvedValue("unsupported");
      const user = userEvent.setup();
      render(<Probe />);

      await tap(user, "Biblioteca", 5);

      await waitFor(() =>
        expect(
          screen.getByText("Este dispositivo no sabe notar el movimiento."),
        ).toBeInTheDocument(),
      );
      expect(readShakeSetting()).toBe(false);
    });
  });
});
