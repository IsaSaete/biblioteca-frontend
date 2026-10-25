import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LibraryPage from "./LibraryPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/library", element: <LibraryPage /> }];

const entry = (id: string, title: string, overrides?: object) => ({
  book: {
    id: `book-${id}`,
    title,
    authors: ["Autora Uno", "Autor Dos"],
    publisher: "Editorial",
  },
  ejemplar: {
    id: `ejemplar-${id}`,
    bookId: `book-${id}`,
    status: "pending",
    overrides,
    createdAt: "2026-10-20T10:00:00.000Z",
  },
});

const mockBooks = (handler: Parameters<typeof http.get>[1]) =>
  server.use(http.get(`${baseUrl}/books`, handler));

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
});
afterEach(() => vi.unstubAllGlobals());

// La Biblioteca lee la vista elegida (cuadrícula o lista) de la sesión.
beforeEach(() => {
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: {
          id: "user-1",
          name: "Isa",
          email: "isa@example.com",
          onboardingCompleted: true,
          preferences: { libraryView: "grid" },
        },
      }),
    ),
  );
});

describe("Given the library page", () => {
  describe("When the user has no books", () => {
    it("Then it explains the shelf is empty and offers to add the first book", async () => {
      mockBooks(() => HttpResponse.json({ items: [], nextCursor: null }));

      const { user, router } = renderRoutes(routes, ["/library"]);

      expect(
        screen.getByRole("heading", { level: 1, name: "Biblioteca" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("heading", {
          name: "Tu estantería está vacía, de momento",
        }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "Añadir tu primer libro" }),
      );

      expect(router.state.location.search).toBe("?modal=add-book");
    });
  });

  describe("When the books are loading", () => {
    it("Then it shows a loading state instead of an empty shelf", () => {
      mockBooks(() => new Promise(() => undefined));

      renderRoutes(routes, ["/library"]);

      expect(
        screen.getByRole("status", { name: "Cargando tu biblioteca" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Tu estantería está vacía, de momento"),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user has books", () => {
    it("Then it lists them with title and authors, using the override when there is one", async () => {
      mockBooks(() =>
        HttpResponse.json({
          items: [
            entry("1", "Rayuela"),
            entry("2", "Título original", { title: "Título corregido" }),
          ],
          nextCursor: null,
        }),
      );

      renderRoutes(routes, ["/library"]);

      const list = await screen.findByRole("list", { name: "Tus libros" });
      const items = within(list).getAllByRole("listitem");
      expect(items).toHaveLength(2);
      expect(within(items[0]).getByText("Rayuela")).toBeInTheDocument();
      expect(
        within(items[0]).getByText("Autora Uno, Autor Dos"),
      ).toBeInTheDocument();
      expect(
        within(items[1]).getByText("Título corregido"),
      ).toBeInTheDocument();
    });
  });

  describe("When there are more books and the end of the grid comes into view", () => {
    it("Then it requests the next batch with the cursor and appends it", async () => {
      const cursors: (string | null)[] = [];
      mockBooks(({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        cursors.push(cursor);
        return cursor
          ? HttpResponse.json({
              items: [entry("2", "Segundo")],
              nextCursor: null,
            })
          : HttpResponse.json({
              items: [entry("1", "Primero")],
              nextCursor: "cursor-2",
            });
      });
      renderRoutes(routes, ["/library"]);
      await screen.findByText("Primero");

      observerCallbacks.at(-1)?.();

      expect(await screen.findByText("Segundo")).toBeInTheDocument();
      expect(screen.getByText("Primero")).toBeInTheDocument();
      expect(cursors).toEqual([null, "cursor-2"]);
    });
  });

  describe("When the library cannot be loaded", () => {
    it("Then it shows an error and retrying loads the books", async () => {
      let attempts = 0;
      mockBooks(() => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json(
              { error: { code: "INTERNAL", message: "fallo" } },
              { status: 500 },
            )
          : HttpResponse.json({
              items: [entry("1", "Rayuela")],
              nextCursor: null,
            });
      });
      const { user } = renderRoutes(routes, ["/library"]);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No hemos podido cargar tu biblioteca.",
      );
      await user.click(screen.getByRole("button", { name: "Reintentar" }));

      expect(await screen.findByText("Rayuela")).toBeInTheDocument();
    });
  });

  describe("When the user opens a book from the grid", () => {
    it("Then the card links to its detail page", async () => {
      mockBooks(() =>
        HttpResponse.json({
          items: [entry("1", "Libro Uno")],
          nextCursor: null,
        }),
      );

      renderRoutes(routes, ["/library"]);

      expect(
        await screen.findByRole("link", { name: /Libro Uno/ }),
      ).toHaveAttribute("href", "/library/book-1");
    });
  });
});
