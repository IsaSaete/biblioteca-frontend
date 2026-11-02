import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import theme from "../../../../theme/theme";
import ThemeSwitch from "./ThemeSwitch";

const renderSwitch = () => {
  render(
    <ThemeProvider theme={theme}>
      <ThemeSwitch />
    </ThemeProvider>,
  );

  return userEvent.setup();
};

describe("Given the theme switch of the landing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("When the visitor has not chosen a theme", () => {
    it("Then it offers the dark mode, because the system one is light", () => {
      renderSwitch();

      expect(
        screen.getByRole("button", { name: "Cambiar al modo oscuro" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the visitor switches to the dark mode", () => {
    it("Then it is applied, remembered and the button offers the light mode", async () => {
      const user = renderSwitch();

      await user.click(
        screen.getByRole("button", { name: "Cambiar al modo oscuro" }),
      );

      expect(localStorage.getItem("mui-mode")).toBe("dark");
      expect(document.documentElement).toHaveAttribute("data-dark");
      expect(
        await screen.findByRole("button", { name: "Cambiar al modo claro" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the visitor switches back to the light mode", () => {
    it("Then the light mode is remembered", async () => {
      const user = renderSwitch();
      await user.click(
        screen.getByRole("button", { name: "Cambiar al modo oscuro" }),
      );

      await user.click(
        await screen.findByRole("button", { name: "Cambiar al modo claro" }),
      );

      expect(localStorage.getItem("mui-mode")).toBe("light");
    });
  });
});
