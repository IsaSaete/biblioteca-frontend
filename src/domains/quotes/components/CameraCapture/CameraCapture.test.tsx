import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CameraCapture from "./CameraCapture";

const camera = vi.hoisted(() => ({ useCameraStream: vi.fn() }));
const requestMotionPermission = vi.hoisted(() => vi.fn());

vi.mock("../../../../hooks/useCameraStream", () => camera);
vi.mock("../../../../utils/motionPermission", () => ({
  requestMotionPermission,
}));

const stubCamera = (status: "starting" | "ready" | "denied" | "failed") =>
  camera.useCameraStream.mockReturnValue({
    videoRef: { current: null },
    status,
    retry: vi.fn(),
  });

const tilt = (beta: number, gamma: number) =>
  act(() => {
    const event = new Event("deviceorientation");
    Object.assign(event, { beta, gamma });
    window.dispatchEvent(event);
  });

const renderCamera = () =>
  render(<CameraCapture onCapture={vi.fn()} onWrite={vi.fn()} />);

describe("Given the camera to photograph a quote", () => {
  beforeEach(() => {
    stubCamera("ready");
    requestMotionPermission.mockReset().mockResolvedValue("granted");
  });

  describe("When the camera is ready", () => {
    it("Then it advises about light, shadows and pencil underlining, and offers the level off", () => {
      renderCamera();

      expect(screen.getByText(/buena luz, sin sombras/)).toBeInTheDocument();
      expect(
        screen.getByText(/subrayado a lápiz confunde/),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Nivel" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("When the camera could not be opened", () => {
    it("Then there is neither the level nor the advice", () => {
      stubCamera("denied");

      renderCamera();

      expect(
        screen.queryByRole("button", { name: "Nivel" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/buena luz/)).not.toBeInTheDocument();
    });
  });

  describe("When the level is turned on and the phone is straight", () => {
    it("Then it asks the orientation permission and announces it is level", async () => {
      const user = userEvent.setup();
      renderCamera();

      await user.click(screen.getByRole("button", { name: "Nivel" }));
      tilt(90, 0);

      expect(requestMotionPermission).toHaveBeenCalledWith("orientation");
      expect(screen.getByRole("button", { name: "Nivel" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(await screen.findByText("Nivelado.")).toBeInTheDocument();
    });

    it("Then it does not announce it while the phone is rotated", async () => {
      const user = userEvent.setup();
      renderCamera();
      await user.click(screen.getByRole("button", { name: "Nivel" }));

      tilt(90, 12);

      expect(screen.queryByText("Nivelado.")).not.toBeInTheDocument();
    });

    it("Then pressing the button again turns it off", async () => {
      const user = userEvent.setup();
      renderCamera();
      await user.click(screen.getByRole("button", { name: "Nivel" }));
      tilt(90, 0);

      await user.click(screen.getByRole("button", { name: "Nivel" }));

      expect(screen.getByRole("button", { name: "Nivel" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      expect(screen.queryByText("Nivelado.")).not.toBeInTheDocument();
    });
  });

  describe("When the user refuses the permission", () => {
    it("Then it says the level cannot work and stays off", async () => {
      requestMotionPermission.mockResolvedValue("denied");
      const user = userEvent.setup();
      renderCamera();

      await user.click(screen.getByRole("button", { name: "Nivel" }));

      expect(
        await screen.findByText(/Sin permiso para notar la inclinación/),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Nivel" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("When the device has no tilt sensor", () => {
    it("Then it says so right away", async () => {
      requestMotionPermission.mockResolvedValue("unsupported");
      const user = userEvent.setup();
      renderCamera();

      await user.click(screen.getByRole("button", { name: "Nivel" }));

      expect(
        await screen.findByText(
          "Este dispositivo no tiene sensor de inclinación.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("When the level is on but no reading ever arrives (a computer)", () => {
    it("Then after a moment it turns off and says why", async () => {
      vi.useFakeTimers();

      try {
        renderCamera();

        fireEvent.click(screen.getByRole("button", { name: "Nivel" }));
        // Primero se resuelve el permiso y se enciende el nivel; después, sin
        // ninguna lectura, pasa el tiempo de espera.
        await act(async () => {
          await Promise.resolve();
        });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(2000);
        });

        expect(
          screen.getByText(/No recibo la inclinación de este dispositivo/),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Nivel" })).toHaveAttribute(
          "aria-pressed",
          "false",
        );
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
