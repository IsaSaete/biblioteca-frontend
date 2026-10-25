import { screen, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { renderRoutes } from "../../../../test/renderRoutes";
import { server } from "../../../../test/server";
import LibraryPage from "./LibraryPage";

const baseUrl = import.meta.env.VITE_API_URL ?? "";
const routes = [{ path: "/library", element: <LibraryPage /> }];

const entry = (id: number, status = "read") => ({
  book: {
    id: `book-${id}`,
    title: `Libro ${id}`,
    authors: ["Autora Uno", "Autor Dos"],
    publisher: "Editorial",
  },
  ejemplar: {
    id: `ejemplar-${id}`,
    bookId: `book-${id}`,
    status,
    favorite: false,
    createdAt: "2026-10-20T10:00:00.000Z",
  },
});

const mockSession = (libraryView?: "grid" | "list") =>
  server.use(
    http.get(`${baseUrl}/auth/me`, () =>
      HttpResponse.json({
        user: {
          id: "user-1",
          name: "Isa",
          email: "isa@example.com",
          onboardingCompleted: true,
          ...(libraryView && { preferences: { libraryView } }),
        },
      }),
    ),
  );

const mockBooks = () =>
  server.use(
    http.get(`${baseUrl}/books`, () =>
      HttpResponse.json({
        items: [entry(1, "read"), entry(2, "reading")],
        nextCursor: null,
        total: 2,
      }),
    ),
  );

const mockSavePreferences = (status = 200) => {
  const bodies: unknown[] = [];
  server.use(
    http.patch(`${baseUrl}/auth/me/preferences`, async ({ request }) => {
      bodies.push(await request.json());
      // Para poder ver el cambio al instante antes de que llegue la respuesta.
      await delay(150);
      return status === 200
        ? HttpResponse.json({ preferences: { libraryView: "list" } })
        : HttpResponse.json(
            { error: { code: "INTERNAL", message: "Error" } },
            { status },
          );
    }),
  );
  return bodies;
};

describe("Given the view of the library", () => {
  describe("When the account has no saved view", () => {
    it("Then the library shows the cover grid and offers the list", async () => {
      mockSession();
      mockBooks();

      renderRoutes(routes, ["/library"]);

      expect(
        await screen.findByRole("button", { name: "Ver en lista" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("link", { name: /^Libro 1,/ }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Leído")).not.toBeInTheDocument();
    });
  });

  describe("When the user switches to the list", () => {
    it("Then each book is a row with its reading status, and the choice is saved", async () => {
      mockSession("grid");
      mockBooks();
      const saved = mockSavePreferences();

      const { user } = renderRoutes(routes, ["/library"]);
      await user.click(
        await screen.findByRole("button", { name: "Ver en lista" }),
      );

      expect(
        await screen.findByRole("button", { name: "Ver en cuadrícula" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("link", {
          name: "Libro 1, Autora Uno, Autor Dos, Leído",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", {
          name: "Libro 2, Autora Uno, Autor Dos, Leyendo",
        }),
      ).toBeInTheDocument();
      await waitFor(() => expect(saved).toEqual([{ libraryView: "list" }]));
    });
  });

  describe("When the account saved the list view", () => {
    it("Then the library opens as a list", async () => {
      mockSession("list");
      mockBooks();

      renderRoutes(routes, ["/library"]);

      expect(
        await screen.findByRole("link", {
          name: "Libro 1, Autora Uno, Autor Dos, Leído",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Ver en cuadrícula" }),
      ).toBeInTheDocument();
    });
  });

  describe("When saving the view fails", () => {
    it("Then the library goes back to the previous view", async () => {
      mockSession("grid");
      mockBooks();
      mockSavePreferences(500);

      const { user } = renderRoutes(routes, ["/library"]);
      await user.click(
        await screen.findByRole("button", { name: "Ver en lista" }),
      );

      // Primero se ve la lista (cambio al instante) y, al fallar, se revierte.
      await screen.findByRole("button", { name: "Ver en cuadrícula" });
      expect(
        await screen.findByRole("button", { name: "Ver en lista" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /Leído$/ }),
      ).not.toBeInTheDocument();
    });
  });
});
