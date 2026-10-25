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
        await screen.findByRole("button", { name: "Añadir cita" }),
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
        await screen.findByRole("button", { name: "Añadir cita" }),
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

  describe("When the user orders the quotes", () => {
    const mockOrderedFeed = () => {
      const sorts: (string | null)[] = [];
      server.use(
        http.get(`${baseUrl}/quotes/books`, () =>
          HttpResponse.json({ items: quoteBooks, unlinkedCount: 0 }),
        ),
        http.get(`${baseUrl}/quotes`, ({ request }) => {
          sorts.push(new URL(request.url).searchParams.get("sort"));
          return HttpResponse.json({
            items: [quote("q1", "La guerra es la paz")],
            nextCursor: null,
            total: 1,
          });
        }),
      );
      return sorts;
    };

    it("Then the chosen order goes to the URL and to the request", async () => {
      const sorts = mockOrderedFeed();

      const { user, router } = renderRoutes(routes, ["/quotes"]);

      await user.click(
        await screen.findByRole("button", {
          name: "Ordenar por: Fecha: más recientes primero",
        }),
      );
      await user.click(
        await screen.findByRole("radio", {
          name: "Fecha: más antiguas primero",
        }),
      );

      expect(router.state.location.search).toBe("?sort=oldest");
      await waitFor(() => expect(sorts).toContain("oldest"));
      expect(
        await screen.findByRole("button", {
          name: "Ordenar por: Fecha: más antiguas primero",
        }),
      ).toBeInTheDocument();
    });

    it("Then it can group them by book from Z to A", async () => {
      const sorts = mockOrderedFeed();

      const { user, router } = renderRoutes(routes, ["/quotes"]);

      await user.click(
        await screen.findByRole("button", {
          name: "Ordenar por: Fecha: más recientes primero",
        }),
      );
      await user.click(
        await screen.findByRole("radio", { name: "Libro: de la Z a la A" }),
      );

      expect(router.state.location.search).toBe("?sort=book_desc");
      await waitFor(() => expect(sorts).toContain("book_desc"));
    });

    it("Then it can group them by book", async () => {
      const sorts = mockOrderedFeed();

      const { user, router } = renderRoutes(routes, ["/quotes"]);

      await user.click(
        await screen.findByRole("button", {
          name: "Ordenar por: Fecha: más recientes primero",
        }),
      );
      await user.click(
        await screen.findByRole("radio", { name: "Libro: de la A a la Z" }),
      );

      expect(router.state.location.search).toBe("?sort=book");
      await waitFor(() => expect(sorts).toContain("book"));
    });

    it("Then the book order is not offered once a book is chosen", async () => {
      mockOrderedFeed();

      const { user } = renderRoutes(routes, ["/quotes?bookId=book-1"]);

      await user.click(
        await screen.findByRole("button", {
          name: "Ordenar por: Fecha: más recientes primero",
        }),
      );

      expect(
        await screen.findByRole("radio", {
          name: "Fecha: más antiguas primero",
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("radio", { name: "Libro: de la A a la Z" }),
      ).not.toBeInTheDocument();
    });

    it("Then ordering by book puts a heading before each book and keeps the source of loose quotes", async () => {
      server.use(
        http.get(`${baseUrl}/quotes/books`, () =>
          HttpResponse.json({ items: quoteBooks, unlinkedCount: 1 }),
        ),
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({
            items: [
              quote("q1", "La guerra es la paz"),
              quote("q2", "Siempre hemos estado en guerra"),
              quote(
                "q3",
                "Lo esencial es invisible",
                "book-2",
                "El principito",
              ),
              {
                id: "q4",
                text: "Cita suelta",
                source: "Paper de Historia",
                createdAt: "2026-10-22T10:00:00.000Z",
              },
            ],
            nextCursor: null,
            total: 4,
          }),
        ),
      );

      renderRoutes(routes, ["/quotes?sort=book"]);

      const headings = await screen.findAllByRole("heading", { level: 3 });
      expect(headings.map((heading) => heading.textContent)).toEqual([
        "1984",
        "El principito",
        "Sin libro",
      ]);
      expect(screen.getByText("Paper de Historia")).toBeInTheDocument();
    });

    it("Then the order is kept when a book is chosen, except grouping by book", async () => {
      mockOrderedFeed();

      const { user, router } = renderRoutes(routes, ["/quotes?sort=oldest"]);
      await user.click(
        await screen.findByRole("button", { name: /Todos los libros/ }),
      );
      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por libro",
      });
      await user.click(within(sheet).getByRole("button", { name: /1984/ }));

      const params = new URLSearchParams(router.state.location.search);
      expect(params.get("bookId")).toBe("book-1");
      expect(params.get("sort")).toBe("oldest");
    });

    it("Then grouping by book is dropped when a book is chosen", async () => {
      mockOrderedFeed();

      const { user, router } = renderRoutes(routes, ["/quotes?sort=book"]);
      await user.click(
        await screen.findByRole("button", { name: /Todos los libros/ }),
      );
      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por libro",
      });
      await user.click(within(sheet).getByRole("button", { name: /1984/ }));

      expect(router.state.location.search).toBe("?bookId=book-1");
    });
  });

  describe("When the user has no quotes", () => {
    it("Then there is nothing to order", async () => {
      server.use(
        http.get(`${baseUrl}/quotes/books`, () =>
          HttpResponse.json({ items: [], unlinkedCount: 0 }),
        ),
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      renderRoutes(routes, ["/quotes"]);

      await screen.findByText("Todavía no tienes citas");
      expect(
        screen.queryByRole("button", { name: /^Ordenar por/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user has quotes", () => {
    const mockCounts = () =>
      server.use(
        http.get(`${baseUrl}/quotes/books`, () =>
          HttpResponse.json({ items: quoteBooks, unlinkedCount: 0 }),
        ),
        http.get(`${baseUrl}/quotes`, ({ request }) => {
          const filtered = new URL(request.url).searchParams.has("bookId");
          return HttpResponse.json({
            items: [quote("q1", "La guerra es la paz")],
            nextCursor: null,
            total: filtered ? 3 : 34,
          });
        }),
      );

    it("Then the header counts the quotes and the books", async () => {
      mockCounts();

      renderRoutes(routes, ["/quotes"]);

      expect(
        await screen.findByText("34 citas · 2 libros"),
      ).toBeInTheDocument();
    });

    it("Then, with a book chosen, it only counts that book's quotes", async () => {
      mockCounts();

      renderRoutes(routes, ["/quotes?bookId=book-1"]);

      expect(await screen.findByText("3 citas")).toBeInTheDocument();
    });
  });
});
