import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import HomePage from "./HomePage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/home", element: <HomePage /> },
  { path: "/library", element: <p>Pantalla de Biblioteca</p> },
  { path: "/quotes", element: <p>Pantalla de Citas</p> },
  { path: "/wishlist", element: <p>Pantalla de Quiero tener</p> },
];

const bookEntry = (id: number) => ({
  book: {
    id: `book-${id}`,
    title: `Libro ${id}`,
    authors: ["Autora"],
    publisher: "Editorial",
  },
  ejemplar: {
    id: `ejemplar-${id}`,
    bookId: `book-${id}`,
    status: "pending",
    favorite: false,
    createdAt: "2026-10-20T10:00:00.000Z",
  },
});

const quote = (id: number) => ({
  id: `quote-${id}`,
  ejemplarId: "ejemplar-1",
  text: `Cita número ${id}`,
  createdAt: "2026-10-22T10:00:00.000Z",
  book: { id: "book-1", title: "Libro 1", authors: ["Autora"] },
});

const mockBooks = (count: number) =>
  server.use(
    http.get(`${baseUrl}/books`, () =>
      HttpResponse.json({
        items: Array.from({ length: count }, (_, i) => bookEntry(i + 1)),
        nextCursor: null,
      }),
    ),
  );

const mockQuotes = (count: number) =>
  server.use(
    http.get(`${baseUrl}/quotes`, () =>
      HttpResponse.json({
        items: Array.from({ length: count }, (_, i) => quote(i + 1)),
        nextCursor: null,
        total: count,
      }),
    ),
  );

const mockStats = (stats = { books: 12, quotes: 34, favorites: 3 }) =>
  server.use(http.get(`${baseUrl}/stats`, () => HttpResponse.json(stats)));

const failWith500 = (path: string) =>
  server.use(
    http.get(`${baseUrl}${path}`, () =>
      HttpResponse.json(
        { error: { code: "INTERNAL", message: "Error" } },
        { status: 500 },
      ),
    ),
  );

// Sin deseados por defecto: cada test que los necesite los pide aparte.
const mockEmptyWishlist = () =>
  server.use(
    http.get(`${baseUrl}/wishlist`, () =>
      HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
    ),
  );

describe("Given the home page", () => {
  beforeEach(mockEmptyWishlist);

  describe("When the user has books, quotes and stats", () => {
    it("Then it shows the recent books, the latest quotes and the three figures", async () => {
      mockBooks(12);
      mockQuotes(9);
      mockStats();

      renderRoutes(routes, ["/home"]);

      expect(
        screen.getByRole("heading", { level: 1, name: "Inicio" }),
      ).toBeInTheDocument();

      const books = await screen.findByRole("region", {
        name: "Añadidos recientemente",
      });
      expect(await within(books).findAllByRole("link")).toHaveLength(10);

      const quotes = await screen.findByRole("region", {
        name: "Últimas citas",
      });
      expect(await within(quotes).findAllByRole("link")).toHaveLength(8);

      expect(await screen.findByText("Libros")).toBeInTheDocument();
      expect(await screen.findByText("12")).toBeInTheDocument();
      expect(screen.getByText("34")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Citas")).toBeInTheDocument();
      expect(screen.getByText("Favoritos")).toBeInTheDocument();
    });
  });

  describe("When the user has no books", () => {
    it("Then it offers to add the first book", async () => {
      mockBooks(0);
      mockQuotes(1);
      mockStats();

      const { user, router } = renderRoutes(routes, ["/home"]);

      await user.click(
        await screen.findByRole("button", { name: "Añadir tu primer libro" }),
      );

      expect(router.state.location.search).toBe("?modal=add-book");
    });
  });

  describe("When the user has no quotes", () => {
    it("Then it shows a message instead of the carousel", async () => {
      mockBooks(1);
      mockQuotes(0);
      mockStats();

      renderRoutes(routes, ["/home"]);

      expect(
        await screen.findByText("Todavía no has guardado ninguna cita."),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("region", { name: "Últimas citas" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When one section fails to load", () => {
    it("Then it shows its error with a retry and keeps the others", async () => {
      mockBooks(2);
      failWith500("/quotes");
      mockStats();

      const { user } = renderRoutes(routes, ["/home"]);

      expect(
        await screen.findByText("No hemos podido cargar tus últimas citas."),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("region", { name: "Añadidos recientemente" }),
      ).toBeInTheDocument();
      expect(await screen.findByText("12")).toBeInTheDocument();

      mockQuotes(1);
      await user.click(screen.getByRole("button", { name: "Reintentar" }));

      expect(
        await screen.findByRole("region", { name: "Últimas citas" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the stats fail to load", () => {
    it("Then it shows the error only in the figures", async () => {
      mockBooks(1);
      mockQuotes(1);
      failWith500("/stats");

      renderRoutes(routes, ["/home"]);

      expect(
        await screen.findByText("No hemos podido cargar tus cifras."),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("region", { name: "Últimas citas" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user follows a «Ver todos» link", () => {
    it("Then it goes to the library, the wishlist or the quotes", async () => {
      mockBooks(1);
      mockQuotes(1);
      mockStats();

      const { user, router } = renderRoutes(routes, ["/home"]);

      const seeAll = await screen.findAllByRole("link", { name: /Ver todos/ });
      await user.click(seeAll[0]);
      expect(router.state.location.pathname).toBe("/library");

      await router.navigate("/home");
      await user.click(
        (await screen.findAllByRole("link", { name: /Ver todos/ }))[1],
      );
      expect(router.state.location.pathname).toBe("/wishlist");

      await router.navigate("/home");
      await user.click(await screen.findByRole("link", { name: /Ver todas/ }));
      expect(router.state.location.pathname).toBe("/quotes");
    });
  });

  describe("When the user has favorites", () => {
    it("Then the figure leads to the library filtered by favorites", async () => {
      mockBooks(1);
      mockQuotes(1);
      mockStats({ books: 12, quotes: 34, favorites: 3 });
      const routesWithFilter = [
        ...routes,
        { path: "/library", element: <p>Pantalla de Biblioteca</p> },
      ];

      const { user, router } = renderRoutes(routesWithFilter, ["/home"]);

      await user.click(await screen.findByRole("link", { name: "Favoritos" }));

      expect(router.state.location.pathname).toBe("/library");
      expect(router.state.location.search).toBe("?favorite=true");
    });
  });

  describe("When the user has no favorites", () => {
    it("Then the figure is not a link", async () => {
      mockBooks(1);
      mockQuotes(1);
      mockStats({ books: 12, quotes: 34, favorites: 0 });

      renderRoutes(routes, ["/home"]);

      expect(await screen.findByText("Favoritos")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Favoritos" }),
      ).not.toBeInTheDocument();
    });
  });
});
