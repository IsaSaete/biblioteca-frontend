import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import AppLayout from "../../../../components/navigation/AppLayout/AppLayout";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

const routes = [
  {
    element: <AppLayout />,
    children: [{ path: "/library", element: <p>Contenido de biblioteca</p> }],
  },
];

const externalBook = {
  isbn: "9788437604947",
  title: "Cien años de soledad",
  authors: ["Gabriel García Márquez"],
  publisher: "Cátedra",
};

const apiError = (status: number, code: string) =>
  HttpResponse.json({ error: { code, message: "mensaje" } }, { status });

const mockLookup = (book: Record<string, unknown> = externalBook) =>
  server.use(
    http.get(`${baseUrl}/books/lookup-isbn`, () => HttpResponse.json({ book })),
  );

const openIsbnStep = async (user: ReturnType<typeof renderRoutes>["user"]) => {
  await user.click(screen.getByRole("button", { name: "Añadir libro" }));
  await user.click(screen.getByRole("button", { name: "Escribir ISBN" }));
};

describe("Given the add book flow", () => {
  beforeEach(() => {
    document.cookie = "csrfToken=csrf-123";
  });

  describe("When the user taps the bookmark button", () => {
    it("Then the dialog opens and closing it leaves the screen as it was", async () => {
      const { user, router } = renderRoutes(routes, ["/library"]);

      await user.click(screen.getByRole("button", { name: "Añadir libro" }));

      expect(
        screen.getByRole("dialog", { name: "Añade un libro" }),
      ).toBeInTheDocument();
      expect(router.state.location.search).toBe("?modal=add-book");

      await user.click(screen.getByRole("button", { name: "Cerrar" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(router.state.location.search).toBe("");
    });
  });

  describe("When the user writes an ISBN with a wrong check digit", () => {
    it("Then it shows the error and does not call the API", async () => {
      const { user } = renderRoutes(routes, ["/library"]);
      await openIsbnStep(user);

      await user.type(screen.getByLabelText("ISBN"), "9788437604948");
      await user.click(screen.getByRole("button", { name: "Buscar libro" }));

      expect(screen.getByText(/El ISBN no es válido/)).toBeInTheDocument();
    });
  });

  describe("When no provider knows the ISBN", () => {
    it("Then it says no book was found", async () => {
      server.use(
        http.get(`${baseUrl}/books/lookup-isbn`, () =>
          apiError(404, "ISBN_NOT_FOUND"),
        ),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openIsbnStep(user);

      await user.type(screen.getByLabelText("ISBN"), "978-84-376-0494-7");
      await user.click(screen.getByRole("button", { name: "Buscar libro" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No hemos encontrado ningún libro con ese ISBN.",
      );
    });
  });

  describe("When a valid ISBN is found and the user saves it as reading", () => {
    it("Then it posts the confirmed data with that status and closes the dialog", async () => {
      mockLookup({
        ...externalBook,
        coverUrl: "https://books.google.com/c.jpg",
        coverSource: "google_books",
      });
      let body: unknown;
      server.use(
        http.post(`${baseUrl}/books`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(
            {
              book: { ...externalBook, id: "book-1" },
              ejemplar: {
                id: "e-1",
                bookId: "book-1",
                status: "reading",
                createdAt: "2026-10-20T10:00:00.000Z",
              },
            },
            { status: 201 },
          );
        }),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openIsbnStep(user);

      await user.type(screen.getByLabelText("ISBN"), "9788437604947");
      await user.click(screen.getByRole("button", { name: "Buscar libro" }));
      expect(await screen.findByText("Confirma los datos")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pendiente" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await user.click(screen.getByRole("button", { name: "Leyendo" }));
      await user.click(screen.getByRole("button", { name: "Guardar libro" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(body).toMatchObject({
        isbn: "9788437604947",
        title: "Cien años de soledad",
        authors: ["Gabriel García Márquez"],
        publisher: "Cátedra",
        coverUrl: "https://books.google.com/c.jpg",
        coverSource: "google_books",
        status: "reading",
      });
    });
  });

  describe("When the provider gives no publisher", () => {
    it("Then it asks for it and does not save without it", async () => {
      mockLookup({
        title: "Cien años de soledad",
        authors: ["GGM"],
        isbn: "9788437604947",
      });
      const { user } = renderRoutes(routes, ["/library"]);
      await openIsbnStep(user);
      await user.type(screen.getByLabelText("ISBN"), "9788437604947");
      await user.click(screen.getByRole("button", { name: "Buscar libro" }));

      await user.click(
        await screen.findByRole("button", { name: "Guardar libro" }),
      );

      expect(screen.getByLabelText("Editorial")).toBeInvalid();
      expect(screen.getByText("Escribe la editorial")).toBeInTheDocument();
    });
  });

  describe("When the user corrects the title with the pencil", () => {
    it("Then the corrected title is the one sent", async () => {
      mockLookup();
      let body: unknown;
      server.use(
        http.post(`${baseUrl}/books`, async ({ request }) => {
          body = await request.json();
          return apiError(409, "BOOK_ALREADY_IN_LIBRARY");
        }),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openIsbnStep(user);
      await user.type(screen.getByLabelText("ISBN"), "9788437604947");
      await user.click(screen.getByRole("button", { name: "Buscar libro" }));

      await user.click(
        await screen.findByRole("button", { name: "Editar datos del libro" }),
      );
      const title = screen.getByLabelText("Título");
      await user.clear(title);
      await user.type(title, "Cien años");
      await user.click(screen.getByRole("button", { name: "Guardar libro" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Este libro ya está en tu biblioteca.",
      );
      expect(body).toMatchObject({ title: "Cien años" });
    });
  });

  describe("When the user adds a book manually", () => {
    it("Then it asks for title, author and publisher and posts a book without ISBN", async () => {
      let body: unknown;
      server.use(
        http.post(`${baseUrl}/books`, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(
            {
              book: { ...externalBook, id: "book-1" },
              ejemplar: {
                id: "e-1",
                bookId: "book-1",
                status: "pending",
                createdAt: "2026-10-20T10:00:00.000Z",
              },
            },
            { status: 201 },
          );
        }),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await user.click(screen.getByRole("button", { name: "Añadir libro" }));
      await user.click(
        screen.getByRole("button", { name: "Añadir manualmente" }),
      );

      await user.click(screen.getByRole("button", { name: "Guardar libro" }));
      expect(screen.getByText("Escribe el título")).toBeInTheDocument();
      expect(screen.getByText("Escribe al menos un autor")).toBeInTheDocument();
      expect(screen.getByText("Escribe la editorial")).toBeInTheDocument();
      expect(body).toBeUndefined();

      await user.type(screen.getByLabelText("Título"), "Libro raro");
      await user.type(screen.getByLabelText("Autores"), "Alguien, Otra");
      await user.type(screen.getByLabelText("Editorial"), "Editorial X");
      await user.click(screen.getByRole("button", { name: "Guardar libro" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(body).toEqual({
        title: "Libro raro",
        authors: ["Alguien", "Otra"],
        publisher: "Editorial X",
        status: "pending",
      });
    });
  });

  describe("When the ISBN lookup fails because the book is not found", () => {
    it("Then it offers the manual entry keeping the typed ISBN", async () => {
      server.use(
        http.get(`${baseUrl}/books/lookup-isbn`, () =>
          apiError(404, "ISBN_NOT_FOUND"),
        ),
      );
      let body: unknown;
      server.use(
        http.post(`${baseUrl}/books`, async ({ request }) => {
          body = await request.json();
          return apiError(409, "BOOK_ALREADY_IN_LIBRARY");
        }),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openIsbnStep(user);
      await user.type(screen.getByLabelText("ISBN"), "978-84-376-0494-7");
      await user.click(screen.getByRole("button", { name: "Buscar libro" }));

      await user.click(
        await screen.findByRole("button", { name: "Añadir manualmente" }),
      );
      await user.type(screen.getByLabelText("Título"), "Libro");
      await user.type(screen.getByLabelText("Autores"), "Autor");
      await user.type(screen.getByLabelText("Editorial"), "Editorial");
      await user.click(screen.getByRole("button", { name: "Guardar libro" }));

      await screen.findByRole("alert");
      expect(body).toMatchObject({ isbn: "9788437604947" });
    });
  });

  describe("When the lookup fails because of the rate limit", () => {
    it("Then it does not offer the manual entry", async () => {
      server.use(
        http.get(`${baseUrl}/books/lookup-isbn`, () =>
          apiError(429, "RATE_LIMITED"),
        ),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openIsbnStep(user);

      await user.type(screen.getByLabelText("ISBN"), "9788437604947");
      await user.click(screen.getByRole("button", { name: "Buscar libro" }));

      await screen.findByRole("alert");
      expect(
        screen.queryByRole("button", { name: "Añadir manualmente" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("When the user searches by title or author", () => {
    const openSearchStep = async (
      user: ReturnType<typeof renderRoutes>["user"],
    ) => {
      await user.click(screen.getByRole("button", { name: "Añadir libro" }));
      await user.click(
        screen.getByRole("button", { name: "Buscar por título o autor" }),
      );
    };

    it("Then it searches once, after typing stops and with at least 3 letters", async () => {
      const queries: (string | null)[] = [];
      server.use(
        http.get(`${baseUrl}/books/search-external`, ({ request }) => {
          queries.push(new URL(request.url).searchParams.get("q"));
          return HttpResponse.json({ results: [{ book: externalBook }] });
        }),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openSearchStep(user);

      await user.type(screen.getByLabelText("Título o autor"), "ci");
      await new Promise((resolve) => setTimeout(resolve, 600));
      expect(queries).toEqual([]);

      await user.type(screen.getByLabelText("Título o autor"), "en");
      await screen.findByRole("button", { name: /Cien años de soledad/ });
      expect(queries).toEqual(["cien"]);
    });

    it("Then picking a result without publisher asks for it, and going back keeps the search", async () => {
      server.use(
        http.get(`${baseUrl}/books/search-external`, () =>
          HttpResponse.json({
            results: [
              {
                book: {
                  title: "Rayuela",
                  authors: ["Julio Cortázar"],
                  coverUrl: "https://covers.openlibrary.org/b/id/1-M.jpg",
                  coverSource: "open_library",
                },
              },
            ],
          }),
        ),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openSearchStep(user);
      await user.type(screen.getByLabelText("Título o autor"), "rayuela");

      await user.click(await screen.findByRole("button", { name: /Rayuela/ }));

      expect(screen.getByText("Confirma los datos")).toBeInTheDocument();
      expect(screen.getByLabelText("Editorial")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Volver" }));

      expect(screen.getByLabelText("Título o autor")).toHaveValue("rayuela");
    });

    it("Then no results offer the manual entry", async () => {
      server.use(
        http.get(`${baseUrl}/books/search-external`, () =>
          HttpResponse.json({ results: [] }),
        ),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openSearchStep(user);

      await user.type(screen.getByLabelText("Título o autor"), "zzzzz");

      expect(
        await screen.findByText(
          "No hemos encontrado ningún libro con esa búsqueda.",
        ),
      ).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", { name: "Añadir manualmente" }),
      );
      expect(screen.getByText("Añade los datos")).toBeInTheDocument();
    });

    it("Then unavailable providers show the error with the manual entry", async () => {
      server.use(
        http.get(`${baseUrl}/books/search-external`, () =>
          apiError(502, "BOOK_PROVIDER_UNAVAILABLE"),
        ),
      );
      const { user } = renderRoutes(routes, ["/library"]);
      await openSearchStep(user);

      await user.type(screen.getByLabelText("Título o autor"), "rayuela");

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "catálogos de libros",
      );
      expect(
        screen.getByRole("button", { name: "Añadir manualmente" }),
      ).toBeInTheDocument();
    });
  });
});
