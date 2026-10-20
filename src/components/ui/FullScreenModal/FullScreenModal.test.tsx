import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FullScreenModal from "./FullScreenModal";

describe("Given a full screen modal", () => {
  describe("When it has no close handler", () => {
    it("Then it is a labelled dialog without a close button", () => {
      render(
        <FullScreenModal titleId="title">
          <h1 id="title">Título</h1>
        </FullScreenModal>,
      );

      expect(
        screen.getByRole("dialog", { name: "Título" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Cerrar" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When it has a close handler and the user presses the close button", () => {
    it("Then the handler is called", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(
        <FullScreenModal titleId="title" onClose={onClose}>
          <h1 id="title">Título</h1>
        </FullScreenModal>,
      );

      await user.click(screen.getByRole("button", { name: "Cerrar" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("When it has a back handler and the user presses the back button", () => {
    it("Then the handler is called and there is no close button", async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(
        <FullScreenModal titleId="title" onBack={onBack}>
          <h1 id="title">Título</h1>
        </FullScreenModal>,
      );

      await user.click(screen.getByRole("button", { name: "Volver" }));

      expect(onBack).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole("button", { name: "Cerrar" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When it has both a back and a close handler", () => {
    it("Then both buttons are in a header above the content, back first", () => {
      render(
        <FullScreenModal titleId="title" onBack={vi.fn()} onClose={vi.fn()}>
          <h1 id="title">Título</h1>
        </FullScreenModal>,
      );

      const back = screen.getByRole("button", { name: "Volver" });
      const close = screen.getByRole("button", { name: "Cerrar" });
      const heading = screen.getByRole("heading", { name: "Título" });

      expect(
        back.compareDocumentPosition(close) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        close.compareDocumentPosition(heading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(getComputedStyle(back).position).not.toBe("absolute");
      expect(getComputedStyle(close).position).not.toBe("absolute");
    });
  });
});
