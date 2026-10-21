import { screen } from "@testing-library/react";
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
      expect(screen.getByText("Leyendo")).toBeInTheDocument();
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
