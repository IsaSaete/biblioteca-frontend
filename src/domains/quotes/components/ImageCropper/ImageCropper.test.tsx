import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageCropper from "./ImageCropper";

const drawImage = vi.fn();

const buildImage = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 2000;
  return canvas;
};

describe("Given the crop step of a captured photo", () => {
  beforeEach(() => {
    drawImage.mockReset();
    HTMLCanvasElement.prototype.getContext = vi
      .fn()
      .mockReturnValue({ drawImage });
  });

  describe("When the user confirms without touching the edges", () => {
    it("Then the photo is cropped with the default margins", async () => {
      const onConfirm = vi.fn();
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={onConfirm}
          onRetake={vi.fn()}
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: "Leer texto" }));

      const cropped = onConfirm.mock.calls[0]?.[0] as HTMLCanvasElement;
      expect(cropped.width).toBe(840);
      expect(cropped.height).toBe(1400);
    });
  });

  describe("When the user moves an edge with the keyboard", () => {
    it("Then that edge moves and the cropped zone changes", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={onConfirm}
          onRetake={vi.fn()}
        />,
      );
      const top = screen.getByRole("slider", { name: "Borde superior" });
      expect(top).toHaveAttribute("aria-valuenow", "15");

      top.focus();
      await user.keyboard("{ArrowUp}{ArrowUp}");
      await user.click(screen.getByRole("button", { name: "Leer texto" }));

      expect(top).toHaveAttribute("aria-valuenow", "11");
      const cropped = onConfirm.mock.calls[0]?.[0] as HTMLCanvasElement;
      expect(cropped.height).toBe(1480);
    });

    it("Then an edge ignores the arrows of the other axis", async () => {
      const user = userEvent.setup();
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={vi.fn()}
          onRetake={vi.fn()}
        />,
      );
      const left = screen.getByRole("slider", { name: "Borde izquierdo" });

      left.focus();
      await user.keyboard("{ArrowUp}");

      expect(left).toHaveAttribute("aria-valuenow", "8");
    });
  });

  describe("When the user drags an edge", () => {
    it("Then it follows the pointer", () => {
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={vi.fn()}
          onRetake={vi.fn()}
        />,
      );
      const handle = screen.getByRole("slider", { name: "Borde izquierdo" });
      const area = handle.parentElement as HTMLElement;
      area.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 200, height: 400 }) as DOMRect;
      handle.setPointerCapture = vi.fn();
      handle.hasPointerCapture = vi.fn().mockReturnValue(true);

      fireEvent.pointerDown(handle, { pointerId: 1 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 50, clientY: 0 });

      expect(handle).toHaveAttribute("aria-valuenow", "25");
    });
  });

  describe("When the user wants another photo", () => {
    it("Then it asks to retake it", async () => {
      const onRetake = vi.fn();
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={vi.fn()}
          onRetake={onRetake}
        />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: "Repetir foto" }),
      );

      expect(onRetake).toHaveBeenCalled();
    });
  });
});
