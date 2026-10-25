import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LibraryPage from "./LibraryPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/library", element: <LibraryPage /> }];

const entry = (id: number) => ({
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

// El servidor simulado responde según el filtro: sin filtros hay 3 libros, con
// `favorite` 1 y con `tag=NoExiste` ninguno.
const mockLibrary = () => {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(`${baseUrl}/books/tags`, () =>
      HttpResponse.json({
        items: [
          { tag: "Poesía", count: 2 },
          { tag: "Ensayo", count: 1 },
        ],
        untaggedCount: 1,
      }),
    ),
    http.get(`${baseUrl}/books`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const total = params.get("favorite") === "true" ? 1 : 3;
      return HttpResponse.json({
        items: Array.from({ length: total }, (_, i) => entry(i + 1)),
        nextCursor: null,
        total,
      });
    }),
  );
  return requests;
};

const openFilters = async (user: ReturnType<typeof renderRoutes>["user"]) => {
  await user.click(await screen.findByRole("button", { name: /^Filtros/ }));
  return screen.findByRole("dialog");
};

describe("Given the library page with order and filters", () => {
  describe("When the user has no books", () => {
    it("Then there is nothing to order or filter", async () => {
      server.use(
        http.get(`${baseUrl}/books`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      renderRoutes(routes, ["/library"]);

      await screen.findByRole("heading", { name: /Tu estantería está vacía/ });
      expect(
        screen.queryByRole("button", { name: /^Filtros/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user picks the alphabetical order", () => {
    it("Then the order goes to the URL and to the request", async () => {
      const requests = mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);

      await user.click(
        await screen.findByRole("button", { name: "Orden: Añadidos" }),
      );
      await user.click(
        await screen.findByRole("radio", { name: "Alfabético" }),
      );

      expect(router.state.location.search).toBe("?sort=alpha");
      await waitFor(() =>
        expect(requests.some((p) => p.get("sort") === "alpha")).toBe(true),
      );
      expect(
        await screen.findByRole("button", { name: "Orden: Alfabético" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the library is opened already filtered by favorites", () => {
    it("Then it asks only for favorites and flags the active filters", async () => {
      const requests = mockLibrary();

      renderRoutes(routes, ["/library?favorite=true"]);

      expect(
        await screen.findByRole("button", { name: "Filtros activos" }),
      ).toBeInTheDocument();
      expect(requests.every((p) => p.get("favorite") === "true")).toBe(true);
    });
  });

  describe("When the user filters by favorites from the filters screen", () => {
    it("Then it shows the live count and applies the filter on confirming", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);
      const dialog = await openFilters(user);

      expect(
        await within(dialog).findByRole("button", { name: "Ver 3 libros" }),
      ).toBeInTheDocument();

      await user.click(
        within(dialog).getByRole("button", { name: "Solo favoritos" }),
      );
      await user.click(
        await within(dialog).findByRole("button", { name: "Ver 1 libro" }),
      );

      expect(router.state.location.search).toBe("?favorite=true");
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });
  });

  describe("When the user filters by a tag", () => {
    it("Then it lists the tags in use and applies the chosen one", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);
      const dialog = await openFilters(user);

      await user.click(
        within(dialog).getByRole("button", { name: /Etiqueta/ }),
      );
      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por etiqueta",
      });
      await user.click(
        await within(sheet).findByRole("button", { name: /Poesía/ }),
      );
      await user.click(
        await within(dialog).findByRole("button", {
          name: /^Ver \d+ libros?$/,
        }),
      );

      expect(new URLSearchParams(router.state.location.search).get("tag")).toBe(
        "Poesía",
      );
    });
  });

  describe("When the user filters the books without any tag", () => {
    it("Then «Sin catalogar» is applied instead of a tag", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);
      const dialog = await openFilters(user);

      await user.click(
        within(dialog).getByRole("button", { name: /Etiqueta/ }),
      );
      const sheet = await screen.findByRole("dialog", {
        name: "Filtrar por etiqueta",
      });
      await user.click(
        await within(sheet).findByRole("button", { name: /Sin catalogar/ }),
      );
      await user.click(
        await within(dialog).findByRole("button", {
          name: /^Ver \d+ libros?$/,
        }),
      );

      expect(router.state.location.search).toBe("?untagged=true");
    });
  });

  describe("When the tags fail to load", () => {
    it("Then the tag selector shows an error with a retry", async () => {
      mockLibrary();
      server.use(
        http.get(`${baseUrl}/books/tags`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL", message: "Error" } },
            { status: 500 },
          ),
        ),
      );

      const { user } = renderRoutes(routes, ["/library"]);
      const dialog = await openFilters(user);

      await user.click(
        within(dialog).getByRole("button", { name: /Etiqueta/ }),
      );

      expect(
        await screen.findByText("No hemos podido cargar tus etiquetas."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Reintentar" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user resets the filters", () => {
    it("Then the screen goes back to all the books", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library?favorite=true"]);
      const dialog = await openFilters(user);

      await user.click(
        within(dialog).getByRole("button", { name: "Restablecer" }),
      );
      await user.click(
        await within(dialog).findByRole("button", { name: "Ver 3 libros" }),
      );

      expect(router.state.location.search).toBe("");
    });
  });

  describe("When no book matches the filters", () => {
    it("Then it says so and offers to remove the filters", async () => {
      server.use(
        http.get(`${baseUrl}/books`, () =>
          HttpResponse.json({ items: [], nextCursor: null, total: 0 }),
        ),
      );

      const { user, router } = renderRoutes(routes, ["/library?favorite=true"]);

      expect(
        await screen.findByRole("heading", {
          name: "Ningún libro coincide con estos filtros",
        }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Quitar filtros" }));

      expect(router.state.location.search).toBe("");
    });
  });
});
