import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import QuotesPage from "./QuotesPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/quotes", element: <QuotesPage /> }];

const quote = (
  id: string,
  text: string,
  bookId = "book-1",
  title = "1984",
) => ({
  id,
  ejemplarId: "ejemplar-1",
  text,
  createdAt: "2026-10-22T10:00:00.000Z",
  book: { id: bookId, title, authors: ["Autor"] },
});

const quoteBooks = [
  { bookId: "book-2", title: "El principito", count: 1 },
  { bookId: "book-1", title: "1984", count: 2 },
];

const mockFeed = () => {
  const requestedBooks: (string | null)[] = [];
  server.use(
    http.get(`${baseUrl}/quotes/books`, () =>
      HttpResponse.json({ items: quoteBooks }),
    ),
    http.get(`${baseUrl}/quotes`, ({ request }) => {
      const bookId = new URL(request.url).searchParams.get("bookId");
      requestedBooks.push(bookId);
      const all = [
        quote("q3", "Lo esencial es invisible", "book-2", "El principito"),
        quote("q2", "La guerra es la paz"),
        quote("q1", "Siempre hemos estado en guerra"),
      ];
      const items = bookId
        ? all.filter((item) => item.book.id === bookId)
        : all;

      return HttpResponse.json({
        items,
        nextCursor: null,
        total: items.length,
      });
    }),
  );

  return requestedBooks;
};

describe("Given the quotes page", () => {
  describe("When the user has quotes", () => {
    it("Then it lists them all with the book of each one", async () => {
      mockFeed();

      renderRoutes(routes, ["/quotes"]);

      expect(
        await screen.findByText("Lo esencial es invisible"),
      ).toBeInTheDocument();
      expect(screen.getByText("La guerra es la paz")).toBeInTheDocument();
      expect(screen.getByText("El principito")).toBeInTheDocument();
    });
  });

  describe("When the user has no quotes", () => {
    it("Then it explains there are none and offers no filter", async () => {
      server.use(
        http.get(`${baseUrl}/quotes/books`, () =>
          HttpResponse.json({ items: [] }),
        ),
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      renderRoutes(routes, ["/quotes"]);

      expect(
        await screen.findByText("Todavía no tienes citas"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Todos los libros/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user filters by a book", () => {
    it("Then the sheet lists the books with their quote count and only that book's quotes remain", async () => {
      const requested = mockFeed();

      const { user } = renderRoutes(routes, ["/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: /Todos los libros/ }),
      );
      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por libro",
      });
      expect(within(sheet).getByText("2")).toBeInTheDocument();
      await user.click(within(sheet).getByRole("button", { name: /^1984/ }));

      expect(
        await screen.findByText("La guerra es la paz"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Lo esencial es invisible"),
      ).not.toBeInTheDocument();
      expect(requested.at(-1)).toBe("book-1");
      expect(screen.getByRole("button", { name: /1984/ })).toBeInTheDocument();
    });
  });

  describe("When the page opens with a book already filtered", () => {
    it("Then it shows that book in the filter and only its quotes", async () => {
      mockFeed();

      renderRoutes(routes, ["/quotes?bookId=book-2"]);

      expect(
        await screen.findByText("Lo esencial es invisible"),
      ).toBeInTheDocument();
      expect(screen.queryByText("La guerra es la paz")).not.toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: /El principito ⌄/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user clears the filter", () => {
    it("Then every quote is back", async () => {
      mockFeed();

      const { user } = renderRoutes(routes, ["/quotes?bookId=book-2"]);
      await user.click(
        await screen.findByRole("button", { name: /El principito ⌄/ }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Todos los libros" }),
      );

      expect(
        await screen.findByText("La guerra es la paz"),
      ).toBeInTheDocument();
    });
  });

  describe("When the user searches for a book in the filter", () => {
    it("Then only the matching books are listed", async () => {
      mockFeed();

      const { user } = renderRoutes(routes, ["/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: /Todos los libros/ }),
      );
      await user.type(await screen.findByLabelText("Buscar un libro"), "princ");

      const sheet = screen.getByRole("dialog", { name: "Filtrar por libro" });
      expect(
        within(sheet).getByRole("button", { name: /El principito/ }),
      ).toBeInTheDocument();
      expect(
        within(sheet).queryByRole("button", { name: /^1984/ }),
      ).not.toBeInTheDocument();
    });
  });
});
