import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setDesktopViewport } from "../../../test/setDesktopViewport";
import ConfirmDialog from "./ConfirmDialog";

const renderDialog = (overrides: { isPending?: boolean } = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  render(
    <>
      <button type="button">Fuera del diálogo</button>
      <ConfirmDialog
        open
        title="¿Eliminar este libro?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        pendingLabel="Eliminando…"
        isPending={overrides.isPending ?? false}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>,
  );

  return { onConfirm, onCancel };
};

afterEach(() => setDesktopViewport(false));

describe("Given a confirmation of a destructive action", () => {
  describe("When it opens on a small screen", () => {
    it("Then it is a bottom sheet with the confirm and cancel buttons", async () => {
      setDesktopViewport(false);

      const { onConfirm } = renderDialog();
      const sheet = await screen.findByRole("dialog", {
        name: "¿Eliminar este libro?",
      });
      await userEvent.click(
        screen.getByRole("button", { name: "Sí, eliminar" }),
      );

      expect(sheet).toHaveTextContent("Esta acción no se puede deshacer.");
      expect(onConfirm).toHaveBeenCalledOnce();
    });
  });

  describe("When it opens on a tablet or a desktop", () => {
    beforeEach(() => setDesktopViewport(true));

    it("Then it is a centered alert dialog with the focus on «Cancelar»", async () => {
      renderDialog();

      const dialog = await screen.findByRole("alertdialog", {
        name: "¿Eliminar este libro?",
      });

      expect(dialog).toHaveAccessibleDescription(
        "Esta acción no se puede deshacer.",
      );
      expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    });

    it("Then Escape cancels and «Sí, eliminar» confirms", async () => {
      const { onConfirm, onCancel } = renderDialog();

      await screen.findByRole("alertdialog");
      await userEvent.keyboard("{Escape}");
      await userEvent.click(
        screen.getByRole("button", { name: "Sí, eliminar" }),
      );

      expect(onCancel).toHaveBeenCalledOnce();
      expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("Then the keyboard cannot reach the page behind", async () => {
      renderDialog();
      const dialog = await screen.findByRole("alertdialog");

      for (let step = 0; step < 5; step += 1) {
        await userEvent.tab();
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
      }
      for (let step = 0; step < 5; step += 1) {
        await userEvent.tab({ shift: true });
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
      }
    });

    it("Then it disables both buttons while the action is in progress", async () => {
      renderDialog({ isPending: true });

      await screen.findByRole("alertdialog");

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Eliminando…" }),
        ).toBeDisabled(),
      );
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    });
  });
});
