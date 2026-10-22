import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import BookQuotesPage from "./BookQuotesPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/library/:bookId", element: <p>Ficha del libro</p> },
  { path: "/library/:bookId/quotes", element: <BookQuotesPage /> },
];

let observerCallbacks: (() => void)[] = [];

beforeEach(() => {
  observerCallbacks = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        observerCallbacks.push(() => callback([{ isIntersecting: true }]));
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  server.use(
    http.get(`${baseUrl}/books/book-1`, () =>
      HttpResponse.json({
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
      }),
    ),
  );
});
afterEach(() => vi.unstubAllGlobals());

const quote = (id: string, text: string) => ({
  id,
  ejemplarId: "ejemplar-1",
  text,
  createdAt: "2026-10-22T10:00:00.000Z",
  book: { id: "book-1", title: "1984", authors: ["George Orwell"] },
});

describe("Given the quotes of a book page", () => {
  describe("When the book has quotes", () => {
    it("Then it shows the book, the total and every quote", async () => {
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({
            items: [quote("q2", "Segunda"), quote("q1", "Primera")],
            nextCursor: null,
            total: 2,
          }),
        ),
      );

      renderRoutes(routes, ["/library/book-1/quotes"]);

      expect(
        await screen.findByRole("heading", { name: "Citas (2)" }),
      ).toBeInTheDocument();
      expect(screen.getByText("1984")).toBeInTheDocument();
      expect(screen.getByText("Segunda")).toBeInTheDocument();
      expect(screen.getByText("Primera")).toBeInTheDocument();
    });
  });

  describe("When there are more quotes than one batch", () => {
    it("Then it asks for the next batch with the cursor when reaching the end", async () => {
      const cursors: (string | null)[] = [];
      server.use(
        http.get(`${baseUrl}/quotes`, ({ request }) => {
          const url = new URL(request.url);
          const cursor = url.searchParams.get("cursor");
          cursors.push(cursor);
          expect(url.searchParams.get("bookId")).toBe("book-1");

          return cursor
            ? HttpResponse.json({
                items: [quote("q1", "Primera")],
                nextCursor: null,
                total: 2,
              })
            : HttpResponse.json({
                items: [quote("q2", "Segunda")],
                nextCursor: "cursor-2",
                total: 2,
              });
        }),
      );

      renderRoutes(routes, ["/library/book-1/quotes"]);
      await screen.findByText("Segunda");
      observerCallbacks.at(-1)?.();

      expect(await screen.findByText("Primera")).toBeInTheDocument();
      expect(screen.getByText("Segunda")).toBeInTheDocument();
      expect(cursors).toEqual([null, "cursor-2"]);
    });
  });

  describe("When the book has no quotes", () => {
    it("Then it says so and still offers to add one", async () => {
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      renderRoutes(routes, ["/library/book-1/quotes"]);

      expect(
        await screen.findByText("Todavía no has guardado citas de este libro."),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: "Añadir cita" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the quotes cannot be loaded", () => {
    it("Then it shows an error and retrying loads them", async () => {
      let attempts = 0;
      server.use(
        http.get(`${baseUrl}/quotes`, () => {
          attempts += 1;
          return attempts === 1
            ? HttpResponse.json(
                { error: { code: "INTERNAL" } },
                { status: 500 },
              )
            : HttpResponse.json({
                items: [quote("q1", "Primera")],
                nextCursor: null,
                total: 1,
              });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: "Reintentar" }),
      );

      expect(await screen.findByText("Primera")).toBeInTheDocument();
    });
  });

  describe("When the user adds a quote", () => {
    it("Then the list shows it", async () => {
      let quotes = [quote("q1", "Primera")];
      server.use(
        http.get(`${baseUrl}/quotes`, () =>
          HttpResponse.json({
            items: quotes,
            nextCursor: null,
            total: quotes.length,
          }),
        ),
        http.post(`${baseUrl}/quotes`, () => {
          quotes = [quote("q2", "Nueva"), ...quotes];
          return HttpResponse.json({ quote: quotes[0] }, { status: 201 });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1/quotes"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir cita" }),
      );
      await user.click(
        await screen.findByRole("button", { name: "Escribir manualmente" }),
      );
      await user.type(screen.getByLabelText("Cita"), "Nueva");
      await user.click(screen.getByRole("button", { name: "Guardar cita" }));

      expect(await screen.findByText("Nueva")).toBeInTheDocument();
      expect(screen.getByText("Primera")).toBeInTheDocument();
    });
  });
});
