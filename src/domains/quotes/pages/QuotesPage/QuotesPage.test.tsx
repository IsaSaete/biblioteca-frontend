import { screen, waitFor, within } from "@testing-library/react";
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
        await screen.findByRole("button", { name: /El principito/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user clears the filter", () => {
    it("Then every quote is back", async () => {
      mockFeed();

      const { user } = renderRoutes(routes, ["/quotes?bookId=book-2"]);
      await user.click(
        await screen.findByRole("button", { name: /El principito/ }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Todos los libros" }),
      );

      expect(
        await screen.findByText("La guerra es la paz"),
      ).toBeInTheDocument();
    });
  });

  describe("When the user has many books with quotes", () => {
    it("Then the filter lists only the most quoted ones and finds the rest by searching", async () => {
      server.use(
        http.get(`${baseUrl}/quotes/books`, () =>
          HttpResponse.json({
            items: [
              ...Array.from({ length: 7 }, (_, index) => ({
                bookId: `book-${index}`,
                title: `Libro ${index}`,
                count: 7 - index,
              })),
              { bookId: "book-x", title: "El principito", count: 1 },
            ],
          }),
        ),
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      const { user } = renderRoutes(routes, ["/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: /Todos los libros/ }),
      );
      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por libro",
      });

      expect(within(sheet).getAllByRole("button")).toHaveLength(6);
      expect(
        within(sheet).getByText(
          "Escribe para buscar entre el resto de tus libros.",
        ),
      ).toBeInTheDocument();
      expect(
        within(sheet).queryByRole("button", { name: /El principito/ }),
      ).not.toBeInTheDocument();

      await user.type(within(sheet).getByLabelText("Buscar un libro"), "princ");

      expect(
        within(sheet).getByRole("button", { name: /El principito/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user has few books with quotes", () => {
    it("Then the filter still has the search box and lists them all", async () => {
      mockFeed();

      const { user } = renderRoutes(routes, ["/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: /Todos los libros/ }),
      );

      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por libro",
      });
      expect(
        within(sheet).getByLabelText("Buscar un libro"),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: /1984/ }),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: /El principito/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user has quotes without a book", () => {
    const loose = {
      id: "q9",
      text: "Cita suelta",
      source: "Paper de Historia",
      createdAt: "2026-10-22T10:00:00.000Z",
    };

    it("Then the feed shows the source in place of the book and the filter lists Sin libro", async () => {
      const requests: string[] = [];
      server.use(
        http.get(`${baseUrl}/quotes/books`, () =>
          HttpResponse.json({ items: quoteBooks, unlinkedCount: 1 }),
        ),
        http.get(`${baseUrl}/quotes`, ({ request }) => {
          const url = new URL(request.url);
          requests.push(url.searchParams.get("unlinked") ?? "");
          const unlinked = url.searchParams.get("unlinked") === "true";

          return HttpResponse.json({
            items: unlinked
              ? [loose]
              : [loose, quote("q1", "Con libro", "book-1", "1984")],
            nextCursor: null,
            total: unlinked ? 1 : 2,
          });
        }),
      );

      const { user } = renderRoutes(routes, ["/quotes"]);
      expect(await screen.findByText("Cita suelta")).toBeInTheDocument();
      expect(screen.getByText("Paper de Historia")).toBeInTheDocument();
      await user.click(
        await screen.findByRole("button", { name: /Todos los libros/ }),
      );
      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por libro",
      });
      await user.click(
        within(sheet).getByRole("button", { name: /Sin libro/ }),
      );

      await waitFor(() => expect(requests.at(-1)).toBe("true"));
      expect(screen.queryByText("Con libro")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Sin libro/ }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user adds a quote to one of their books", () => {
    it("Then it searches their library, writes the quote and sends it with that book", async () => {
      let body: unknown;
      const searches: (string | null)[] = [];
      mockFeed();
      server.use(
        http.get(`${baseUrl}/books`, ({ request }) => {
          searches.push(new URL(request.url).searchParams.get("search"));
          return HttpResponse.json({
            items: [
              {
                book: {
                  id: "book-1",
                  title: "1984",
                  authors: ["George Orwell"],
                  publisher: "Debolsillo",
                },
                ejemplar: {
                  id: "ejemplar-1",
                  bookId: "book-1",
                  status: "reading",
                  createdAt: "2026-10-20T10:00:00.000Z",
                },
              },
              {
                book: {
                  id: "book-2",
                  title: "El principito",
                  authors: ["Saint-Exupéry"],
                  publisher: "Salamandra",
                },
                ejemplar: {
                  id: "ejemplar-2",
                  bookId: "book-2",
                  status: "read",
                  createdAt: "2026-10-20T10:00:00.000Z",
                },
              },
            ],
            nextCursor: null,
          });
        }),
        http.post(`${baseUrl}/quotes`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ quote: {} }, { status: 201 });
        }),
      );

      const { user } = renderRoutes(routes, ["/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: "+ Añadir cita" }),
      );
      await user.type(
        await screen.findByLabelText("Buscar un libro"),
        "orwell",
      );

      expect(
        screen.queryByRole("button", { name: /El principito/ }),
      ).not.toBeInTheDocument();
      await waitFor(() => expect(searches).toContain("orwell"));
      await user.click(await screen.findByRole("button", { name: /1984/ }));
      await user.click(
        await screen.findByRole("button", { name: "Escribir manualmente" }),
      );
      await user.type(screen.getByLabelText("Cita"), "Una cita");
      expect(
        screen.queryByLabelText("Fuente (opcional)"),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Guardar cita" }));

      await waitFor(() =>
        expect(body).toEqual({
          ejemplarId: "ejemplar-1",
          text: "Una cita",
          origin: "manual",
        }),
      );
    });
  });

  describe("When the user adds a quote without a book", () => {
    it("Then it asks for an optional source and sends no ejemplarId", async () => {
      let body: unknown;
      mockFeed();
      server.use(
        http.get(`${baseUrl}/books`, () =>
          HttpResponse.json({ items: [], nextCursor: null }),
        ),
        http.post(`${baseUrl}/quotes`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ quote: {} }, { status: 201 });
        }),
      );

      const { user } = renderRoutes(routes, ["/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: "+ Añadir cita" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Cita sin libro" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Escribir manualmente" }),
      );
      await user.type(screen.getByLabelText("Cita"), "Una cita suelta");
      await user.type(
        screen.getByLabelText("Fuente (opcional)"),
        "Paper de Historia",
      );
      await user.click(screen.getByRole("button", { name: "Guardar cita" }));

      await waitFor(() =>
        expect(body).toEqual({
          text: "Una cita suelta",
          source: "Paper de Historia",
          origin: "manual",
        }),
      );
    });
  });
});
