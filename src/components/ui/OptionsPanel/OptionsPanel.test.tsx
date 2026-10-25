import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAnchoredPanel } from "../../../hooks/useAnchoredPanel";
import { setDesktopViewport } from "../../../test/setDesktopViewport";
import OptionsPanel from "./OptionsPanel";

const Harness = ({
  showCloseButton = false,
}: {
  showCloseButton?: boolean;
}) => {
  const panel = useAnchoredPanel();

  return (
    <>
      <button type="button" onClick={panel.open}>
        Abrir
      </button>
      <button type="button">Fuera del panel</button>
      <OptionsPanel
        open={panel.isOpen}
        title="Ordenar por"
        anchorEl={panel.anchorEl}
        onClose={panel.close}
        showCloseButton={showCloseButton}
      >
        <button type="button">Primera opción</button>
        <button type="button">Segunda opción</button>
        <p>Opciones</p>
      </OptionsPanel>
    </>
  );
};

afterEach(() => setDesktopViewport(false));

describe("Given an options panel", () => {
  describe("When it is opened on a small screen", () => {
    it("Then it is a bottom sheet with its title, and it can have a close button", async () => {
      setDesktopViewport(false);

      render(<Harness showCloseButton />);
      await userEvent.click(screen.getByRole("button", { name: "Abrir" }));

      const sheet = await screen.findByRole("dialog", { name: "Ordenar por" });
      expect(sheet).toHaveTextContent("Opciones");
      expect(
        screen.getByRole("button", { name: "Cerrar" }),
      ).toBeInTheDocument();
    });
  });

  describe.each([
    ["on a small screen", false],
    ["on a tablet or a desktop", true],
  ])("When it is open %s", (_name, isWide) => {
    it("Then the keyboard cannot reach the page behind, forwards or backwards", async () => {
      setDesktopViewport(isWide);

      render(<Harness />);
      await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
      const panel = await screen.findByRole("dialog", { name: "Ordenar por" });

      for (let step = 0; step < 6; step += 1) {
        await userEvent.tab();
        expect(panel).toContainElement(document.activeElement as HTMLElement);
      }
      for (let step = 0; step < 6; step += 1) {
        await userEvent.tab({ shift: true });
        expect(panel).toContainElement(document.activeElement as HTMLElement);
      }
    });

    it("Then the page behind is hidden from screen readers and focus returns to the button on closing", async () => {
      setDesktopViewport(isWide);

      render(<Harness />);
      const trigger = screen.getByRole("button", { name: "Abrir" });
      await userEvent.click(trigger);
      await screen.findByRole("dialog", { name: "Ordenar por" });

      expect(
        screen.queryByRole("button", { name: "Fuera del panel" }),
      ).not.toBeInTheDocument();

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  });

  describe("When it is opened on a tablet or a desktop", () => {
    it("Then it is a panel anchored to the button, without a close button", async () => {
      setDesktopViewport(true);

      render(<Harness showCloseButton />);
      await userEvent.click(screen.getByRole("button", { name: "Abrir" }));

      const panel = await screen.findByRole("dialog", { name: "Ordenar por" });
      expect(panel).toHaveTextContent("Opciones");
      expect(
        screen.queryByRole("button", { name: "Cerrar" }),
      ).not.toBeInTheDocument();
    });

    it("Then Escape closes it", async () => {
      setDesktopViewport(true);

      render(<Harness />);
      await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
      await screen.findByRole("dialog", { name: "Ordenar por" });
      await userEvent.keyboard("{Escape}");

      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Ordenar por" }),
        ).not.toBeInTheDocument(),
      );
    });
  });
});
