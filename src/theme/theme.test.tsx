import Backdrop from "@mui/material/Backdrop";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";
import { render } from "@testing-library/react";
import theme from "./theme";

const renderBackdrop = (invisible: boolean) => {
  render(
    <ThemeProvider theme={theme}>
      <Backdrop open invisible={invisible} data-testid="backdrop" />
    </ThemeProvider>,
  );

  return document.querySelector<HTMLElement>("[data-testid='backdrop']");
};

describe("Given the scrim behind sheets, panels and dialogs", () => {
  describe("When a backdrop is visible", () => {
    it("Then it darkens the page with a soft 40% veil", () => {
      const backdrop = renderBackdrop(false);

      expect(backdrop && getComputedStyle(backdrop).backgroundColor).toBe(
        "rgba(0, 0, 0, 0.4)",
      );
    });
  });

  describe("When a backdrop is invisible", () => {
    it("Then it adds no veil", () => {
      const backdrop = renderBackdrop(true);

      expect(backdrop && getComputedStyle(backdrop).backgroundColor).toMatch(
        /^(transparent|rgba\(0, 0, 0, 0\))$/,
      );
    });
  });
});

describe("Given the text fields", () => {
  describe("When the browser autofills one with a saved password", () => {
    it("Then the theme keeps the field background instead of the blue autofill one", () => {
      render(
        <ThemeProvider theme={theme}>
          <TextField label="Email" />
        </ThemeProvider>,
      );

      const styles = Array.from(document.querySelectorAll("style"))
        .map((style) => style.textContent)
        .join("");
      expect(styles).toContain(":-webkit-autofill");
      expect(styles).toContain("-webkit-text-fill-color");
      expect(styles).toContain("-webkit-background-clip");
    });
  });
});
