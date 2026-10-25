import Backdrop from "@mui/material/Backdrop";
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
