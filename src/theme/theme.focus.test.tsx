import { ThemeProvider } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import theme from "./theme";

describe("Given a button made with the base component of MUI", () => {
  describe("When it receives the focus with the keyboard", () => {
    it("Then it shows a focus outline", async () => {
      render(
        <ThemeProvider theme={theme}>
          <ButtonBase>Abrir</ButtonBase>
        </ThemeProvider>,
      );

      await userEvent.tab();

      const button = screen.getByRole("button", { name: "Abrir" });
      expect(button).toHaveFocus();
      expect(getComputedStyle(button).outline).toContain("2px solid");
    });
  });
});
