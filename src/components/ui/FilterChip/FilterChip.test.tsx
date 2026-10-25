import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterChip from "./FilterChip";

describe("Given a filter chip", () => {
  describe("When it is a toggle", () => {
    it("Then it tells whether it is selected and reacts to a click", async () => {
      const onClick = vi.fn();
      render(
        <FilterChip label="Poesía" count={2} selected onClick={onClick} />,
      );

      const chip = screen.getByRole("button", { name: "Poesía 2" });
      await userEvent.click(chip);

      expect(chip).toHaveAttribute("aria-pressed", "true");
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe("When it is the chip of an active filter", () => {
    it("Then it is announced as the action of removing that filter", async () => {
      const onClick = vi.fn();
      render(
        <FilterChip label="Poesía" selected removable onClick={onClick} />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: "Quitar el filtro Poesía" }),
      );

      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});
