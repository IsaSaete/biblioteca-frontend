import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import BookDetailPage from "./BookDetailPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [
  { path: "/library", element: <p>Biblioteca</p> },
  { path: "/library/:bookId", element: <BookDetailPage /> },
];

const entry = (overrides?: object) => ({
  book: {
    id: "book-1",
    title: "El mundo amarillo",
    authors: ["Albert Espinosa"],
    publisher: "Debolsillo",
    publishedYear: 2012,
    pageCount: 170,
    language: "es",
    synopsis: "Una historia real.",
  },
  ejemplar: {
    id: "ejemplar-1",
    bookId: "book-1",
    status: "reading",
    overrides,
    createdAt: "2026-10-20T10:00:00.000Z",
  },
});

// Las sugerencias de etiquetas salen de la biblioteca cargada.
const mockLibrary = (items: object[] = []) =>
  server.use(
    http.get(`${baseUrl}/books`, () =>
      HttpResponse.json({ items, nextCursor: null }),
    ),
  );

beforeEach(() => mockLibrary());

describe("Given the book detail page", () => {
  describe("When the book loads", () => {
    it("Then it shows its data, status and synopsis", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
      );

      renderRoutes(routes, ["/library/book-1"]);

      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: "El mundo amarillo",
        }),
      ).toBeInTheDocument();
      expect(screen.getByText("Albert Espinosa")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Leyendo" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Pendiente" }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("Debolsillo · 2012 · 170 páginas · español"),
      ).toBeInTheDocument();
      expect(screen.getByText("Una historia real.")).toBeInTheDocument();
    });
  });

  describe("When the ejemplar overrides the title", () => {
    it("Then it shows the override", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json(entry({ title: "Mi título" })),
        ),
      );

      renderRoutes(routes, ["/library/book-1"]);

      expect(
        await screen.findByRole("heading", { level: 1, name: "Mi título" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the ejemplar has tags and personal data", () => {
    it("Then it lists the tags and the filled rows of the copy data", async () => {
      const base = entry();
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...base,
            ejemplar: {
              ...base.ejemplar,
              tags: ["clásicos", "regalos"],
              location: "Salón",
              format: "pocket",
              acquisitionDate: "2026-05-01",
            },
          }),
        ),
      );

      renderRoutes(routes, ["/library/book-1"]);

      expect(
        within(
          await screen.findByRole("list", { name: "Etiquetas" }),
        ).getAllByRole("listitem"),
      ).toHaveLength(2);
      expect(screen.getByText("Salón")).toBeInTheDocument();
      expect(screen.getByText("Bolsillo")).toBeInTheDocument();
      expect(screen.getByText("1 de mayo de 2026")).toBeInTheDocument();
      expect(screen.queryByText("Procedencia")).not.toBeInTheDocument();
    });
  });

  describe("When the ejemplar has no personal data", () => {
    it("Then the copy section says so instead of showing empty rows", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
      );

      renderRoutes(routes, ["/library/book-1"]);

      expect(
        await screen.findByText("Todavía no has añadido datos de tu ejemplar."),
      ).toBeInTheDocument();
    });
  });

  describe("When the user marks the book as favorite", () => {
    it("Then it sends the change and shows the star as pressed", async () => {
      let body: unknown;
      let favorite = false;
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...entry(),
            ejemplar: { ...entry().ejemplar, favorite },
          }),
        ),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, async ({ request }) => {
          body = await request.json();
          favorite = true;
          return HttpResponse.json({
            ejemplar: { ...entry().ejemplar, favorite },
          });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir a favoritos" }),
      );

      expect(
        await screen.findByRole("button", { name: "Quitar de favoritos" }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(body).toEqual({ favorite: true });
    });
  });

  describe("When saving the favorite fails", () => {
    it("Then the star goes back and an error is shown", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...entry(),
            ejemplar: { ...entry().ejemplar, favorite: false },
          }),
        ),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL_ERROR", message: "Error" } },
            { status: 500 },
          ),
        ),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir a favoritos" }),
      );

      expect(
        await screen.findByText(
          "No se pudo guardar el cambio. Inténtalo de nuevo.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Añadir a favoritos" }),
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("When the user changes the reading status", () => {
    it("Then only the current status shows until it is opened, and the new one is sent", async () => {
      let body: unknown;
      let status = "reading";
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...entry(),
            ejemplar: { ...entry().ejemplar, status },
          }),
        ),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, async ({ request }) => {
          body = await request.json();
          status = "read";
          return HttpResponse.json({
            ejemplar: { ...entry().ejemplar, status },
          });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(await screen.findByRole("button", { name: "Leyendo" }));
      await user.click(screen.getByRole("radio", { name: "Leído" }));

      expect(
        await screen.findByRole("button", { name: "Leído" }),
      ).toBeInTheDocument();
      expect(body).toEqual({ status: "read" });
    });
  });

  describe("When the user edits the data of the copy", () => {
    it("Then it sends the filled fields and clears the empty ones", async () => {
      let body: unknown;
      const base = entry();
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...base,
            ejemplar: { ...base.ejemplar, location: "Salón", notes: "Viejo" },
          }),
        ),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ ejemplar: base.ejemplar });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos" }),
      );
      await user.clear(screen.getByLabelText("Notas"));
      await user.selectOptions(screen.getByLabelText("Formato"), "pocket");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(body).toEqual({
        location: "Salón",
        format: "pocket",
        provenance: null,
        acquisitionDate: null,
        notes: null,
        tags: [],
      });
      expect(
        await screen.findByRole("button", { name: "Editar datos" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user cancels editing the copy data", () => {
    it("Then nothing is sent and the data is shown again", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir datos" }),
      );
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(
        screen.getByRole("button", { name: "Añadir datos" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user adds a tag", () => {
    it("Then it sends the whole list with the new one", async () => {
      let body: unknown;
      const base = entry();
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...base,
            ejemplar: { ...base.ejemplar, tags: ["clásicos"] },
          }),
        ),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ ejemplar: base.ejemplar });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos" }),
      );
      await user.type(
        screen.getByLabelText("Añadir etiqueta"),
        "  regalos {enter}",
      );
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(body).toMatchObject({ tags: ["clásicos", "regalos"] });
    });
  });

  describe("When the user removes a tag", () => {
    it("Then it sends the list without it", async () => {
      let body: unknown;
      const base = entry();
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...base,
            ejemplar: { ...base.ejemplar, tags: ["clásicos", "regalos"] },
          }),
        ),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ ejemplar: base.ejemplar });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos" }),
      );
      await user.click(
        screen.getByRole("button", { name: "Quitar la etiqueta clásicos" }),
      );
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(body).toMatchObject({ tags: ["regalos"] });
    });
  });

  describe("When the book already has five tags", () => {
    it("Then it explains the limit and offers no more", async () => {
      const base = entry();
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json({
            ...base,
            ejemplar: { ...base.ejemplar, tags: ["a", "b", "c", "d", "e"] },
          }),
        ),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos" }),
      );

      expect(
        await screen.findByText("Has llegado al máximo de 5 etiquetas."),
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText("Añadir etiqueta"),
      ).not.toBeInTheDocument();
    });
  });

  describe("When other books use tags the book does not have", () => {
    it("Then it suggests them and filters them as the user types", async () => {
      const other = entry();
      mockLibrary([
        {
          ...other,
          ejemplar: { ...other.ejemplar, tags: ["clásicos", "regalos"] },
        },
      ]);
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Añadir datos" }),
      );
      const suggestions = await screen.findByRole("group", {
        name: "Etiquetas sugeridas",
      });
      expect(within(suggestions).getAllByRole("button")).toHaveLength(2);

      await user.type(screen.getByLabelText("Añadir etiqueta"), "reg");

      expect(within(suggestions).getAllByRole("button")).toHaveLength(1);
      expect(
        within(suggestions).getByRole("button", { name: "regalos" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user corrects the title of the book", () => {
    it("Then it sends only that override and closes the dialog", async () => {
      let body: unknown;
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ ejemplar: entry().ejemplar });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos del libro" }),
      );
      const title = screen.getByLabelText("Título");
      await user.clear(title);
      await user.type(title, "Mi título");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(body).toEqual({ overrides: { title: "Mi título" } });
      expect(
        await screen.findByRole("button", { name: "Editar datos del libro" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("dialog", { name: "Edita los datos del libro" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user saves the book data without changes", () => {
    it("Then it closes without sending anything", async () => {
      let hasPatched = false;
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, () => {
          hasPatched = true;
          return HttpResponse.json({ ejemplar: entry().ejemplar });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos del libro" }),
      );
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(
        screen.queryByRole("dialog", { name: "Edita los datos del libro" }),
      ).not.toBeInTheDocument();
      expect(hasPatched).toBe(false);
    });
  });

  describe("When the user empties the title", () => {
    it("Then it asks for it and does not send", async () => {
      let hasPatched = false;
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, () => {
          hasPatched = true;
          return HttpResponse.json({ ejemplar: entry().ejemplar });
        }),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos del libro" }),
      );
      await user.clear(screen.getByLabelText("Título"));
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(await screen.findByText("Escribe el título")).toBeInTheDocument();
      expect(hasPatched).toBe(false);
    });
  });

  describe("When the server rejects a field of the book data", () => {
    it("Then the message appears next to that field", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
        http.patch(`${baseUrl}/books/book-1/ejemplar`, () =>
          HttpResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "El año de publicación no es válido",
                field: "overrides.publishedYear",
              },
            },
            { status: 400 },
          ),
        ),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", { name: "Editar datos del libro" }),
      );
      const year = screen.getByLabelText("Año de publicación");
      await user.clear(year);
      await user.type(year, "1999");
      await user.click(screen.getByRole("button", { name: "Guardar" }));

      expect(
        await screen.findByText("El año de publicación no es válido"),
      ).toBeInTheDocument();
    });
  });

  describe("When the user confirms deleting the book", () => {
    it("Then it deletes it and goes back to the library", async () => {
      let hasDeleted = false;
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
        http.delete(`${baseUrl}/books/book-1`, () => {
          hasDeleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const { user, router } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", {
          name: "Eliminar libro de mi biblioteca",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));

      await screen.findByText("Biblioteca");
      expect(hasDeleted).toBe(true);
      expect(router.state.location.pathname).toBe("/library");
    });
  });

  describe("When the user cancels deleting the book", () => {
    it("Then nothing is deleted", async () => {
      let hasDeleted = false;
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
        http.delete(`${baseUrl}/books/book-1`, () => {
          hasDeleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const { user, router } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", {
          name: "Eliminar libro de mi biblioteca",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(hasDeleted).toBe(false);
      expect(router.state.location.pathname).toBe("/library/book-1");
    });
  });

  describe("When deleting the book fails", () => {
    it("Then it stays on the page and shows an error", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
        http.delete(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json(
            { error: { code: "INTERNAL_ERROR", message: "Error" } },
            { status: 500 },
          ),
        ),
      );

      const { user, router } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(
        await screen.findByRole("button", {
          name: "Eliminar libro de mi biblioteca",
        }),
      );
      await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));

      expect(
        await screen.findByText(
          "No se pudo eliminar el libro. Inténtalo de nuevo.",
        ),
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/library/book-1");
    });
  });

  describe("When the book is still loading", () => {
    it("Then it shows a loading state", () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => new Promise(() => undefined)),
      );

      renderRoutes(routes, ["/library/book-1"]);

      expect(
        screen.getByRole("status", { name: "Cargando el libro" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the book is not in the user's library", () => {
    it("Then it says so instead of offering to retry", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          HttpResponse.json(
            { error: { code: "BOOK_NOT_FOUND", message: "No existe" } },
            { status: 404 },
          ),
        ),
      );

      renderRoutes(routes, ["/library/book-1"]);

      expect(
        await screen.findByText("Este libro no está en tu biblioteca."),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Reintentar" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the request fails and the user retries", () => {
    it("Then it loads the book", async () => {
      let fail = true;
      server.use(
        http.get(`${baseUrl}/books/book-1`, () =>
          fail
            ? HttpResponse.json(
                { error: { code: "INTERNAL_ERROR", message: "Error" } },
                { status: 500 },
              )
            : HttpResponse.json(entry()),
        ),
      );

      const { user } = renderRoutes(routes, ["/library/book-1"]);
      const retry = await screen.findByRole("button", { name: "Reintentar" });
      fail = false;
      await user.click(retry);

      expect(
        await screen.findByRole("heading", { name: "El mundo amarillo" }),
      ).toBeInTheDocument();
    });
  });

  describe("When the user goes back with no previous page", () => {
    it("Then it goes to the library", async () => {
      server.use(
        http.get(`${baseUrl}/books/book-1`, () => HttpResponse.json(entry())),
      );

      const { user, router } = renderRoutes(routes, ["/library/book-1"]);
      await user.click(await screen.findByRole("button", { name: "Volver" }));

      expect(router.state.location.pathname).toBe("/library");
    });
  });
});
