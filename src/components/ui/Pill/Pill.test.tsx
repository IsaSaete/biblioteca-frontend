import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";
import Pill from "./Pill";

const renderPill = (props: Partial<Parameters<typeof Pill>[0]> = {}) => {
  const onClick = vi.fn();
  render(
    <ThemeProvider theme={theme}>
      <Pill label="Leyendo" onClick={onClick} {...props} />
    </ThemeProvider>,
  );
  return { onClick, pill: screen.getByRole("button", { name: "Leyendo" }) };
};

describe("Given a pill", () => {
  describe("When it is a plain action without selected state", () => {
    it("Then it is not a toggle and calls the handler when pressed", async () => {
      const { pill, onClick } = renderPill();

      await userEvent.click(pill);

      expect(pill).not.toHaveAttribute("aria-pressed");
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("When it is a toggle", () => {
    it.each([true, false])(
      "Then aria-pressed reflects selected=%s",
      (selected) => {
        const { pill } = renderPill({ selected, tone: "success" });

        expect(pill).toHaveAttribute("aria-pressed", String(selected));
      },
    );

    it("Then it keeps the same border width selected or not, so it never changes shape", () => {
      const selected = renderPill({ selected: true, tone: "accent" });
      const selectedBorder = getComputedStyle(selected.pill).borderWidth;
      document.body.innerHTML = "";

      const unselected = renderPill({ selected: false, tone: "accent" });

      expect(getComputedStyle(unselected.pill).borderWidth).toBe(
        selectedBorder,
      );
    });
  });

  describe("When it takes the full width", () => {
    it("Then it fills its container", () => {
      const { pill } = renderPill({ fullWidth: true });

      expect(getComputedStyle(pill).width).toBe("100%");
    });
  });
});
