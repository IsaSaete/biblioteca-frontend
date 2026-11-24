import { screen } from "@testing-library/react";
import { renderRoutes } from "../../../../test/renderRoutes";
import type { Quote } from "../../dto/Quote";
import QuoteCard from "./QuoteCard";

const quote: Quote = {
  id: "quote-1",
  ejemplarId: "ejemplar-1",
  text: "Muchos años después, frente al pelotón de fusilamiento.",
  page: 9,
  createdAt: "2026-11-21T10:00:00.000Z",
  book: {
    id: "book-1",
    title: "Cien años de soledad",
    authors: ["Gabriel García Márquez"],
  },
};

const renderCard = (quoteToShow: Quote, showBook?: boolean) =>
  renderRoutes(
    [
      {
        path: "/",
        element: <QuoteCard quote={quoteToShow} showBook={showBook} />,
      },
    ],
    ["/"],
  );

describe("Given a quote card", () => {
  describe("When the quote has a book", () => {
    it("Then the footer shows the author, the title in italics below it and the page", () => {
      renderCard(quote);

      const card = screen.getByRole("link");
      expect(screen.getByText("Gabriel García Márquez")).toBeInTheDocument();
      expect(screen.getByText("Cien años de soledad").tagName).toBe("EM");
      expect(card).toHaveTextContent("Pág. 9");
    });
  });

  describe("When the quote has no book but has a source", () => {
    it("Then the footer shows the source as it is", () => {
      const withoutBook: Quote = { ...quote, book: undefined };

      renderCard({ ...withoutBook, source: "Una carta de mi abuela" });

      const card = screen.getByRole("link");
      expect(card).toHaveTextContent("Una carta de mi abuela");
      expect(card).toHaveTextContent(/Guardada el \d+ nov 2026/);
    });
  });

  describe("When the quote has no book and no source", () => {
    it("Then the footer says when it was saved", () => {
      const withoutBook: Quote = { ...quote, book: undefined };

      renderCard(withoutBook);

      expect(screen.getByRole("link")).toHaveTextContent(
        /Guardada el \d+ nov 2026/,
      );
    });
  });

  describe("When the book is already shown around the card", () => {
    it("Then the footer does not repeat it, only the page", () => {
      renderCard(quote, false);

      expect(screen.getByRole("link")).not.toHaveTextContent(
        "Gabriel García Márquez",
      );
      expect(screen.getByRole("link")).toHaveTextContent("Pág. 9");
    });
  });
});
