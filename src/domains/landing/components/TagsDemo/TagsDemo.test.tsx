import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import theme from "../../../../theme/theme";
import TagsDemo from "./TagsDemo";

const renderDemo = () => {
  render(
    <ThemeProvider theme={theme}>
      <TagsDemo />
    </ThemeProvider>,
  );

  return userEvent.setup();
};

describe("Given the tags demo of the landing", () => {
  describe("When it is shown", () => {
    it("Then every book is selected and nothing is announced yet", () => {
      renderDemo();

      expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(
        screen.getByText("Prueba: toca una etiqueta."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    });
  });

  describe("When the visitor taps a tag", () => {
    it("Then only that tag is pressed and the result is announced", async () => {
      const user = renderDemo();

      await user.click(screen.getByRole("button", { name: "Favoritos" }));

      expect(screen.getByRole("button", { name: "Favoritos" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      expect(
        screen.getByText("Mostrando los favoritos: 2 libros."),
      ).toBeInTheDocument();
    });
  });

  describe("When the visitor goes back to all the books", () => {
    it("Then the full count is announced", async () => {
      const user = renderDemo();

      await user.click(screen.getByRole("button", { name: "ensayo" }));
      await user.click(screen.getByRole("button", { name: "Todos" }));

      expect(
        screen.getByText("Mostrando todos los libros: 9 libros."),
      ).toBeInTheDocument();
    });
  });
});
