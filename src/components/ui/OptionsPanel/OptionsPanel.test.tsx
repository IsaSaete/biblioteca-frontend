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
      <OptionsPanel
        open={panel.isOpen}
        title="Ordenar por"
        anchorEl={panel.anchorEl}
        onClose={panel.close}
        showCloseButton={showCloseButton}
      >
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
