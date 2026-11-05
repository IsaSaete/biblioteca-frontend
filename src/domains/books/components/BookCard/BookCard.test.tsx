import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import BookCard from "./BookCard";

const book = {
  id: "book-1",
  title: "El mundo amarillo",
  authors: ["Albert Espinosa"],
};

const renderCard = (loan?: { borrowerName: string; lentAt: string }) =>
  render(
    <MemoryRouter>
      <ul>
        <BookCard book={{ ...book, loan }} />
      </ul>
    </MemoryRouter>,
  );

describe("Given a book card", () => {
  describe("When the book is lent", () => {
    it("Then screen readers hear who has it", () => {
      renderCard({
        borrowerName: "María",
        lentAt: "2026-11-03T10:00:00.000Z",
      });

      expect(
        screen.getByRole("link", { name: /Prestado a María/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When the book is not lent", () => {
    it("Then it says nothing about a loan", () => {
      renderCard();

      expect(screen.queryByText(/Prestado a/)).not.toBeInTheDocument();
    });
  });
});
