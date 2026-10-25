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

const tagsResponse = {
  items: [
    { tag: "Poesía", count: 2 },
    { tag: "Ensayo", count: 1 },
  ],
  untaggedCount: 1,
};

// El servidor simulado responde según el filtro: 3 libros sin filtrar, 2 con
// una etiqueta, 1 con favoritos o sin catalogar.
const mockLibrary = (tags: Record<string, unknown> = tagsResponse) => {
  const requests: URLSearchParams[] = [];
  server.use(
    http.get(`${baseUrl}/books/tags`, () => HttpResponse.json(tags)),
    http.get(`${baseUrl}/books`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const total = params.get("tag")
        ? 2
        : params.get("favorite") === "true" || params.get("untagged") === "true"
          ? 1
          : 3;
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
  return screen.findByRole("dialog", { name: "Filtros" });
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
      expect(
        screen.queryByRole("button", { name: /^Ordenar por/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user picks the alphabetical order", () => {
    it("Then the order goes to the URL and to the request", async () => {
      const requests = mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);

      await user.click(
        await screen.findByRole("button", { name: "Ordenar por: Añadidos" }),
      );
      await user.click(
        await screen.findByRole("radio", { name: "Alfabético" }),
      );

      expect(router.state.location.search).toBe("?sort=alpha");
      await waitFor(() =>
        expect(requests.some((p) => p.get("sort") === "alpha")).toBe(true),
      );
      expect(
        await screen.findByRole("button", { name: "Ordenar por: Alfabético" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the library is opened already filtered by favorites", () => {
    it("Then it asks only for favorites and shows the active filter with the count", async () => {
      const requests = mockLibrary();

      renderRoutes(routes, ["/library?favorite=true"]);

      expect(
        await screen.findByRole("button", { name: "Filtros, 1 activos" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Quitar el filtro Favoritos" }),
      ).toBeInTheDocument();
      expect(await screen.findByText("1 libro")).toBeInTheDocument();
      expect(requests.every((p) => p.get("favorite") === "true")).toBe(true);
    });
  });

  describe("When the user opens the filters", () => {
    it("Then it shows favorites, every tag with its count and «Sin catalogar» in one sheet", async () => {
      mockLibrary();

      const { user } = renderRoutes(routes, ["/library"]);
      const sheet = await openFilters(user);

      expect(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      ).toBeInTheDocument();
      expect(
        await within(sheet).findByRole("button", { name: "Poesía 2" }),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: "Ensayo 1" }),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: "Sin catalogar 1" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user taps a tag", () => {
    it("Then the filter applies at once, with the live count, and tapping it again removes it", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);
      const sheet = await openFilters(user);

      await user.click(
        await within(sheet).findByRole("button", { name: "Poesía 2" }),
      );

      expect(new URLSearchParams(router.state.location.search).get("tag")).toBe(
        "Poesía",
      );
      expect(
        await within(sheet).findByRole("button", { name: "Ver 2 libros" }),
      ).toBeInTheDocument();

      await user.click(within(sheet).getByRole("button", { name: "Poesía 2" }));

      expect(router.state.location.search).toBe("");
    });
  });

  describe("When the user taps a second tag", () => {
    it("Then it replaces the first one, as the API takes a single tag", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);
      const sheet = await openFilters(user);

      await user.click(
        await within(sheet).findByRole("button", { name: "Poesía 2" }),
      );
      await user.click(within(sheet).getByRole("button", { name: "Ensayo 1" }));

      expect(new URLSearchParams(router.state.location.search).get("tag")).toBe(
        "Ensayo",
      );
      expect(
        within(sheet).getByRole("button", { name: "Poesía 2" }),
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("When the user combines favorites with a tag", () => {
    it("Then both go to the URL and the button counts two filters", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);
      const sheet = await openFilters(user);

      await user.click(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      );
      await user.click(
        await within(sheet).findByRole("button", { name: "Poesía 2" }),
      );

      const params = new URLSearchParams(router.state.location.search);
      expect(params.get("favorite")).toBe("true");
      expect(params.get("tag")).toBe("Poesía");
      expect(
        screen.getByRole("button", {
          name: "Filtros, 2 activos",
          hidden: true,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user taps «Sin catalogar»", () => {
    it("Then only the books without tags are asked for, and a tag replaces it", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library"]);
      const sheet = await openFilters(user);

      await user.click(
        await within(sheet).findByRole("button", { name: "Sin catalogar 1" }),
      );
      expect(router.state.location.search).toBe("?untagged=true");

      await user.click(within(sheet).getByRole("button", { name: "Poesía 2" }));
      expect(new URLSearchParams(router.state.location.search).get("tag")).toBe(
        "Poesía",
      );
      expect(
        new URLSearchParams(router.state.location.search).get("untagged"),
      ).toBeNull();
    });
  });

  describe("When the user clears the filters", () => {
    it("Then the library goes back to all the books", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, [
        "/library?favorite=true&tag=Poes%C3%ADa",
      ]);
      const sheet = await openFilters(user);

      await user.click(within(sheet).getByRole("button", { name: "Limpiar" }));

      expect(router.state.location.search).toBe("");
    });
  });

  describe("When the user closes the sheet", () => {
    it("Then «Ver X libros» closes it and keeps the filter", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library?favorite=true"]);
      const sheet = await openFilters(user);

      await user.click(
        await within(sheet).findByRole("button", { name: "Ver 1 libro" }),
      );

      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Filtros" }),
        ).not.toBeInTheDocument(),
      );
      expect(router.state.location.search).toBe("?favorite=true");
    });
  });

  describe("When the user closes the filters with the ✕", () => {
    it("Then the sheet closes and the chosen filters stay", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, ["/library?favorite=true"]);
      const sheet = await openFilters(user);

      await user.click(within(sheet).getByRole("button", { name: "Cerrar" }));

      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Filtros" }),
        ).not.toBeInTheDocument(),
      );
      expect(router.state.location.search).toBe("?favorite=true");
    });
  });

  describe("When the user removes an active filter from the chips", () => {
    it("Then only that filter is removed", async () => {
      mockLibrary();

      const { user, router } = renderRoutes(routes, [
        "/library?favorite=true&tag=Poes%C3%ADa",
      ]);

      await user.click(
        await screen.findByRole("button", {
          name: "Quitar el filtro Favoritos",
        }),
      );

      const params = new URLSearchParams(router.state.location.search);
      expect(params.get("favorite")).toBeNull();
      expect(params.get("tag")).toBe("Poesía");
    });
  });

  describe("When the tags fail to load", () => {
    it("Then the sheet shows an error with a retry and favorites still work", async () => {
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
      const sheet = await openFilters(user);

      expect(
        await within(sheet).findByText("No hemos podido cargar tus etiquetas."),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("button", { name: "Reintentar" }),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("switch", { name: "Favoritos" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user has no tags yet", () => {
    it("Then the sheet explains where to add them", async () => {
      mockLibrary({ items: [], untaggedCount: 0 });

      const { user } = renderRoutes(routes, ["/library"]);
      const sheet = await openFilters(user);

      expect(
        await within(sheet).findByText(/Aún no tienes etiquetas/),
      ).toBeInTheDocument();
    });
  });

  describe("When the user has many tags", () => {
    it("Then a search box appears to find one", async () => {
      mockLibrary({
        items: Array.from({ length: 13 }, (_, i) => ({
          tag: `Etiqueta ${i + 1}`,
          count: 1,
        })),
        untaggedCount: 0,
      });

      const { user } = renderRoutes(routes, ["/library"]);
      const sheet = await openFilters(user);

      await user.type(
        await within(sheet).findByLabelText("Buscar una etiqueta"),
        "13",
      );

      expect(
        within(sheet).getByRole("button", { name: "Etiqueta 13 1" }),
      ).toBeInTheDocument();
      expect(
        within(sheet).queryByRole("button", { name: "Etiqueta 1 1" }),
      ).not.toBeInTheDocument();
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
