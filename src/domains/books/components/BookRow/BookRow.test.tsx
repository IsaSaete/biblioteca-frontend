import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { LibraryBook } from "../../dto/LibraryBook";
import BookRow from "./BookRow";

const book: LibraryBook = {
  id: "book-1",
  title: "El mundo amarillo",
  authors: ["Albert Espinosa"],
  publisher: "Debolsillo",
  ejemplarId: "ejemplar-1",
  status: "reading",
  favorite: false,
};

const renderRow = (loan?: LibraryBook["loan"]) =>
  render(
    <MemoryRouter>
      <ul>
        <BookRow book={{ ...book, loan }} />
      </ul>
    </MemoryRouter>,
  );

describe("Given a book row", () => {
  describe("When the book is lent", () => {
    it("Then it shows who has it", () => {
      renderRow({ borrowerName: "maría", lentAt: "2026-11-03T10:00:00.000Z" });

      expect(screen.getByText("Prestado a María")).toBeInTheDocument();
    });
  });

  describe("When the book is not lent", () => {
    it("Then it shows no loan line", () => {
      renderRow();

      expect(screen.queryByText(/Prestado a/)).not.toBeInTheDocument();
    });
  });
});
