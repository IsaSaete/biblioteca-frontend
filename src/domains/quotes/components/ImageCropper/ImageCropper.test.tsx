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

// La foto mide 200×400 px en pantalla (jsdom no hace maquetación).
const stubArea = (area: HTMLElement) => {
  area.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 400 }) as DOMRect;
};

const stubCapture = (element: HTMLElement) => {
  element.setPointerCapture = vi.fn();
  element.hasPointerCapture = vi.fn().mockReturnValue(true);
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
    it("Then it keeps its distance to the finger instead of jumping to it", () => {
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={vi.fn()}
          onRetake={vi.fn()}
        />,
      );
      const handle = screen.getByRole("slider", { name: "Borde izquierdo" });
      stubArea(handle.parentElement as HTMLElement);
      stubCapture(handle);

      // El borde está en el 8 %: se agarra un poco a su derecha (15 %) y se
      // mueve 10 puntos más allá.
      fireEvent.pointerDown(handle, { pointerId: 1, clientX: 30, clientY: 0 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 50, clientY: 0 });

      expect(handle).toHaveAttribute("aria-valuenow", "18");
    });
  });

  describe("When the user drags a corner", () => {
    it("Then the two edges that meet there move together", () => {
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={vi.fn()}
          onRetake={vi.fn()}
        />,
      );
      const corner = screen.getByTestId("crop-corner-topLeft");
      stubArea(corner.parentElement as HTMLElement);
      stubCapture(corner);

      fireEvent.pointerDown(corner, { pointerId: 1, clientX: 16, clientY: 60 });
      fireEvent.pointerMove(corner, {
        pointerId: 1,
        clientX: 36,
        clientY: 100,
      });

      expect(
        screen.getByRole("slider", { name: "Borde izquierdo" }),
      ).toHaveAttribute("aria-valuenow", "18");
      expect(
        screen.getByRole("slider", { name: "Borde superior" }),
      ).toHaveAttribute("aria-valuenow", "25");
    });
  });

  describe("When the user drags the inside of the frame", () => {
    it("Then the whole frame moves and keeps its size", () => {
      render(
        <ImageCropper
          image={buildImage()}
          onConfirm={vi.fn()}
          onRetake={vi.fn()}
        />,
      );
      const body = screen.getByTestId("crop-body");
      stubArea(body.parentElement as HTMLElement);
      stubCapture(body);

      fireEvent.pointerDown(body, { pointerId: 1, clientX: 100, clientY: 200 });
      fireEvent.pointerMove(body, { pointerId: 1, clientX: 110, clientY: 240 });

      expect(
        screen.getByRole("slider", { name: "Borde izquierdo" }),
      ).toHaveAttribute("aria-valuenow", "13");
      expect(
        screen.getByRole("slider", { name: "Borde derecho" }),
      ).toHaveAttribute("aria-valuenow", "97");
      expect(
        screen.getByRole("slider", { name: "Borde superior" }),
      ).toHaveAttribute("aria-valuenow", "25");
      expect(
        screen.getByRole("slider", { name: "Borde inferior" }),
      ).toHaveAttribute("aria-valuenow", "95");
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
