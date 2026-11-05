import { fireEvent, render, screen } from "@testing-library/react";
import LoanDialog from "./LoanDialog";

const renderDialog = () =>
  render(
    <LoanDialog
      open
      title="Prestar este libro"
      isPending={false}
      hasFailed={false}
      onSave={vi.fn()}
      onCancel={vi.fn()}
    />,
  );

describe("Given the loan dialog", () => {
  describe("When the user presses «Guardar» or «Cancelar» with the keyboard open", () => {
    it("Then the field keeps the focus, so the first tap is the one that counts", async () => {
      renderDialog();
      const field = await screen.findByLabelText("¿A quién se lo prestas?");
      fireEvent.change(field, { target: { value: "María" } });

      const saveNotPrevented = fireEvent.mouseDown(
        screen.getByRole("button", { name: "Guardar" }),
      );
      const cancelNotPrevented = fireEvent.mouseDown(
        screen.getByRole("button", { name: "Cancelar" }),
      );

      expect(saveNotPrevented).toBe(false);
      expect(cancelNotPrevented).toBe(false);
    });
  });
});
