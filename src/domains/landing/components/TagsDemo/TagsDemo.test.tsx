import { ThemeProvider } from "@mui/material/styles";
import { render, screen, within } from "@testing-library/react";
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

const openFilters = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Filtros" }));

  return screen.getByRole("dialog", { name: "Filtros" });
};

describe("Given the filters demo of the landing", () => {
  describe("When it is shown", () => {
    it("Then every book is visible, the sheet is closed and nothing is announced yet", () => {
      renderDemo();

      expect(screen.getByText("Prueba: pulsa Filtros.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Filtros" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByText("9 libros")).toBeInTheDocument();
      expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
    });
  });

  describe("When the visitor presses Filtros", () => {
    it("Then the same sheet as the app opens with its switches, tags and buttons", async () => {
      const user = renderDemo();

      const sheet = await openFilters(user);

      expect(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      ).toHaveAttribute("aria-checked", "false");
      expect(
        within(sheet).getByRole("switch", { name: "Prestados" }),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: /club de lectura/ }),
      ).toHaveTextContent("3");
      expect(
        within(sheet).getByRole("button", { name: /heredados/ }),
      ).toHaveTextContent("4");
      expect(
        within(sheet).getByRole("button", { name: "Ver 9 libros" }),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: "Limpiar" }),
      ).toBeDisabled();
      expect(
        within(sheet).getByRole("button", { name: "Cerrar filtros" }),
      ).toHaveFocus();
    });
  });

  describe("When the visitor turns on Favoritos", () => {
    it("Then the count updates, the result is announced and the list is filtered", async () => {
      const user = renderDemo();
      const sheet = await openFilters(user);

      await user.click(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      );

      expect(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      ).toHaveAttribute("aria-checked", "true");
      expect(
        within(sheet).getByRole("button", { name: "Ver 4 libros" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Mostrando los favoritos: 4 libros."),
      ).toBeInTheDocument();
      expect(screen.queryByText("Energy Flash")).not.toBeInTheDocument();
      expect(screen.getAllByText("1984").length).toBeGreaterThan(0);
    });
  });

  describe("When the visitor combines Prestados with a tag", () => {
    it("Then only the books that meet both remain", async () => {
      const user = renderDemo();
      const sheet = await openFilters(user);

      await user.click(
        within(sheet).getByRole("switch", { name: "Prestados" }),
      );
      await user.click(
        within(sheet).getByRole("button", { name: /club de lectura/ }),
      );

      expect(
        screen.getByText(
          "Mostrando los prestados y los de la etiqueta club de lectura: 2 libros.",
        ),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: /club de lectura/ }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("Then choosing another tag replaces the previous one, like the app", async () => {
      const user = renderDemo();
      const sheet = await openFilters(user);

      await user.click(
        within(sheet).getByRole("button", { name: /club de lectura/ }),
      );
      await user.click(within(sheet).getByRole("button", { name: /música/ }));

      expect(
        within(sheet).getByRole("button", { name: /club de lectura/ }),
      ).toHaveAttribute("aria-pressed", "false");
      expect(
        screen.getByText("Mostrando los de la etiqueta música: 2 libros."),
      ).toBeInTheDocument();
    });
  });

  describe("When no book meets what was chosen", () => {
    it("Then the button says so", async () => {
      const user = renderDemo();
      const sheet = await openFilters(user);

      await user.click(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      );
      await user.click(
        within(sheet).getByRole("switch", { name: "Prestados" }),
      );

      expect(
        within(sheet).getByRole("button", { name: "Ningún libro coincide" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the visitor presses Limpiar", () => {
    it("Then every filter is removed", async () => {
      const user = renderDemo();
      const sheet = await openFilters(user);
      await user.click(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      );

      await user.click(within(sheet).getByRole("button", { name: "Limpiar" }));

      expect(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      ).toHaveAttribute("aria-checked", "false");
      expect(
        screen.getByText("Mostrando todos los libros: 9 libros."),
      ).toBeInTheDocument();
    });
  });

  describe("When the visitor closes the sheet with a filter on", () => {
    it("Then the filter stays as a chip that removes it and focus goes back to Filtros", async () => {
      const user = renderDemo();
      const sheet = await openFilters(user);
      await user.click(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      );

      await user.click(
        within(sheet).getByRole("button", { name: "Ver 4 libros" }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Filtros" })).toHaveFocus();

      await user.click(
        screen.getByRole("button", { name: "Quitar el filtro Favoritos" }),
      );

      expect(
        screen.queryByRole("button", { name: "Quitar el filtro Favoritos" }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("9 libros")).toBeInTheDocument();
    });
  });

  describe("When the visitor presses Escape in the sheet", () => {
    it("Then it closes and focus goes back to Filtros", async () => {
      const user = renderDemo();
      await openFilters(user);

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Filtros" })).toHaveFocus();
    });
  });
});
