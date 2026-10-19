import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../../theme/theme";
import ThemeSelector from "./ThemeSelector";

const renderSelector = () => {
  render(
    <ThemeProvider theme={theme}>
      <ThemeSelector />
    </ThemeProvider>,
  );

  return userEvent.setup();
};

describe("Given the theme selector in the profile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("When the user has not chosen a theme", () => {
    it("Then it follows the system", () => {
      renderSelector();

      expect(screen.getByRole("button", { name: /Tema/ })).toHaveTextContent(
        "Sistema",
      );
    });
  });

  describe("When the user opens the selector", () => {
    it("Then the three options are offered with the current one selected", async () => {
      const user = renderSelector();

      await user.click(screen.getByRole("button", { name: /Tema/ }));

      const options = await screen.findAllByRole("radio");
      expect(options.map((option) => option.getAttribute("value"))).toEqual([
        "light",
        "dark",
        "system",
      ]);
      expect(screen.getByRole("radio", { name: "Sistema" })).toBeChecked();
    });
  });

  describe("When the user chooses the dark theme", () => {
    it("Then the choice is applied, remembered and shown in the row", async () => {
      const user = renderSelector();
      await user.click(screen.getByRole("button", { name: /Tema/ }));

      await user.click(await screen.findByRole("radio", { name: "Oscuro" }));

      expect(localStorage.getItem("mui-mode")).toBe("dark");
      expect(document.documentElement).toHaveAttribute("data-dark");
      expect(
        await screen.findByRole("button", { name: /Tema/ }),
      ).toHaveTextContent("Oscuro");
    });
  });

  describe("When the user chooses the light theme after the dark one", () => {
    it("Then the light theme is applied", async () => {
      const user = renderSelector();
      await user.click(screen.getByRole("button", { name: /Tema/ }));
      await user.click(await screen.findByRole("radio", { name: "Oscuro" }));
      await user.click(await screen.findByRole("button", { name: /Tema/ }));

      await user.click(await screen.findByRole("radio", { name: "Claro" }));

      expect(document.documentElement).toHaveAttribute("data-light");
      expect(document.documentElement).not.toHaveAttribute("data-dark");
    });
  });
});
