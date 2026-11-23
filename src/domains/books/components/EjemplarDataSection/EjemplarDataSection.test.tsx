import { screen } from "@testing-library/react";
import { renderRoutes } from "../../../../test/renderRoutes";
import type { LibraryBook } from "../../dto/LibraryBook";
import EjemplarDataSection from "./EjemplarDataSection";

const book: LibraryBook = {
  id: "book-1",
  title: "El mundo amarillo",
  authors: ["Albert Espinosa"],
  publisher: "Debolsillo",
  ejemplarId: "ejemplar-1",
  status: "pending",
  favorite: false,
};

const renderSection = (overrides: Partial<LibraryBook> = {}) => {
  const onEdit = vi.fn();
  const view = renderRoutes(
    [
      {
        path: "/",
        element: (
          <EjemplarDataSection
            book={{ ...book, ...overrides }}
            onEdit={onEdit}
          />
        ),
      },
    ],
    ["/"],
  );

  return { ...view, onEdit };
};

describe("Given the ejemplar data section of a book", () => {
  describe("When the ejemplar has no data", () => {
    it("Then it offers Añadir datos and tapping it asks to edit", async () => {
      const { user, onEdit } = renderSection();

      await user.click(screen.getByRole("button", { name: "Añadir datos" }));

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole("button", { name: "Editar datos de tu ejemplar" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the ejemplar already has some data", () => {
    it("Then it offers Editar instead and tapping it asks to edit", async () => {
      const { user, onEdit } = renderSection({ location: "salón" });

      expect(screen.getByText("Salón")).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", { name: "Editar datos de tu ejemplar" }),
      );

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole("button", { name: "Añadir datos" }),
      ).not.toBeInTheDocument();
    });
  });
});
